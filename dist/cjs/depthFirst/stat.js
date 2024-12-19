"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return stat;
    }
});
var _index = /*#__PURE__*/ _interop_require_default(require("../fs-compat/index.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function ensureStat(iterator, entry, callback) {
    if (entry.stats) return callback();
    var stat = iterator.options.lstat ? _index.default.lstat : _index.default.stat;
    return stat(entry.fullPath, iterator.options.stat, function statCallback(err, stats) {
        if (err) return callback(err);
        entry.stats = stats;
        callback();
    });
}
function stat(iterator, entry, callback) {
    ensureStat(iterator, entry, function ensureStatCallback(err) {
        if (err) return callback(err);
        if (!entry.stats.isSymbolicLink()) return callback();
        _index.default.lstatReal(entry.fullPath, iterator.options.stat, function lstatRealCallback(err, realStats) {
            if (err) return callback(err);
            entry.realStats = realStats;
            callback();
        });
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }