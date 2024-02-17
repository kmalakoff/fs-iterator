const FIFO = require('fifo');

module.exports = function lifoFromArray(array) {
  const fifo = new FIFO();

  array.forEach(fifo.unshift.bind(fifo));
  return fifo;
};
