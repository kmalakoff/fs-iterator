var compat = require('async-compatibilty');

function all(fns, callback) {
  var index = -1;
  function next(err, result) {
    if (err || !result || ++index >= fns.length) return callback(err, result);
    fns[index](next);
  }
  next(null, true);
}

module.exports = function filterAndStats(entry, item, options, callback) {
  function stats(callback) {
    options.stat(entry.fullPath, function statCallback(err, stats) {
      if (err) return callback(err);
      if (stats.isDirectory() && item.depth > options.depth) return callback(null, false);
      entry.stats = stats;
      return callback(null, true);
    });
  }

  function filter(callback) {
    compat.asyncFunction(options.filter, options.async, entry, function filterCallback(err, keep) {
      if (err) return callback(err);
      if (!compat.defaultValue(keep, true)) return callback(null, false);
      callback(null, true);
    });
  }

  // choose an order
  all(options.alwaysStat ? [stats, filter] : [filter, stats], callback);
};
