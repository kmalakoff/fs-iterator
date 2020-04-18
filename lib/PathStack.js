var Fifo = require('./Fifo');

function PathStack(iterator) {
  if (!iterator) throw new Error('Iterator is mandatory');
  this.iterator = iterator;
  this.stack = new Fifo();
  this.length = 0;
}

PathStack.prototype.push = function push(item) {
  if (!item) throw new Error('item is mandatory');
  if (item.files && !item.files.length) throw new Error('item files must have a length');
  this.stack.push(item);
  this.length += item.files ? item.files.length : 1;

  if (this.iterator.options) this.iterator.processMore();
  return this;
};

PathStack.prototype.pop = function pop() {
  if (!this.stack.length) throw new Error('Stack is empty');
  var item = this.stack.last();
  this.length--;

  // just a simple item
  if (!item.files) return this.stack.pop();

  // resuse this item
  if (item.files.length > 1) return { root: item.root, path: item.path, basename: item.files.pop(), depth: item.depth };

  // done with this item
  item.basename = item.files.pop();
  return this.stack.pop();
};

module.exports = PathStack;
