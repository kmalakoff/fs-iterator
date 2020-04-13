module.exports = function clear(iterator) {
  if (!iterator.options) return;
  while (iterator.stack.length) iterator.stack.pop();
  while (iterator.waiters.length) iterator.waiters.pop()(true);
  while (iterator.processing.length) iterator.processing.pop()(null, null);
  while (iterator.queued.length) iterator.queued.pop()(null, null);
  iterator.options = null;
  iterator.root = null;
  iterator.stack = null;
  iterator.waiters = null;
  iterator.processing = null;
  iterator.queued = null;
};
