var Fifo = require('fifo');

var USE_FIFO = true;

if (!USE_FIFO) {
  Array.prototype.first = function () {
    return this[0];
  };
}

module.exports = USE_FIFO ? Fifo : Array;
