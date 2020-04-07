var getResult = require('./getResult');
var getKeep = require('./getKeep');

module.exports = function processFilter(iterator, entry, callback) {
  if (!iterator.options.filter) return callback(null, true);

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    var filter = iterator.options.filter;
    iterator.options.async ? filter(entry.path, entry.stats, callbackWrapper) : getKeep(filter(entry.path, entry.stats), callbackWrapper);
  } catch (err) {
    callback(err);
  }
};
