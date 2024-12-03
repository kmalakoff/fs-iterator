"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return path;
    }
});
var _index = /*#__PURE__*/ _interop_require_default(require("../fs-compat/index.js"));
var _lifoFromArray = /*#__PURE__*/ _interop_require_default(require("../lifoFromArray.js"));
var _createEntry = /*#__PURE__*/ _interop_require_default(require("./createEntry.js"));
var _filter = /*#__PURE__*/ _interop_require_default(require("./filter.js"));
var _stat = /*#__PURE__*/ _interop_require_default(require("./stat.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isDirectory(entry) {
    if (entry.realStats) return entry.realStats.isDirectory();
    return entry.stats.isDirectory();
}
function path(item, iterator, callback) {
    var depth = item.depth;
    var entry = (0, _createEntry.default)(iterator, item);
    item = null; // release reference
    (0, _stat.default)(iterator, entry, function statCallback(err) {
        if (err || iterator.done) return callback(err);
        (0, _filter.default)(iterator, entry, function filterCallback(err, keep) {
            if (err || !keep || iterator.done) return callback(err);
            // not a directory or is a directory, but next level is too deep
            if (!isDirectory(entry) || depth + 1 > iterator.options.depth) return callback(null, entry);
            // get files in this directory
            _index.default.readdir(entry.fullPath, iterator.options.readdir, function readdirCallback(err, files) {
                if (err || iterator.done) return callback(err);
                if (files.length) iterator.push({
                    path: entry.path,
                    depth: depth + 1,
                    files: (0, _lifoFromArray.default)(files)
                });
                return callback(null, entry);
            });
        });
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }