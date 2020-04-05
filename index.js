var fs = require('fs');
var path = require('path');
var Stack = require('stack-lifo');
var fifo = require('fifo');
var joinDeep = require('join-deep');

var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_STAT = 'lstat';
var ACCEPTABLE_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

function processError(err, callback) {
  if (!~ACCEPTABLE_ERRORS.indexOf(err.code)) return callback(err);
  callback();
}

function processNext() {
  var self = this;

  if (!this.queued.length) return;

  if (this.stack.isEmpty()) {
    if (this.processingCount <= 0) {
      while (this.queued.length) this.queued.shift()(null, { done: true });
    }
    return;
  }

  var callback = this.queued.shift();
  this.processingCount++;
  this.stack.pop()(function (err, result) {
    self.processingCount--;
    if (err) return callback(err);

    // didn't get a result, try again
    if (!result) self.queued.unshift(callback);
    else callback(null, result); // return result

    processNext.call(self); // keep emptying queue
  });

  processNext.call(this); // keep emptying queue
};

function processFilter(relativePath, stat, callback) {
  if (!this.options.filter) return callback(null, true);
  var self = this;

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    self.options.async ? self.options.filter(relativePath, stat, callbackWrapper) : getKeep(self.options.filter(relativePath, stat), callbackWrapper);
  } catch (err) {
    callback(err);
  }
};

function processPath(paths, callback) {
  var self = this;
  var entry = { relativePath: joinDeep(paths, path.sep) };
  entry.fullPath = path.join(this.cwd, entry.relativePath);

  fs[this.options.stat](entry.fullPath, function (err1, stat) {
    if (err1) return processError(err1, callback);
    entry.stat = stat;

    processFilter.call(self, entry.relativePath, stat, function (err2, keep) {
      if (err2) return callback(err2);
      if (!keep) return callback();

      if (stat.isDirectory()) processDirectory.call(self, paths, entry, callback);
      else processFile.call(self, paths, entry, callback);
    });
  });
};

function processFile(paths, entry, callback) {
  return callback(null, { done: false, value: entry });
}

function processDirectory(paths, entry, callback) {
  var self = this;

  self.options.fs.realpath(entry.fullPath, function (err1, realPath) {
    if (err1) return processError(err1, callback);

    fs.readdir(realPath, function (err2, names) {
      if (err2) return processError(err2, callback);

      var nextPaths = entry.fullPath === realPath ? paths : [realPath];
      if (names.length) self.stack.push(processNextDirectoryEntry.bind(self, nextPaths, names.reverse()));
      return callback(null, { done: false, value: entry });
    });
  });
}

function processNextDirectoryEntry(paths, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) this.stack.push(processNextDirectoryEntry.bind(this, paths, names));
  processPath.call(this, [paths, name], callback);
};

function getRealCWD(callback) {
  if (this.realCWD) return callback(null, this.realCWD);
  var self = this;

  this.options.fs.realpath(this.cwd, function (err, realCWD) {
    if (err) return callback(err);

    self.realCWD = realCWD;
    callback(null, realCWD);
  });
};

function Iterator(cwd, options) {
  options = options || {};
  this.options = {
    filter: options.filter,
    async: options.async,
    fs: options.fs || fs,
    stat: options.stat || DEFAULT_STAT,
  };

  this.cwd = cwd;
  this.stack = new Stack();
  this.stack.push(processPath.bind(this, []));
  this.processingCount = 0;
  this.queued = fifo();
}

Iterator.prototype.next = function (callback) {
  if (typeof callback === 'function') {
    this.queued.push(callback);
    processNext.call(this);
  } else {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.next(function (err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  }
};

module.exports = Iterator;
