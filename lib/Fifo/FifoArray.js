function FifoArray() {
  var array = [];
  array.first = function first() {
    return array[0];
  };

  array.last = function last() {
    return array.length ? array[array.length - 1] : null;
  };

  array.discard = function discard(value) {
    var index = array.indexOf(value);
    if (!~index) return false;
    array.splice(index, 1);
    return true;
  };
  return array;
}

FifoArray.lifoFromArray = function lifoFromArray(array) {
  array.reverse();
  return array;
};

module.exports = FifoArray;
