"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    PathStack: function() {
        return _PathStack.default;
    },
    default: function() {
        return _default;
    }
});
var _FSIterator = /*#__PURE__*/ _interop_require_default(require("./FSIterator"));
var _PathStack = /*#__PURE__*/ _interop_require_default(require("./PathStack"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = _FSIterator.default;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }