var compat = require('async-compatibilty');

module.exports = function processFilterAndStats(entry, item, options, callback) {
  // stat first and pass stats to filter
  if (options.alwaysStat) {
    options.stat(entry.fullPath, function (err, stats) {
      if (err) return callback(err);
      entry.stats = stats;

      // too deep
      if (stats.isDirectory() && item.depth > options.depth) return callback(null, false);

      // filter
      compat.asyncFunction(options.filter, options.async, entry, function (err, keep) {
        if (err) return callback(err);
        if (!compat.defaultValue(keep, true)) return callback(null, false);
        callback(null, true);
      });
    });
  }
  // first filter and then get stats
  else {
    // filter
    compat.asyncFunction(options.filter, options.async, entry, function (err, keep) {
      if (err) return callback(err);
      if (!compat.defaultValue(keep, true)) return callback(null, false);

      // stats
      options.stat(entry.fullPath, function (err, stats) {
        if (err) return callback(err);
        entry.stats = stats;

        // too deep
        if (stats.isDirectory() && item.depth > options.depth) return callback(null, false);

        callback(null, true);
      });
    });
  }
};
