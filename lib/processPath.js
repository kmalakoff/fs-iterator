var path = require('path');
var joinDeep = require('join-deep');

var toLifo = require('./toLifo');
var processFilterAndStats = require('./processFilterAndStats');

module.exports = function processPath(item, options, callback) {
  var entry = {};
  entry.path = joinDeep(item.paths, path.sep);
  entry.fullPath = path.join(item.root, entry.path);
  entry.basename = item.paths.length > 0 ? item.paths[item.paths.length - 1] : '';

  processFilterAndStats(entry, item, options, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    if (entry.stats.isDirectory()) processDirectory(entry, item, options, callback);
    else callback(null, entry);
  });
};

function processDirectory(entry, item, options, callback) {
  options.fs.realpath(entry.fullPath, function (err, realFullPath) {
    if (err) return callback(err);

    options.fs.readdir(realFullPath, function (err, names) {
      if (err) return callback(err);

      if (names.length) {
        if (entry.fullPath === realFullPath) {
          options.push({ root: item.root, paths: item.paths, depth: item.depth + 1, names: toLifo(names) });
        } else {
          options.push({ root: realFullPath, paths: [], depth: item.depth + 1, names: toLifo(names) });
        }
      }
      return callback(null, entry);
    });
  });
}
