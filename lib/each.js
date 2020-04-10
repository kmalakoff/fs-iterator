var maximize = require('maximize-iterator');

module.exports = function each(iterator, options, callback) {
  return maximize(iterator, options, callback);
};
