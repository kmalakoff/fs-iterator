module.exports = function gc() {
  if (typeof process !== 'undefined' && process.gc) process.gc();
};
