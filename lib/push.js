var nextTick = require('next-tick');

module.exports = function push(iterator, item) {
  if (!iterator.options) return;
  iterator.stack.push(item);
  nextTick(iterator.processMore);
};
