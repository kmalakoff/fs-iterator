var path = require('path');
var joinDeep = require('join-deep');

var toLifo = require('./toLifo');
var processFilterAndStats = require('./processFilterAndStats');

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
        if (entry.fullPath === realFullPath) {
          options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, ++depth, toLifo(names)));
        } else {
          options.push(processNextDirectoryEntry.bind(null, options, realFullPath, [], ++depth, toLifo(names)));
        }
      }
      return callback(null, entry);
    });
  });
}

function processNextDirectoryEntry(options, realRoot, paths, depth, names, callback) {
  if (!names.length) return callback();
  var name = names.pop();
  if (names.length) options.push(processNextDirectoryEntry.bind(null, options, realRoot, paths, depth, names));
  processPath(options, realRoot, [paths, name], depth, callback);
}

module.exports = processPath;
