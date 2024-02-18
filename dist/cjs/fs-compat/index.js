"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _lstat = /*#__PURE__*/ _interop_require_default(require("./lstat.js"));
var _lstatReal = /*#__PURE__*/ _interop_require_default(require("./lstatReal.js"));
var _readdir = /*#__PURE__*/ _interop_require_default(require("./readdir.js"));
var _realpath = /*#__PURE__*/ _interop_require_default(require("./realpath.js"));
var _stat = /*#__PURE__*/ _interop_require_default(require("./stat.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = {
    lstat: _lstat.default,
    lstatReal: _lstatReal.default,
    readdir: _readdir.default,
    realpath: _realpath.default,
    stat: _stat.default
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }