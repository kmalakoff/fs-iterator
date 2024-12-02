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
var _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// prior to Node 9, fs.readdir did not return sorted files
var readdir = _fs.default.readdir;
var parts = process.versions.node.split('.');
if (+parts[0] === 0 && +parts[1] <= 8) {
    readdir = function readdirSort(path, callback) {
        _fs.default.readdir(path, function(err, files) {
            err ? callback(err) : callback(null, files.sort());
        });
    };
}
function readdirAddOptions(path, _options, callback) {
    return readdir(path, callback);
}
var _default = _fs.default.readdir.length === 3 ? _fs.default.readdir : readdirAddOptions;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }