var compat = require('async-compat');

var depthFirst = require('./depthFirst');

function stop(iterator) {
  if (!iterator.options) return true;
  if (!iterator.stack.length && iterator.processing <= 0) return true;
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
  var item = iterator.stack.pop();

  iterator.processing++;
  depthFirst(item, iterator.options, function depthFirstCallback(err, result) {
    iterator.processing--;
    if (!iterator.options) return callback(null, null);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so return after the stack has unwound
    if (stop(iterator)) {
      iterator.destroy(true);
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
