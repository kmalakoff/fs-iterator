"use strict";
var FIFO = require("fifo");
module.exports = function lifoFromArray(array) {
    var fifo = new FIFO();
    array.forEach(fifo.unshift.bind(fifo));
    return fifo;
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}