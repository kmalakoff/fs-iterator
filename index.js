var fs = require('fs');
var path = require('path');
var Stack = require('stack-lifo');
var fifo = require('fifo');
var joinDeep = require('join-deep');

var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_STAT = 'lstat';

function processRoot(iterator, root, callback) {
  iterator.options.fs.realpath(root, function (err1, realRoot) {
    if (err1) return callback(err1);
    processPath(iterator, [realRoot], function (err) {
      callback(err);
    });
  });
}

function processFilter(iterator, relativePath, stats, callback) {
  if (!iterator.options.filter) return callback(null, true);

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    var filter = iterator.options.filter;
    iterator.options.async ? filter(relativePath, stats, callbackWrapper) : getKeep(filter(relativePath, stats), callbackWrapper);
  } catch (err) {
    callback(err);
  }
}

function processPath(iterator, paths, callback) {
  // TODO: optimize paths
  var entry = { fullPath: joinDeep(paths, path.sep) };
  entry.path = path.relative(iterator.root, entry.fullPath);
  entry.basename = path.basename(entry.fullPath);

  iterator.options.stat(entry.fullPath, function (err1, stats) {
    if (err1) return callback(err1);
    entry.stats = stats;

    processFilter(iterator, entry.path, stats, function (err2, keep) {
      if (err2) return callback(err2);
      if (!keep) return callback();

      if (stats.isDirectory()) processDirectory(iterator, paths, entry, callback);
      else processFile(iterator, paths, entry, callback);
    });
  });
}

function processFile(iterator, paths, entry, callback) {
  return callback(null, entry);
}

function processDirectory(iterator, paths, entry, callback) {
  iterator.options.fs.realpath(entry.fullPath, function (err1, realPath) {
    if (err1) return callback(err1);

    fs.readdir(realPath, function (err2, names) {
      if (err2) return callback(err2);

      var nextPaths = entry.fullPath === realPath ? paths : [realPath];
      if (names.length) {
        iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, nextPaths, names.reverse()));
      }
      return callback(null, entry);
    });
  });
}

function processNextDirectoryEntry(iterator, paths, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, paths, names));
  processPath(iterator, [paths, name], callback);
}

function Iterator(root, options) {
  options = options || {};
  this.options = {
    filter: options.filter,
    async: options.async,
    fs: options.fs || fs,
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
  this.stack.push(processRoot.bind(null, this, root));
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
