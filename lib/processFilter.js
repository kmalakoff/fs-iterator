var getResult = require('./getResult');
var getKeep = require('./getKeep');

module.exports = function processFilter(options, entry, callback) {
  if (!options.filter) return callback(null, true);

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    options.async ? options.filter(entry, callbackWrapper) : getKeep(options.filter(entry), callbackWrapper);
  } catch (err) {
    callback(err);
  }
};
