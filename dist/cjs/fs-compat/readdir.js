"use strict";
var fs = require("fs");
// prior to Node 9, fs.readdir did not return sorted files
var readdir = fs.readdir;
var parts = process.versions.node.split(".");
if (+parts[0] === 0 && +parts[1] <= 8) {
    readdir = function readdirSort(path, callback) {
        fs.readdir(path, function(err, files) {
            err ? callback(err) : callback(null, files.sort());
        });
    };
}
function readdirAddOptions(path, _options, callback) {
    // if (arguments.length === 2) return readdir(path, options);
    // if (options.withFileTypes) return callback(new Error('withFileTypes option not emulated'));
    return readdir(path, callback);
}
module.exports = fs.readdir.length === 3 ? fs.readdir : readdirAddOptions;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}