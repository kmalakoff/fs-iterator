"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return lstatReal;
    }
});
var _lstat = /*#__PURE__*/ _interop_require_default(require("./lstat.js"));
var _realpath = /*#__PURE__*/ _interop_require_default(require("./realpath.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function lstatReal(path, options, callback) {
    (0, _realpath.default)(path, function realpathCallback(err, realpath) {
        if (err) return callback(err);
        (0, _lstat.default)(realpath, options, callback);
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }