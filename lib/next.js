var processOrQueue = require('./processOrQueue');

// there's nothing queued for processing, get more if there are processors
function canProcess(iterator) {
  if (!iterator.options || !iterator.stack.length) return false;

  if (iterator.queued.length) return true;
  if (!iterator.processors.length) return false;
  iterator.processors.first()(false);
  if (!iterator.options) return false;
  return !!iterator.queued.length;
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;
    while (canProcess(iterator)) {
      processOrQueue(iterator, iterator.queued.pop());
    }
    isProcessing = false;
  };
};
