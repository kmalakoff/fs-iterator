var FIFO = require('fifo');

module.exports = function lifoFromArray(array) {
  var fifo = new FIFO();
  array.forEach(fifo.unshift.bind(fifo));
  return fifo;
};
