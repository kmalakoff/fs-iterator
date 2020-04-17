var filterAndStats = require('./filterAndStats');
var join = require('./join');
var toLifo = require('../toLifo');

module.exports = function path(item, options, callback) {
  var entry = {};
  entry.basename = item.basename;
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(item.root, entry.path);

  filterAndStats(entry, item, options, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    if (!entry.stats.isDirectory()) return callback(null, entry);

    // get files
    options.fs.readdir(entry.fullPath, function (err, files) {
      if (err) return callback(err);

      if (files.length) options.push({ root: item.root, path: entry.path, depth: item.depth + 1, files: toLifo(files) });
      return callback(null, entry);
    });
  });
};
