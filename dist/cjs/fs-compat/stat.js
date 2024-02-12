"use strict";
var fs = require("fs");
function statAddOptions(path, _options, callback) {
    // if (arguments.length === 2) return fs.stat(path, options);
    return fs.stat(path, callback);
}
module.exports = fs.stat.length === 3 ? fs.stat : statAddOptions;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}