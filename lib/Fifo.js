var Fifo = require('fifo');

Fifo.prototype.find = function find(value) {
  for (var node = this.node; node; node = this.next(node)) {
    if (node.value === value) return node;
  }
  return null;
};

Fifo.lifoFromArray = function lifoFromArray(array) {
  var fifo = new Fifo();
  array.forEach(fifo.unshift.bind(fifo));
  return fifo;
};

module.exports = Fifo;
