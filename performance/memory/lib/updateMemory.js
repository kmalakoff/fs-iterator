module.exports = function updateMemory(highest) {
  const memory = process.memoryUsage();
  for (const key in highest) {
    if (highest[key] < memory[key]) highest[key] = memory[key];
  }
};
