module.exports = function (fifo, value) {
  for (var node = fifo.node; node; node = fifo.next(node)) {
    if (node.value === value) {
      fifo.remove(node);
      return true;
    }
  }
  return false;
};
