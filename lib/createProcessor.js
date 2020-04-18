var compat = require('async-compatibilty');

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
  if (compat.defaultValue(options.error(err), false)) {
    options.err = err;
    options.done = true;
  }
  return callDone(options, callback);
}

module.exports = function createProcessor(next, options, callback) {
  var isProcessing = false;
  return function processor(done) {
    if (done && processDone(options, callback)) return;

    if (isProcessing) return;
    isProcessing = true;

    while (options.counter < options.concurrency) {
      if (options.done || options.stop()) break;
      if (options.total >= options.limit) return processDone(options, callback);
      options.total++;
      options.counter++;
      next(function (err, value) {
        if (err || value === null) {
          options.counter--;
          if (err ? processError(err, options, callback) : processDone(options, callback)) return;
          return processor();
        }

        try {
          compat.asyncFunction(options.each, options.async, value, function (err, keep) {
            options.counter--;
            if (err) return processError(err, options, callback);
            else if (!compat.defaultValue(keep, true)) return processDone(options, callback);
            if (!callDone(options, callback)) processor();
          });
        } catch (err) {
          options.counter--;
          return processError(err, options, callback);
        }
      });
    }

    isProcessing = false;
  };
};
