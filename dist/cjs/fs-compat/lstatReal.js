"use strict";
var lstat = require("./lstat");
var realpath = require("./realpath");
module.exports = function lstatReal(path, options, callback) {
    realpath(path, function realpathCallback(err, realpath) {
        if (err) return callback(err);
        lstat(realpath, options, callback);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}