var path = require('path');
var joinDeep = require('join-deep');
var compat = require('async-compatibilty');
var Fifo = require('fifo');

module.exports = function processRoot(options, root, callback) {
  options.fs.realpath(root, function (err1, realRoot) {
    if (err1) return callback(err1);
    processPath(options, realRoot, [], 0, callback);
  });
};

function processFilterAndStats(options, entry, depth, callback) {
  // stat first and pass stats to filter
  if (options.alwaysStat) {
    options.stat(entry.fullPath, function (err, stats) {
      if (err) return callback(err);
      entry.stats = stats;

      // too deep
      if (stats.isDirectory() && depth > options.depth) return callback(null, false);

      // filter
      compat.asyncFunction(options.filter, options.async, entry, function (err, keep) {
        if (err) return callback(err);
        if (!compat.defaultValue(keep, true)) return callback(null, false);
        callback(null, true);
      });
    });
  }
  // first filter and then get stats
  else {
    // filter
    compat.asyncFunction(options.filter, options.async, entry, function (err, keep) {
      if (err) return callback(err);
      if (!compat.defaultValue(keep, true)) return callback(null, false);

      // stats
      options.stat(entry.fullPath, function (err, stats) {
        if (err) return callback(err);
        entry.stats = stats;

        // too deep
        if (stats.isDirectory() && depth > options.depth) return callback(null, false);

        callback(null, true);
      });
    });
  }
}

function processPath(options, realRoot, paths, depth, callback) {
  var entry = {};
  entry.path = joinDeep(paths, path.sep);
  entry.fullPath = path.join(realRoot, entry.path);
  entry.basename = paths.length > 0 ? paths[paths.length - 1] : '';

  processFilterAndStats(options, entry, depth, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    if (entry.stats.isDirectory()) processDirectory(options, realRoot, paths, depth, entry, callback);
    else callback(null, entry);
  });
}

function processDirectory(options, realRoot, paths, depth, entry, callback) {
  options.fs.realpath(entry.fullPath, function (err, realFullPath) {
    if (err) return callback(err);

    options.fs.readdir(realFullPath, function (err, names) {
      if (err) return callback(err);

      if (names.length) {
        var namesQueue = new Fifo();
        names.forEach(namesQueue.push.bind(namesQueue));
        if (entry.fullPath === realFullPath) {
          options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, ++depth, namesQueue));
        } else {
          options.push(processNextDirectoryEntry.bind(null, options, realFullPath, [], ++depth, namesQueue));
        }
      }
      return callback(null, entry);
    });
  });
}

function processNextDirectoryEntry(options, realRoot, paths, depth, names, callback) {
  if (!names.length) return callback();
  var name = names.shift();
  if (names.length) options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, depth, names));
  processPath(options, realRoot, [paths, name], depth, callback);
}
