var Fifo = require('./Fifo');

module.exports = function (array) {
  if (Fifo === Array) {
    return array.reverse();
  } else {
    var fifo = new Fifo();
    array.forEach(fifo.unshift.bind(fifo));
    return fifo;
  }
};
