var path = require('path');

module.exports = function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + path.sep + right;
};
