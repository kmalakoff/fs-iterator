const fs = require('fs');

var STAT = 'stat';

function stats(entry, options, callback) {
  if (!entry.stats) {
    return options.stat(entry.fullPath, function statCallback(err, stats) {
      if (err) return callback(err);
      entry.stats = stats;
      callback(null, entry.stats);
    });
  } else if (entry.stats.isSymbolicLink() && options.statName === STAT) {
    fs.realpath(entry.fullPath, function realpathCallback(err, realpath) {
      if (err) return callback(err);
      fs.lstat(realpath, function lstatCallback(err, realStats) {
        if (err) return callback(err);
        callback(null, realStats);
      });
    });
  } else callback(null, entry.stats);
}

module.exports = function stat(entry, depth, options, callback) {
  stats(entry, options, function statCallback(err, stats) {
    if (err) return callback(err);
    entry.isDirectory = stats.isDirectory();
    if (entry.isDirectory && depth > options.depth) return callback(null, false);
    return callback(null, true);
  });
};
