"use strict";
var FIFO = require("fifo");
var depthFirst = require("./depthFirst");
function PathStack() {
    this.stack = new FIFO();
    this.length = 0;
}
PathStack.prototype.push = function push(item) {
    if (!item) throw new Error("item is mandatory");
    if (item.files && !item.files.length) throw new Error("item files must have a length");
    this.stack.push(item);
    this.length += item.files ? item.files.length : 1;
    return this;
};
PathStack.prototype.pop = function pop() {
    if (!this.stack.length) throw new Error("Stack is empty");
    var item = this.stack.last();
    this.length--;
    // just a simple item
    if (!item.files) return depthFirst.bind(null, this.stack.pop());
    // resuse this item
    if (item.files.length > 1) return depthFirst.bind(null, {
        path: item.path,
        basename: item.files.pop(),
        depth: item.depth
    });
    // done with this item
    item.basename = item.files.pop();
    return depthFirst.bind(null, this.stack.pop());
};
PathStack.prototype.last = function last() {
    return this.stack.last();
};
module.exports = PathStack;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}