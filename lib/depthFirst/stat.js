module.exports = function stat(entry, item, options, callback) {
  options.stat(entry.fullPath, function statCallback(err, stats) {
    if (err) return callback(err);
    if (stats.isDirectory() && item.depth > options.depth) return callback(null, false);
    entry.stats = stats;
    return callback(null, true);
  });
};
