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

function callCallback(iterator, err, result, callback) {
  if (isDone(iterator)) {
    clear(iterator);
    return nextTick(callback.bind(null, err, result));
  } else callback(err, result);
}

function processOne(iterator, processMore) {
  var callback = iterator.queued.pop();
  iterator.processing.push(callback);

  var item = iterator.stack.pop();
  var fn = item.names ? depthFirst.nextFilename : depthFirst.path;
  fn(item, iterator.options, function (err, result) {
    if (!iterator.options || !remove(iterator.processing, callback)) return; // already cleared

    // process error and then continue
    if (err) {
      // skip error
      if (compat.defaultValue(iterator.options.error(err), true)) iterator.queued.push(callback);
      else callCallback(iterator, err, result, callback);
    }
    // didn't get a result, try again
    else if (!result) iterator.queued.push(callback);
    else callCallback(iterator, err, result, callback);

    // keep emptying queue
    if (iterator.options) processMore();
  });
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;
    isProcessing = true;

    while (!isDone(iterator)) {
      if (!iterator.stack.length) break;

      // there's nothing queued for processing, get more if there are waiters
      if (!iterator.queued.length) {
        if (!iterator.waiters.length) break;
        iterator.waiters.first()(false);
        if (!iterator.options || !iterator.queued.length) break;
      }

      processOne(iterator, processMore);
    }

    isProcessing = false;
  };
};
