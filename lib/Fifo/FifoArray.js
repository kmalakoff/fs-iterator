function FifoArray() {
  Array.call(this);

  this.first = function first() {
    return this[0];
  }.bind(this);

  this.last = function last() {
    return this.length ? this[this.length - 1] : null;
  }.bind(this);

  this.discard = function discard(value) {
    var index = this.indexOf(value);
    if (~index) {
      this.splice(index, 1);
      return true;
    }
    return false;
  }.bind(this);
}

FifoArray.lifoFromArray = function lifoFromArray(array) {
  array.reverse();
  return array;
};

module.exports = FifoArray;
