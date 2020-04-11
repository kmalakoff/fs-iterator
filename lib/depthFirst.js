var path = require('path');
var joinDeep = require('join-deep');

var filter = require('./filter');

module.exports = function processRoot(options, root, callback) {
  options.fs.realpath(root, function (err1, realRoot) {
    if (err1) return callback(err1);
    processPath(options, realRoot, [], 0, callback);
  });
};

function processPath(options, realRoot, paths, depth, callback) {
  var entry = {};
  entry.path = joinDeep(paths, path.sep);
  entry.fullPath = path.join(realRoot, entry.path);
  entry.basename = paths.length > 0 ? paths[paths.length - 1] : '';

  options.stat(entry.fullPath, function (err, stats) {
    if (err) return callback(err);
    entry.stats = stats;

    if (stats.isDirectory()) processDirectory(options, realRoot, paths, depth, entry, callback);
    else processFile(options, entry, callback);
  });
}

function processFile(options, entry, callback) {
  filter(options, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    callback(null, entry);
  });
}

function processDirectory(options, realRoot, paths, depth, entry, callback) {
  if (depth > options.depth) return callback();

  filter(options, entry, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    options.fs.realpath(entry.fullPath, function (err1, realFullPath) {
      if (err1) return callback(err1);

      options.fs.readdir(realFullPath, function (err2, names) {
        if (err2) return callback(err2);

        if (names.length) {
          if (entry.fullPath === realFullPath) {
            options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, ++depth, names.reverse()));
          } else {
            options.push(processNextDirectoryEntry.bind(null, options, realFullPath, [], ++depth, names.reverse()));
          }
        }
        return callback(null, entry);
      });
    });
  });
}

function processNextDirectoryEntry(options, realRoot, paths, depth, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, depth, names));
  processPath(options, realRoot, [paths, name], depth, callback);
}
