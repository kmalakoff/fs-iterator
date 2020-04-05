module.exports = function writeMemory(key, value) {
  console.log(`${key} ${Math.round((value / 1024 / 1024) * 100) / 100} MB`);
}
