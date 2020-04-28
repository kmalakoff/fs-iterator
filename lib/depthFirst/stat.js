var fsCompat = require('../fs-compat');

module.exports = function stat(iterator, entry, callback) {
  var stat = iterator.options.lstat ? fsCompat.lstat : fsCompat.stat;

  if (!entry.stats) {
    return stat(entry.fullPath, iterator.options.stat, function statCallback(err, stats) {
      if (err) return callback(err);
      entry.stats = stats;
      callback();
    });
  }

  // dirent returned the link stats and need the real stats
  else if (entry.stats.isSymbolicLink()) {
    fsCompat.lstatReal(entry.fullPath, iterator.options.stat, function lstatRealCallback(err, realStats) {
      if (err) return callback(err);
      entry.realStats = realStats;
      callback();
    });
  } else callback();
};
