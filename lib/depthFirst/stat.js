const fs = require('fs');

var STAT = 'stat';

function stats(iterator, entry, callback) {
  if (!entry.stats) {
    return iterator.options.stat(entry.fullPath, function statCallback(err, stats) {
      if (err) return callback(err);
      entry.stats = stats;
      callback();
    });
  } else if (entry.stats.isSymbolicLink() && iterator.options.statName === STAT) {
    fs.realpath(entry.fullPath, function realpathCallback(err, realpath) {
      if (err) return callback(err);
      fs.lstat(realpath, function lstatCallback(err, realStats) {
        if (err) return callback(err);
        entry.stats = realStats;
        callback();
      });
    });
  } else callback();
}

module.exports = function stat(iterator, entry, depth, callback) {
  stats(iterator, entry, function statCallback(err) {
    if (err) return callback(err);
    if (entry.stats.isDirectory() && depth > iterator.options.depth) return callback(null, false);
    return callback(null, true);
  });
};
