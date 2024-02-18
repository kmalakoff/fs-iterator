"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return lifoFromArray;
    }
});
var _fifo = /*#__PURE__*/ _interop_require_default(require("fifo"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function lifoFromArray(array) {
    var fifo = new _fifo.default();
    array.forEach(fifo.unshift.bind(fifo));
    return fifo;
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }