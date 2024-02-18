"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return filter;
    }
});
var _asynccompat = /*#__PURE__*/ _interop_require_default(require("async-compat"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function filter(iterator, entry, callback) {
    if (!iterator.options.filter) return callback(null, true);
    _asynccompat.default.asyncFunction(iterator.options.filter, iterator.options.callbacks, entry, function filterCallback(err, keep) {
        if (err) return callback(err);
        if (!_asynccompat.default.defaultValue(keep, true)) return callback();
        callback(null, true);
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }