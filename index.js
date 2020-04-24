var fs = require('fs');
var path = require('path');
var createProcesor = require('maximize-iterator/lib/createProcessor');

var Fifo = require('./lib/Fifo');
var PathStack = require('./lib/PathStack');
var processOrQueue = require('./lib/processOrQueue');

function Iterator(root, options) {
  var self = this;

  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    filter: options.filter || null,
    callbacks: options.callbacks || options.async || false,
    lstat: options.lstat || false,
  };

  // use dirent vs stat each file
  if (fs.Dirent && !options.alwaysStat) {
    var readdirOptions = { encoding: 'utf8', withFileTypes: true };
    this.options.readdir = function readdir(fullPath, callback) {
      fs.readdir(fullPath, readdirOptions, callback);
    };
  } else this.options.readdir = fs.readdir;

  // platform compatibility
  if (process.platform === 'win32' && fs.stat.length === 3) {
    var stat = fs[this.options.lstat ? 'lstat' : 'stat'];
    this.options.stat = function windowsStat(path) {
      stat(path, { bigint: true });
    };
  } else this.options.stat = fs[this.options.lstat ? 'lstat' : 'stat'];

  this.options.error =
    options.error ||
    function defaultError(err) {
      return ~Iterator.EXPECTED_ERRORS.indexOf(err.code); // skip known issues
    };

  this.root = path.resolve(root);
  this.queued = new Fifo();
  this.processors = new Fifo();
  this.stack = new PathStack(this);

  this.processing = 1; // fetch first
  this.options.readdir(this.root, function (err, files) {
    self.processing--;
    if (self.done) return;

    if (err) self.stack.push({ error: err });
    else if (files.length) self.stack.push({ path: null, depth: 0, files: Fifo.lifoFromArray(files) });
  });
}

Iterator.EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

Iterator.prototype.destroy = function destroy() {
  if (this.destroyed) throw new Error('Already destroyed');
  this.destroyed = true;

  // iterator
  this.done = true;
  this.options = null;
  this.root = null;
  while (this.processors.length) this.processors.pop()(true);
  this.processors = null;
  while (this.queued.length) this.queued.pop()(null, null);
  this.queued = null;
  this.processMore = null;
  this.stack.destroy();
  this.stack = null;
};

Iterator.prototype.next = function next(callback) {
  if (typeof callback === 'function') {
    processOrQueue(this, callback);
  } else {
    var self = this;
    return new Promise(function nextPromise(resolve, reject) {
      self.next(function nextCallback(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
};

Iterator.prototype.forEach = function forEach(fn, options, callback) {
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
      callbacks: options.callbacks || options.async,
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
      if (!self.destroyed) self.processors.discard(processor);
      processor = null;
      options = null;
      return callback(err, self.done ? true : !self.stack.length);
    });
    this.processors.push(processor);
    processor();
  } else {
    return new Promise(function forEachPromise(resolve, reject) {
      self.forEach(fn, options, function forEachCallback(err, done) {
        err ? reject(err) : resolve(done);
      });
    });
  }
};

if (typeof Symbol !== 'undefined' && Symbol.asyncIterator) {
  Iterator.prototype[Symbol.asyncIterator] = function asyncIterator() {
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

module.exports = Iterator;
