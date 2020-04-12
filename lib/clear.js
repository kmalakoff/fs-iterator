module.exports = function clear(iterator) {
  iterator.stack.clear();
  while (iterator.waiters.length) iterator.waiters.pop()(true);
  while (iterator.processing.length) iterator.processing.shift()(null, null);
  while (iterator.queued.length) iterator.queued.shift()(null, null);
};
