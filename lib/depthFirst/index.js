var sep = require('path').sep;

var Fifo = require('../Fifo');
var filter = require('./filter');
var stat = require('./stat');

function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + sep + right;
}

function every(fns, iterator, entry, item, callback) {
  fns[0](iterator, entry, item, function cb1(err, keep) {
    if (err || !keep) return callback(err);
    fns[1](iterator, entry, item, callback);
  });
}
var statFilter = [stat, filter];
var filterStat = [filter, stat];

module.exports = function path(iterator, item, callback) {
  var entry = {};
  if (item.basename.name) {
    entry.basename = item.basename.name;
    entry.stats = item.basename;
  } else entry.basename = item.basename;
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(iterator.root, entry.path);

  // memory release
  var depth = item.depth;
  item = null;

  // choose an order of operations
  every(iterator.options.stats ? statFilter : filterStat, iterator, entry, depth, function filterAndStatsCallback(err, keep) {
    if (err) return callback(err);
    if (iterator.done || !keep) return callback();
    if (!entry.stats.isDirectory()) return callback(null, entry);

    // get files in this directory
    iterator.options.readdir(entry.fullPath, function readdirCallback(err, files) {
      if (err) return callback(err);
      if (!iterator.done && files.length) iterator.stack.push({ path: entry.path, depth: depth + 1, files: Fifo.lifoFromArray(files) });
      return callback(null, entry);
    });
  });
};
