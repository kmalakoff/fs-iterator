module.exports = function (fifo, value) {
  if (!fifo) return false;
  if (Array.isArray(fifo)) {
    var index = fifo.indexOf(value);
    if (~index) {
      fifo.splice(index, 1);
      return true;
    }
  } else {
    for (var node = fifo.node; node; node = fifo.next(node)) {
      if (node.value === value) {
        fifo.remove(node);
        return true;
      }
    }
  }
  return false;
};
