var filterAndStats = require('./filterAndStats');
var join = require('./join');
var Fifo = require('../Fifo');

module.exports = function path(item, options, callback) {
  var entry = {};
  entry.basename = item.basename;
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(item.root, entry.path);

  filterAndStats(entry, item, options, function filterAndStatsCallback(err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    if (!entry.stats.isDirectory()) return callback(null, entry);

    // get files
    options.fs.readdir(entry.fullPath, function readdirCallback(err, files) {
      if (err) return callback(err);

      if (files.length) options.push({ root: item.root, path: entry.path, depth: item.depth + 1, files: Fifo.lifoFromArray(files) });
      return callback(null, entry);
    });
  });
};
