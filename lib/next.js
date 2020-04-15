var compat = require('async-compatibilty');

var clear = require('./clear');
var remove = require('./remove');
var depthFirst = require('./depthFirst');

function queueMore(iterator) {
  if (!iterator.options) return;
  if (!iterator.stack.length) {
    if (!iterator.processing.length) clear(iterator);
    return;
  }
  if (iterator.waiters.length) iterator.waiters.first()(false);
}

module.exports = function next(iterator) {
  var isProcessing = false;
  return function processMore() {
    if (isProcessing) return;

    queueMore(iterator);
    if (!iterator.options || !iterator.stack.length || !iterator.queued.length) return;
    isProcessing = true;

    var self = iterator;
    var callback = iterator.queued.pop();
    iterator.processing.push(callback);

    var item = iterator.stack.pop();
    var fn = item.names ? depthFirst.nextFilename : depthFirst.path;
    fn(item, iterator.options, function (err, result) {
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

      processMore(); // keep emptying queue
    });

    isProcessing = false;
    processMore(); // keep emptying queue
  };
};
