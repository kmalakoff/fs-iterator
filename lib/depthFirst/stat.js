const fs = require('fs');

var STAT = 'stat';

function stats(entry, options, callback) {
  if (!entry.stats) {
    return options.stat(entry.fullPath, function statCallback(err, stats) {
      if (err) return callback(err);
      entry.stats = stats;
      callback();
    });
  } else if (entry.stats.isSymbolicLink() && options.statName === STAT) {
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

module.exports = function stat(entry, depth, options, callback) {
  stats(entry, options, function statCallback(err) {
    if (err) return callback(err);
    if (entry.stats.isDirectory() && depth > options.depth) return callback(null, false);
    return callback(null, true);
  });
};
