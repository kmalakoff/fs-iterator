module.exports = function next(iterator) {
  if (iterator.stack.isEmpty()) {
    if (iterator.processingCount <= 0) {
      while (iterator.waiters.length) iterator.waiters.pop()(true);
      while (iterator.queued.length) iterator.queued.shift()(null, null);
    }
    return;
  }

  if (iterator.waiters.length) iterator.waiters[0](false);
  if (iterator.stack.isEmpty() || !iterator.queued.length) return;

  var self = iterator;
  var callback = iterator.queued.shift();
  iterator.processingCount++;
  iterator.stack.pop()(function (err, result) {
    self.processingCount--;

    // process error and then continue
    if (err) callback(err);
    // didn't get a result, try again
    else if (!result) self.queued.unshift(callback);
    // return result
    else callback(null, result);

    next(iterator); // keep emptying queue
  });

  next(iterator); // keep emptying queue
};
