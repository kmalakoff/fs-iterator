var USE_FIFO = true;

if (USE_FIFO) {
  var Fifo = require('fifo');
  module.exports = Fifo;
} else {
  Array.prototype.first = function () {
    return this[0];
  };
  module.exports = Array;
}
