var compat = require('async-compat');

var depthFirst = require('./depthFirst');

function stop(iterator) {
  if (!iterator.options) return true;
  if (!iterator.stack.length && !iterator.processing.length) return true;
  return false;
}

// there's nothing queued for processing, get more if there are processors
function canProcess(iterator) {
  if (iterator.queued.length) return true;
  if (!iterator.processors.length) return false;
  iterator.processors.first()(false);
  return !!iterator.queued.length;
}

function processOne(iterator) {
  var callback = iterator.queued.pop();
  iterator.processing.push(callback);

  var item = iterator.stack.pop();
  depthFirst(item, iterator.options, function depthFirstCallback(err, result) {
    if (!iterator.options) return;
    iterator.processing.discard(callback);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so return after the stack has unwound
    if (stop(iterator)) {
      iterator.destroy(true);
      // return nextTick(callback.bind(null, err, result || null));
      return callback(err, result || null);
    }

    // skip error or no result so try again
    else if (!err && !result) {
      iterator.queued.push(callback);
      if (iterator.stack.length) processOne(iterator);
    } else callback(err, result || null);
  });
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;
    while (iterator.options && iterator.stack.length && canProcess(iterator)) processOne(iterator);
    isProcessing = false;
  };
};
