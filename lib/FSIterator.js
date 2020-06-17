var fs = require('fs');
var path = require('path');
var FIFO = require('fifo');
var createProcesor = require('maximize-iterator/lib/createProcessor');

var fifoRemove = require('./fifoRemove');
var PathStack = require('./PathStack');
var processOrQueue = require('./processOrQueue');
var fsCompat = require('./fs-compat');
var drainStack = require('./drainStack');
var lifoFromArray = require('./lifoFromArray');

function FSIterator(root, options) {
  if (!(this instanceof FSIterator)) return new FSIterator(root, options);
  var self = this;

  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    filter: options.filter || null,
    callbacks: options.callbacks || options.async || false,
    lstat: options.lstat,
    readdir: { encoding: 'utf8', withFileTypes: fs.Dirent && !options.alwaysStat },
    stat: { bigint: process.platform === 'win32' },
  };

  this.options.error =
    options.error ||
    function defaultError(err) {
      return ~FSIterator.EXPECTED_ERRORS.indexOf(err.code); // skip known issues
    };

  this.root = path.resolve(root);
  this.queued = new FIFO();
  this.processors = new FIFO();
  this.stack = new PathStack();

  this.processing = 1; // fetch first
  fsCompat.readdir(this.root, this.options.readdir, function (err, files) {
    self.processing--;
    if (self.done) return;
    if (err) return self.end(err);
    if (files.length) self.push({ path: null, depth: 0, files: lifoFromArray(files) });
  });
}

FSIterator.prototype.resume = function resume() {
  drainStack(this);
};

FSIterator.EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

FSIterator.prototype.destroy = function destroy(err) {
  if (this.destroyed) throw new Error('Already destroyed');
  this.destroyed = true;
  this.end(err);
  this.options = null;
  this.processors = null;
  this.queued = null;
  this.stack = null;
};

FSIterator.prototype.push = function push(item) {
  if (this.done) return console.log('Attempting to push on a done iterator');
  this.stack.push(item);
  this.resume();
};

FSIterator.prototype.end = function end(err) {
  // if (this.done) console.log('Already ended');
  this.done = true;
  while (this.processors.length) this.processors.pop()(err || true);
  while (this.queued.length) err ? this.queued.pop()(err) : this.queued.pop()(null, null);
  while (this.stack.length) this.stack.pop();
};

FSIterator.prototype.next = function next(callback) {
  if (typeof callback === 'function') return processOrQueue(this, callback);

  var self = this;
  return new Promise(function nextPromise(resolve, reject) {
    self.next(function nextCallback(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};

FSIterator.prototype.forEach = function forEach(fn, options, callback) {
  var self = this;
  if (typeof fn !== 'function') throw new Error('Missing each function');
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') {
    if (this.done) return callback(null, true);
    options = options || {};
    options = {
      each: fn,
      callbacks: options.callbacks || options.async || false,
      concurrency: options.concurrency || Infinity,
      limit: options.limit || Infinity,
      error:
        options.error ||
        function defaultError() {
          return true; // default is exit on error
        },
      total: 0,
      counter: 0,
      stop: function stop() {
        return self.done || self.queued.length >= self.stack.length;
      },
    };

    var processor = createProcesor(this.next.bind(this), options, function processorCallback(err) {
      if (!self.destroyed) fifoRemove(self.processors, processor);
      processor = null;
      options = null;
      return callback(err, self.done ? true : !self.stack.length);
    });
    this.processors.push(processor);
    processor();
    return;
  }

  return new Promise(function forEachPromise(resolve, reject) {
    self.forEach(fn, options, function forEachCallback(err, done) {
      err ? reject(err) : resolve(done);
    });
  });
};

if (typeof Symbol !== 'undefined' && Symbol.asyncIterator) {
  FSIterator.prototype[Symbol.asyncIterator] = function asyncIterator() {
    var self = this;
    return {
      next: function next() {
        return self.next().then(function nextCallback(value) {
          return Promise.resolve({ value: value, done: value === null });
        });
      },
      destroy: function destroy() {
        self.destroy();
        return Promise.resolve();
      },
    };
  };
}

module.exports = FSIterator;
