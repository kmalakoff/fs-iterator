"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return createEntry;
    }
});
var _path = require("path");
function join(left, right) {
    if (!left) return right || '';
    if (!right) return left;
    return left + _path.sep + right;
}
function createEntry(iterator, item) {
    var entry = {};
    if (item.basename.name) {
        entry.basename = item.basename.name;
        entry.stats = item.basename;
    } else {
        entry.basename = item.basename;
    }
    entry.path = join(item.path, entry.basename);
    entry.fullPath = join(iterator.root, entry.path);
    return entry;
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }