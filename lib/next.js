var compat = require('async-compat');

var depthFirst = require('./depthFirst');

function isDone(iterator) {
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

function processOne(iterator, callback) {
  var item = iterator.stack.pop();

  iterator.processing++;
  depthFirst(item, iterator.options, function depthFirstCallback(err, result) {
    iterator.processing--;
    if (!iterator.options) return callback(null, null);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so return after the stack has unwound
    if (isDone(iterator)) {
      iterator.destroy(true);
      return callback(err, result || null);
    }

    // skip error or no result so try again
    else if (!err && !result) {
      if (iterator.stack.length) {
        processOne(iterator, callback);
      } else {
        iterator.queued.push(callback);
      }
    } else callback(err, result || null);
  });
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;
    while (iterator.options && iterator.stack.length && canProcess(iterator)) processOne(iterator, iterator.queued.pop());
    isProcessing = false;
  };
};
