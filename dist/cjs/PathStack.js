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
var _fifo = /*#__PURE__*/ _interop_require_default(require("fifo"));
var _index = /*#__PURE__*/ _interop_require_default(require("./depthFirst/index.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function PathStack() {
    this.stack = new _fifo.default();
    this.length = 0;
}
PathStack.prototype.push = function push(item) {
    if (!item) throw new Error('item is mandatory');
    if (item.files && !item.files.length) throw new Error('item files must have a length');
    this.stack.push(item);
    this.length += item.files ? item.files.length : 1;
    return this;
};
PathStack.prototype.pop = function pop() {
    if (!this.stack.length) throw new Error('Stack is empty');
    var item = this.stack.last();
    this.length--;
    // just a simple item
    if (!item.files) return _index.default.bind(null, this.stack.pop());
    // resuse this item
    if (item.files.length > 1) return _index.default.bind(null, {
        path: item.path,
        basename: item.files.pop(),
        depth: item.depth
    });
    // done with this item
    item.basename = item.files.pop();
    return _index.default.bind(null, this.stack.pop());
};
PathStack.prototype.last = function last() {
    return this.stack.last();
};
var _default = PathStack;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }