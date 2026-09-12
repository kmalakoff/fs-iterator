var path = require('path');
var joinDeep = require('join-deep');

var processFilter = require('./processFilter');

module.exports = function processRoot(iterator, root, callback) {
  iterator.options.fs.realpath(root, function (err1, realRoot) {
    if (err1) return callback(err1);
    processPath(iterator, realRoot, [], 0, function (err) {
      callback(err);
    });
  });
};

function processPath(iterator, realRoot, paths, depth, callback) {
  var entry = {};
  entry.path = joinDeep(paths, path.sep);
  entry.fullPath = path.join(realRoot, entry.path);
  entry.basename = paths.length > 1 ? paths[1] : '';

  iterator.options.stat(entry.fullPath, function (err, stats) {
    if (err) return callback(err);
    entry.stats = stats;

    if (stats.isDirectory()) processDirectory(iterator, realRoot, paths, depth, entry, callback);
    else processFile(iterator, entry, callback);
  });
}

function processFile(iterator, entry, callback) {
  processFilter(iterator, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    callback(null, entry);
  });
}

function processDirectory(iterator, realRoot, paths, depth, entry, callback) {
  if (depth > iterator.options.depth) return callback(null, entry);

  processFilter(iterator, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    iterator.options.fs.realpath(entry.fullPath, function (err1, realFullPath) {
      if (err1) return callback(err1);

      iterator.options.fs.readdir(realFullPath, function (err2, names) {
        if (err2) return callback(err2);

        if (names.length) {
          if (entry.fullPath === realFullPath) {
            iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, realRoot, paths, ++depth, names.reverse()));
          } else {
            iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, realFullPath, [], ++depth, names.reverse()));
          }
        }
        return callback(null, entry);
      });
    });
  });
}

function processNextDirectoryEntry(iterator, realRoot, paths, depth, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) iterator.stack.push(processNextDirectoryEntry.bind(null, iterator, realRoot, paths, depth, names));
  processPath(iterator, realRoot, [paths, name], depth, callback);
}
