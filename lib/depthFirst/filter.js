var compat = require('async-compat');

module.exports = function filter(iterator, entry, depth, callback) {
  if (!iterator.options.filter) return callback(null, true);

  compat.asyncFunction(iterator.options.filter, iterator.options.callbacks, entry, function filterCallback(err, keep) {
    if (err) return callback(err);
    if (!compat.defaultValue(keep, true)) return callback();
    callback(null, true);
  });
};
