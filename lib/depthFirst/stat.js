const fs = require('fs');

module.exports = function stat(iterator, entry, callback) {
  if (!entry.stats) {
    return iterator.options.stat(entry.fullPath, function statCallback(err, stats) {
      if (err) return callback(err);
      entry.stats = stats;
      callback();
    });
  }
  // dirent returned the link stats and need the real stats
  else if (entry.stats.isSymbolicLink()) {
    fs.realpath(entry.fullPath, function realpathCallback(err, realpath) {
      if (err) return callback(err);

      iterator.options.stat(realpath, function realStatCallback(err, realStats) {
        if (err) return callback(err);
        entry.realStats = realStats;
        callback();
      });
    });
  } else callback();
};
