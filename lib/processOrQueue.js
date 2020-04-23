var compat = require('async-compat');

var depthFirst = require('./depthFirst');

module.exports = function processOrQueue(iterator, callback) {
  if (iterator.done) return callback(null, null);

  // nothing to process so queue
  if (!iterator.stack.length) return iterator.queued.unshift(callback);

  // root directory didn't exist
  var error = iterator.stack.peek().error;
  if (error) return callback(error);

  iterator.processing++;
  depthFirst(iterator, iterator.stack.pop(), function depthFirstCallback(err, result) {
    iterator.processing--;
    if (iterator.done) return callback(null, null);

    // skip error
    if (err && compat.defaultValue(iterator.options.error(err), true)) err = null;

    // done so clear processors and queued
    if (iterator.done || (!iterator.stack.length && iterator.processing <= 0)) {
      iterator.done = true;
      while (iterator.processors.length) iterator.processors.pop()(true);
      while (iterator.queued.length) iterator.queued.pop()(null, null);
    }

    // skip error or no result so try again
    if (!err && !result) processOrQueue(iterator, callback);
    else callback(err, result || null);
  });
};
