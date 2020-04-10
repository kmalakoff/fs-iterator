var getKeep = require('./getKeep');

function processAvailable(iterator, options, callback) {
  var isProcessing = false;
  return function (done) {
    if (done) {
      options.done = true;
      if (options.counter <= 0) return callback(options.err);
    }

    if (isProcessing) return;
    isProcessing = true;

    while (options.counter < options.concurrency) {
      if (options.done || iterator.stack.isEmpty()) break;
      if (options.total >= options.limit) {
        options.done = true;
        if (options.counter <= 0) return callback(options.err);
        return;
      }
      options.total++;
      options.counter++;

      iterator.next(function (err, value) {
        if (value === null) {
          options.counter--;
          options.done = true;
          if (options.counter <= 0) return callback(options.err);
          return;
        }

        try {
          getKeep(options.each(err, value), function (err1, keep) {
            options.counter--;
            if (err1) {
              options.err = err1;
              options.done = true;
            } else if (!keep) {
              options.done = true;
            }
            if (options.done && options.counter <= 0) return callback(options.err);
          });
        } catch (err) {
          options.counter--;
          options.err = err;
          options.done = true;
          if (options.counter <= 0) return callback(options.err);
        }
      });
    }

    isProcessing = false;
  };
}

module.exports = function each(iterator, options, callback) {
  var waiter = processAvailable(iterator, options, function (err) {
    iterator.waiters = iterator.waiters.filter(function (x) {
      return x !== waiter;
    });
    callback(err);
  });
  iterator.waiters.push(waiter);
  waiter();
};
