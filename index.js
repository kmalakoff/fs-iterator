var fs = require('fs');
var path = require('path');
var EventEmitter = require('eventemitter3');
var inherits = require('inherits');
var nextTick = require('next-tick');
var createProcesor = require('maximize-iterator/lib/createProcessor');

var Fifo = require('./lib/Fifo');
var next = require('./lib/next');
var PathStack = require('./lib/PathStack');

var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = Infinity;
var DEFAULT_LIMIT = Infinity;
var EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

function Iterator(root, options) {
  EventEmitter.call(this);
  var self = this;

  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    stats: options.stats || options.alwaysStat,
    filter: options.filter,
    callbacks: options.callbacks || options.async,
    fs: options.fs || fs,
    push: function stackPush(item) {
      if (self.options) self.stack.push(item);
    },
  };

  this.options.stat = this.options.fs[options.stat || DEFAULT_STAT];
  if (process.platform === 'win32' && fs.stat.length === 3) {
    var stat = this.options.stat;
    this.options.stat = function windowsStat(path) {
      stat(path, { bigint: true });
    };
  }
  this.options.error =
    options.error ||
    function defaultError(err) {
      if (!~EXPECTED_ERRORS.indexOf(err.code)) return false;
      this.emit('error', err);
      return true;
    }.bind(this);

  this.root = path.resolve(root);
  this.queued = new Fifo();
  this.processing = new Fifo();
  this.processors = new Fifo();
  this.processMore = next(this);
  this.stack = new PathStack(this);
  this.stack.push({ root: root, path: null, basename: '', depth: 0 });
}
inherits(Iterator, EventEmitter);

Iterator.prototype.next = function next(callback) {
  if (typeof callback === 'function') {
    if (!this.options) return callback(null, null);
    this.queued.unshift(callback);
    this.processMore();
  } else {
    var self = this;
    return new Promise(function nextPromise(resolve, reject) {
      self.next(function nextCallback(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
};

Iterator.prototype.forEach = function forEach(fn, options, callback, skipNextTick) {
  var self = this;
  if (typeof fn !== 'function') throw new Error('Missing each function');
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') {
    if (!this.options) return callback();
    options = options || {};
    options = {
      each: fn,
      callbacks: options.callbacks || options.async,
      concurrency: options.concurrency || DEFAULT_CONCURRENCY,
      limit: options.limit || DEFAULT_LIMIT,
      error:
        options.error ||
        function defaultError() {
          return true; // default is exit on error
        },
      total: 0,
      counter: 0,
      stop: function stop() {
        return !self.options || self.queued.length >= self.stack.length;
      },
    };

    var processor = createProcesor(this.next.bind(this), options, function processorCallback(err) {
      if (self.options) self.processors.discard(processor);
      options = null;
      processor = null;
      skipNextTick ? callback(err, !self.options ? true : !self.stack.length) : nextTick(callback.bind(null, err, !self.options ? true : !self.stack.length));
    });
    this.processors.push(processor);
    processor();
  } else {
    return new Promise(function forEachPromise(resolve, reject) {
      self.forEach(
        fn,
        options,
        function forEachCallback(err, done) {
          err ? reject(err) : resolve(done);
        },
        true
      );
    });
  }
};

Iterator.prototype.destroy = function destroy(clear) {
  if (!clear) {
    if (this.destroyed) throw new Error('Already destroyed');
    this.destroyed = true;
  }

  if (!this.options) return;
  this.options = null;
  while (this.stack.length) this.stack.pop();
  while (this.processors.length) this.processors.pop()(true);
  while (this.processing.length) this.processing.pop()(null, null);
  while (this.queued.length) this.queued.pop()(null, null);
  this.removeAllListeners();
  this.root = null;
  this.stack = null;
  this.processors = null;
  this.processing = null;
  this.queued = null;
  this.processMore = null;
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
