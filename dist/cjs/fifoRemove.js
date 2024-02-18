"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return fifoRemove;
    }
});
function fifoRemove(fifo, value) {
    for(var node = fifo.node; node; node = fifo.next(node)){
        if (node.value === value) {
            fifo.remove(node);
            return true;
        }
    }
    return false;
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }