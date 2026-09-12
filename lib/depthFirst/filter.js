var compat = require('async-compat');

module.exports = function filter(entry, depth, options, callback) {
  if (!options.filter) return callback(null, true);

  compat.asyncFunction(options.filter, options.callbacks, entry, function filterCallback(err, keep) {
    if (err) return callback(err);
    if (!compat.defaultValue(keep, true)) return callback(null, false);
    callback(null, true);
  });
};
