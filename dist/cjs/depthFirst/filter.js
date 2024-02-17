"use strict";
var compat = require("async-compat");
module.exports = function filter(iterator, entry, callback) {
    if (!iterator.options.filter) return callback(null, true);
    compat.asyncFunction(iterator.options.filter, iterator.options.callbacks, entry, function filterCallback(err, keep) {
        if (err) return callback(err);
        if (!compat.defaultValue(keep, true)) return callback();
        callback(null, true);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}