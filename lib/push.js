module.exports = function push(iterator, item) {
  iterator.stack.push(item);
  if (iterator.waiters.length) iterator.waiters.first()(false);
};
