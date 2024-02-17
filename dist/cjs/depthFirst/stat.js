"use strict";
var fsCompat = require("../fs-compat");
function ensureStat(iterator, entry, callback) {
    if (entry.stats) return callback();
    var stat = iterator.options.lstat ? fsCompat.lstat : fsCompat.stat;
    return stat(entry.fullPath, iterator.options.stat, function statCallback(err, stats) {
        if (err) return callback(err);
        entry.stats = stats;
        callback();
    });
}
module.exports = function stat(iterator, entry, callback) {
    ensureStat(iterator, entry, function ensureStatCallback(err) {
        if (err) return callback(err);
        if (!entry.stats.isSymbolicLink()) return callback();
        fsCompat.lstatReal(entry.fullPath, iterator.options.stat, function lstatRealCallback(err, realStats) {
            if (err) return callback(err);
            entry.realStats = realStats;
            callback();
        });
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}