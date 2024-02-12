"use strict";
var fs = require("fs");
function lstatAddOptions(path, _options, callback) {
    // if (arguments.length === 2) return fs.lstat(path, options);
    return fs.lstat(path, callback);
}
module.exports = fs.lstat.length === 3 ? fs.lstat : lstatAddOptions;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}