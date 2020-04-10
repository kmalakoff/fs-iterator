module.exports = function next(iterator) {
  if (!iterator.queued.length) return;

  if (iterator.stack.isEmpty()) {
    if (iterator.processingCount <= 0) {
      while (iterator.queued.length) iterator.queued.shift()(null, null);
    }
    return;
  }

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
