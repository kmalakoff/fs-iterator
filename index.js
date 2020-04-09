var fs = require('fs');
var path = require('path');
var Stack = require('stack-lifo');
var fifo = require('fifo');

var depthFirst = require('./lib/depthFirst');

var DEFAULT_STAT = 'lstat';

function Iterator(root, options) {
  options = options || {};
  this.options = {
    depth: options.depth === undefined ? Infinity : options.depth,
    filter: options.filter,
    async: options.async,
    fs: options.fs || fs,
    push: this._push.bind(this),
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
}

Iterator.prototype.next = function (callback) {
  if (typeof callback === 'function') {
    this.queued.push(callback);
    this._processNext();
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.next(function (err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
};

Iterator.prototype._push = function (item) {
  this.stack.push(item);
};

Iterator.prototype._processNext = function () {
  if (!this.queued.length) return;

  if (this.stack.isEmpty()) {
    if (this.processingCount <= 0) {
      while (this.queued.length) this.queued.shift()(null, null);
    }
    return;
  }

  var self = this;
  var callback = this.queued.shift();
  this.processingCount++;
  this.stack.pop()(function (err, result) {
    self.processingCount--;

    // process error and then continue
    if (err) callback(err);
    // didn't get a result, try again
    else if (!result) self.queued.unshift(callback);
    // return result
    else callback(null, result);

    self._processNext(); // keep emptying queue
  });

  this._processNext(); // keep emptying queue
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
