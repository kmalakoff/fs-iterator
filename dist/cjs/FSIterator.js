"use strict";
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
var inherits = require("inherits");
var StackBaseIterator = require("stack-base-iterator");
var fs = require("fs");
var path = require("path");
var PathStack = require("./PathStack");
var fifoRemove = require("./fifoRemove");
var fsCompat = require("./fs-compat");
var lifoFromArray = require("./lifoFromArray");
function FSIterator(root, options) {
    var _this = this;
    if (!_instanceof(this, FSIterator)) return new FSIterator(root, options);
    StackBaseIterator.call(this, options);
    options = options || {};
    if (this.options.depth === undefined) this.options.depth = Infinity;
    this.options.readdir = {
        encoding: "utf8",
        withFileTypes: fs.Dirent && !options.alwaysStat
    };
    this.options.stat = {
        bigint: process.platform === "win32"
    };
    this.options.error = options.error || function defaultError(err) {
        return ~FSIterator.EXPECTED_ERRORS.indexOf(err.code); // skip known issues
    };
    this.root = path.resolve(root);
    this.stack = new PathStack();
    var cancelled = false;
    function setup() {
        cancelled = true;
    }
    this.processing.push(setup);
    fsCompat.readdir(this.root, this.options.readdir, function(err, files) {
        fifoRemove(_this.processing, setup);
        if (_this.done || cancelled) return;
        if (err) return _this.end(err);
        if (files.length) _this.push({
            path: null,
            depth: 0,
            files: lifoFromArray(files)
        });
    });
}
inherits(FSIterator, StackBaseIterator);
FSIterator.EXPECTED_ERRORS = [
    "ENOENT",
    "EPERM",
    "EACCES",
    "ELOOP"
];
module.exports = FSIterator;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}