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

function processOne(iterator, processMore) {
  var callback = iterator.queued.pop();
  iterator.processing.push(callback);

  var item = iterator.stack.pop();
  var fn = item.names ? depthFirst.nextFilename : depthFirst.path;
  fn(item, iterator.options, function (err, result) {
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
    else callback(err, result);

    processMore();
  });
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;

    while (iterator.options && iterator.stack.length) {
      // there's nothing queued for processing, get more if there are waiters
      if (!iterator.queued.length) {
        if (!iterator.waiters.length) break;
        iterator.waiters.first()(false);
        if (!iterator.queued.length) break;
      }

      processOne(iterator, processMore);
    }

    isProcessing = false;
  };
};
