var compat = require('async-compat');

var depthFirst = require('./depthFirst');

function isDone(iterator) {
  if (!iterator.options) return true;
  if (!iterator.stack.length && iterator.processing <= 0) return true;
  return false;
}

module.exports = function processOrQueue(iterator, callback) {
  if (!iterator.options) return callback(null, null);

  // TODO: add a done check here
  if (!iterator.stack.length) return iterator.queued.unshift(callback);

  iterator.processing++;
  depthFirst(iterator.stack.pop(), iterator.options, function depthFirstCallback(err, result) {
    iterator.processing--;
    if (!iterator.options) return callback(null, null);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done
    if (isDone(iterator)) iterator.done = true;

    // skip error or no result so try again
    if (!err && !result) processOrQueue(iterator, callback);
    else callback(err, result || null);
  });
};
