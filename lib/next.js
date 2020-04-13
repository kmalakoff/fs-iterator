var compat = require('async-compatibilty');

var clear = require('./clear');
var remove = require('./remove');

module.exports = function next(iterator) {
  if (!iterator.options) return;
  if (!iterator.stack.length) {
    if (!iterator.processing.length) clear(iterator);
    return;
  }
  if (iterator.waiters.length) iterator.waiters.first()(false);
  if (!iterator.options) return;
  if (!iterator.stack.length || !iterator.queued.length) return;

  var self = iterator;
  var callback = iterator.queued.pop();
  iterator.processing.push(callback);
  iterator.stack.pop()(function (err, result) {
    if (!self.options || !remove(iterator.processing, callback)) return; // already cleared

    // process error and then continue
    if (err) {
      // skip error
      if (compat.defaultValue(iterator.options.error(err), true)) self.queued.push(callback);
      else callback(err);
    }
    // didn't get a result, try again
    else if (!result) self.queued.push(callback);
    // return result
    else callback(null, result);

    next(iterator); // keep emptying queue
  });

  next(iterator); // keep emptying queue
};
