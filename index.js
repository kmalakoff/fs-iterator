var fs = require('fs');
var path = require('path');
var Stack = require('stack-lifo');
var fifo = require('fifo');
var callOnce = require('call-once-next-tick');

var depthFirst = require('./lib/depthFirst');
var each = require('./lib/each');
var next = require('./lib/next');
var push = require('./lib/push');

var DEFAULT_STAT = 'lstat';
var DEFAULT_LIMIT = Infinity;
var DEFAULT_CONCURRENCY = Infinity;

function Iterator(root, options) {
  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    filter: options.filter,
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

  this.root = path.resolve(root);
  this.stack = new Stack();
  this.stack.push(depthFirst.bind(null, this.options, root));
  this.processingCount = 0;
  this.queued = fifo();
  this.waiters = [];
}

Iterator.prototype.next = function (callback) {
  if (typeof callback === 'function') {
    this.queued.push(callback);
    next(this);
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.next(
        callOnce(function (err, result) {
          err ? reject(err) : resolve(result);
        })
      );
    });
  }
};

Iterator.prototype.each = function (fn, options, callback) {
  if (typeof fn !== 'function') throw new Error('Missing each function');
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback === 'function') {
    options = options || {};
    options = {
      concurrency: options.concurrency || DEFAULT_CONCURRENCY,
      limit: options.limit || DEFAULT_LIMIT,
      each: fn,
      total: 0,
      counter: 0,
    };

    return each(this, options, callback);
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.each(fn, options, function (err) {
        err ? reject(err) : resolve();
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
