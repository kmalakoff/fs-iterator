var nextTick = require('next-tick');

module.exports = function sleep() {
  return new Promise(function (resolve) {
    nextTick(resolve);
  });
};
