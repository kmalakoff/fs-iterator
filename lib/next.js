var compat = require('async-compatibilty');
var nextTick = require('next-tick');

var clear = require('./clear');
var remove = require('./remove');
var depthFirst = require('./depthFirst');

function isDone(iterator) {
  if (!iterator.options) return true;
  if (!iterator.stack.length && !iterator.processing.length) return true;
  return false;
}

// there's nothing queued for processing, get more if there are waiters
function canProcess(iterator) {
  if (iterator.queued.length) return true;
  if (!iterator.waiters.length) return false;
  iterator.waiters.first()(false);
  return !!iterator.queued.length;
}

function processOne(iterator, processMore) {
  var callback = iterator.queued.pop();
  iterator.processing.push(callback);

  var item = iterator.stack.pop();
  depthFirst(item, iterator.options, function (err, result) {
    if (!iterator.options) return;
    remove(iterator.processing, callback);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so return after the stack has unwound
    if (isDone(iterator)) {
      clear(iterator);
      return nextTick(callback.bind(null, err, result || null));
    }

    // skip error or no result so try again
    else if (!err && !result) iterator.queued.push(callback);
    else callback(err, result || null);

    processMore();
  });
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;

    while (iterator.options && iterator.stack.length && canProcess(iterator)) {
      processOne(iterator, processMore);
    }

    isProcessing = false;
  };
};
