module.exports = function clear(iterator) {
  if (!iterator.options) return;
  while (iterator.stack.length) iterator.stack.pop();
  while (iterator.processors.length) iterator.processors.pop()(true);
  while (iterator.processing.length) iterator.processing.pop()(null, null);
  while (iterator.queued.length) iterator.queued.pop()(null, null);
  iterator.removeAllListeners();
  iterator.options = null;
  iterator.root = null;
  iterator.stack = null;
  iterator.processors = null;
  iterator.processing = null;
  iterator.queued = null;
  iterator.processMore = null;
};
