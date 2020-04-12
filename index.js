var fs = require('fs');
var path = require('path');
var EventEmitter = require('eventemitter3');
var inherits = require('inherits');
var Lifo = require('stack-lifo');
var Fifo = require('fifo');
var callOnce = require('call-once-next-tick');

var depthFirst = require('./lib/depthFirst');
var forEach = require('./lib/forEach');
var next = require('./lib/next');
var push = require('./lib/push');

var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = Infinity;
var DEFAULT_LIMIT = Infinity;
var EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

function Iterator(root, options) {
  EventEmitter.call(this);

  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    filter:
      options.filter ||
      function (entry, callback) {
        if (options.async) return callback(null, true);
        return true;
      },
    async: options.async,
    fs: options.fs || fs,
    push: push.bind(null, this),
  };

  this.options.stat = this.options.fs[options.stat || DEFAULT_STAT];
  if (process.platform === 'win32' && fs.stat.length === 3) {
    var stat = this.options.stat;
    this.options.stat = function (path) {
      stat(path, { bigint: true });
    };
  }
  this.options.error =
    options.error ||
    function (err) {
      if (!~EXPECTED_ERRORS.indexOf(err.code)) return false;
      this.emit('error', err);
      return true;
    }.bind(this);

  this.root = path.resolve(root);
  this.stack = new Lifo();
  this.stack.push(depthFirst.bind(null, this.options, root));
  this.processingCount = 0;
  this.queued = new Fifo();
  this.waiters = [];
}
inherits(Iterator, EventEmitter);

Iterator.prototype.next = function (callback) {
  if (typeof callback === 'function') {
    this.queued.push(callback);
    next(this);
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.next(function (err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
};

Iterator.prototype.forEach = function (fn, options, callback) {
  if (typeof fn !== 'function') throw new Error('Missing each function');
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') {
    options = options || {};
    options = {
      each: fn,
      async: options.async,
      concurrency: options.concurrency || DEFAULT_CONCURRENCY,
      limit: options.limit || DEFAULT_LIMIT,
      error:
        options.error ||
        function () {
          return true; // default is exit on error
        },
      total: 0,
      counter: 0,
    };

    return forEach(this, options, callOnce(callback));
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.forEach(fn, options, function (err, done) {
        err ? reject(err) : resolve(done);
      });
    });
  }
};

Iterator.prototype.destroy = function (callback) {
  // TODO: destroy inflight
  this.destroyed = true;
  callback();
};

if (typeof Symbol !== 'undefined' && Symbol.asyncIterator) {
  Iterator.prototype[Symbol.asyncIterator] = function () {
    var self = this;
    return { next: nextPromise, return: returnPromise };

    function nextPromise() {
      return new Promise(function (resolve, reject) {
        self.next(function (err, value) {
          err ? reject(err) : resolve({ value: value, done: value === null });
        });
      });
    }

    function returnPromise() {
      return new Promise(function (resolve, reject) {
        self.destroy(function (err) {
          err ? reject(err) : resolve();
        });
      });
    }
  };
}

module.exports = Iterator;
