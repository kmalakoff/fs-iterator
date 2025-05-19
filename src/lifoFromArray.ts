import FIFO from 'fifo';

export default function lifoFromArray(array) {
  const fifo = new FIFO();

  array.forEach(fifo.unshift.bind(fifo));
  return fifo;
}
