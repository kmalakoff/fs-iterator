module.exports = function (fifo, value) {
  if (!fifo) return false;
  for (var node = fifo.node; node; node = fifo.next(node)) {
    if (node.value === value) {
      fifo.remove(node);
      return true;
    }
  }
  return false;
};
