"use strict";
var lstat = require("./lstat");
var lstatReal = require("./lstatReal");
var readdir = require("./readdir");
var realpath = require("./realpath");
var stat = require("./stat");
module.exports = {
    lstat: lstat,
    lstatReal: lstatReal,
    readdir: readdir,
    realpath: realpath,
    stat: stat
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}