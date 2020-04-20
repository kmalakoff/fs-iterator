var path = require('path');
var every = require('every-async');
var join = require('join-deep');

var Fifo = require('../Fifo');
var filter = require('./filter');
var stat = require('./stat');

module.exports = function pathd(item, options, callback) {
  var entry = {};
  entry.basename = item.paths.length ? item.paths[item.paths.length - 1] : '';
  entry.path = join(item.paths, path.sep);
  entry.fullPath = entry.path ? item.root + path.sep + entry.path : item.root;

  // choose an order
  every(options.alwaysStat ? [stat, filter] : [filter, stat], entry, item, options, function filterAndStatsCallback(err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    if (!entry.stats.isDirectory()) return callback(null, entry);

    // a directory, get files
    options.fs.readdir(entry.fullPath, function readdirCallback(err, files) {
      if (err) return callback(err);

      if (files.length) options.push({ root: item.root, paths: item.paths, depth: item.depth + 1, files: Fifo.lifoFromArray(files) });
      return callback(null, entry);
    });
  });
};
