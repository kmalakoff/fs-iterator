var path = require('path');
var joinDeep = require('join-deep');

var processFilter = require('./processFilter');

module.exports = function processRoot(iterator, root, callback) {
  iterator.options.fs.realpath(root, function (err1, realRoot) {
    if (err1) return callback(err1);
    processPath(iterator, [realRoot], 0, function (err) {
      callback(err);
    });
  });
};

function processPath(iterator, paths, depth, callback) {
  // TODO: optimize paths
  var entry = { fullPath: joinDeep(paths, path.sep) };
  entry.path = path.relative(iterator.root, entry.fullPath);
  entry.basename = path.basename(entry.fullPath);

  iterator.options.stat(entry.fullPath, function (err1, stats) {
    if (err1) return callback(err1);
    entry.stats = stats;

    if (stats.isDirectory()) processDirectory(iterator, paths, depth, entry, callback);
    else processFile(iterator, paths, entry, callback);
  });
}

function processFile(iterator, paths, entry, callback) {
  processFilter(iterator, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    callback(null, entry);
  });
}

function processDirectory(iterator, paths, depth, entry, callback) {
  if (depth > iterator.options.depth) return callback(null, entry);

  processFilter(iterator, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    iterator.options.fs.realpath(entry.fullPath, function (err1, realPath) {
      if (err1) return callback(err1);

      iterator.options.fs.readdir(realPath, function (err2, names) {
        if (err2) return callback(err2);

        var nextPaths = entry.fullPath === realPath ? paths : [realPath];
        if (names.length) {
          iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, nextPaths, ++depth, names.reverse()));
        }
        return callback(null, entry);
      });
    });
  });
}

function processNextDirectoryEntry(iterator, paths, depth, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, paths, depth, names));
  processPath(iterator, [paths, name], depth, callback);
}
