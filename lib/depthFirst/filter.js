var compat = require('async-compatibilty');

module.exports = function filter(entry, item, options, callback) {
  compat.asyncFunction(options.filter, options.async, entry, function filterCallback(err, keep) {
    if (err) return callback(err);
    if (!compat.defaultValue(keep, true)) return callback(null, false);
    callback(null, true);
  });
};
