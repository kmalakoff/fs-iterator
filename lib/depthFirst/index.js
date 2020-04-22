var path = require('path');
var fs = require('fs');

var Fifo = require('../Fifo');
var filter = require('./filter');
var stat = require('./stat');

function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + path.sep + right;
}

function every(fns, entry, item, options, callback) {
  fns[0](entry, item, options, function cb1(err, keep) {
    if (err || !keep) return callback(err);
    fns[1](entry, item, options, callback);
  });
}

var statFilter = [stat, filter];
var filterStat = [filter, stat];

module.exports = function pathDf(item, options, callback) {
  var entry = {};
  entry.basename = item.basename;
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(item.root, entry.path);

  // memory release
  var root = item.root;
  var depth = item.depth;
  item = null;

  // choose an order
  every(options.stats ? statFilter : filterStat, entry, depth, options, function filterAndStatsCallback(err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();
    if (!entry.stats.isDirectory()) return callback(null, entry);

    // get files
    fs.readdir(entry.fullPath, function readdirCallback(err, files) {
      if (err) return callback(err);

      if (files.length) options.push({ root: root, path: entry.path, depth: depth + 1, files: Fifo.lifoFromArray(files) });
      return callback(null, entry);
    });
  });
};
