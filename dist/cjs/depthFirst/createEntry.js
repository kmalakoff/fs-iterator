"use strict";
var sep = require("path").sep;
function join(left, right) {
    if (!left) return right || "";
    if (!right) return left;
    return left + sep + right;
}
module.exports = function createEntry(iterator, item) {
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
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}