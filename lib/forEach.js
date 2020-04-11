var getKeep = require('./getKeep');
var getResult = require('./getResult');

function callDone(options, callback) {
  if (!options.done || options.counter > 0) return false;
  callback(options.err);
  return true;
}

function processDone(options, callback) {
  options.done = true;
  return callDone(options, callback);
}

function processError(err, options, callback) {
  if (getResult(options.error(err), false)) {
    options.err = err;
    options.done = true;
  }
  return callDone(options, callback);
}

function processAvailable(iterator, options, callback) {
  var isProcessing = false;
  return function waiter(done) {
    if (done && processDone(options, callback)) return;

    if (isProcessing) return;
    isProcessing = true;

    while (options.counter < options.concurrency) {
      if (options.done || iterator.stack.isEmpty()) break;
      if (options.total >= options.limit) return processDone(options, callback);
      options.total++;
      options.counter++;

      iterator.next(function (err, value) {
        if (err || value === null) {
          options.counter--;
          return err ? processError(err, options, callback) : processDone(options, callback);
        }

        try {
          getKeep(options.each(value), function (err, keep) {
            options.counter--;
            if (err) return processError(err, options, callback);
            else if (!keep) return processDone(options, callback);
            return callDone(options, callback);
          });
        } catch (err) {
          options.counter--;
          return processError(err, options, callback);
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
    callback(err, iterator.stack.isEmpty());
  });
  iterator.waiters.push(waiter);
  waiter();
};
