module.exports = function push(iterator, item) {
  if (!iterator.options) return;
  iterator.stack.push(item);
  iterator.processMore();
};
