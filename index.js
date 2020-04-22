var fs = require('fs');
var path = require('path');
var EventEmitter = require('eventemitter3');
var inherits = require('inherits');
var createProcesor = require('maximize-iterator/lib/createProcessor');

var Fifo = require('./lib/Fifo');
var PathStack = require('./lib/PathStack');
var processOrQueue = require('./lib/processOrQueue');

var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = Infinity;
var DEFAULT_LIMIT = Infinity;
var EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];
var DIRENT_SUPPORTED = 'Dirent' in fs;

function Iterator(root, options) {
  EventEmitter.call(this);
  var self = this;

  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    stats: options.stats || options.alwaysStat,
    filter: options.filter,
    callbacks: options.callbacks || options.async,
    push: function stackPush(item) {
      if (!self.done) self.stack.push(item);
    },
  };

  this.options.dirent = !this.options.stats && DIRENT_SUPPORTED;
  this.options.readdir = fs.readdir;
  if (this.options.dirent) {
    var readdirOptions = { encoding: 'utf8', withFileTypes: this.options.dirent };
    this.options.readdir = function readdir(fullPath, callback) {
      fs.readdir(fullPath, readdirOptions, callback);
    };
  }

  this.options.statName = options.stat || DEFAULT_STAT;
  this.options.stat = fs[this.options.statName];
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
  this.processors = new Fifo();
  this.stack = new PathStack(this);
  this.stack.push({ root: root, path: null, basename: '', depth: 0 });
  this.processing = 0;
}
inherits(Iterator, EventEmitter);

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

Iterator.prototype.destroy = function destroy() {
  if (this.destroyed) throw new Error('Already destroyed');
  this.destroyed = true;
  this.done = true;
  this._events = null;
  this._eventsCount = 0;
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
