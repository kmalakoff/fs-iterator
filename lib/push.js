module.exports = function push(iterator, item) {
  if (!iterator.options) return;
  iterator.stack.push(item);
  if (iterator.waiters.length) iterator.waiters.first()(false);
};
