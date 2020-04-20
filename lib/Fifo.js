var Fifo = require('fifo');

Fifo.prototype.discard = function discard(value) {
  for (var node = this.node; node; node = this.next(node)) {
    if (node.value !== value) continue;
    this.remove(node);
    return true;
  }
  return false;
};

Fifo.lifoFromArray = function lifoFromArray(array) {
  var fifo = new Fifo();
  array.forEach(fifo.unshift.bind(fifo));
  return fifo;
};

module.exports = Fifo;
