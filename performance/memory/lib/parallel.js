var updateMemory = require('./updateMemory');
var writeMemory = require('./writeMemory');

module.exports = async function run({ Iterator, version }, dir) {
  console.log('****************\n');
  console.log(`Parallel: ${version}`);
  console.log('----------------');
  global.gc();
  const start = process.memoryUsage();
  const highest = { heapUsed: start.heapUsed };

  const iterator = new Iterator(dir);
  await iterator.forEach(
    function () {
      updateMemory(highest);
    },
    {
      concurrency: 1024,
    }
  );

  const end = process.memoryUsage();
  for (const key in highest) {
    writeMemory(`Highest ${key}`, highest[key] - start[key]);
    writeMemory(`End ${key}`, end[key] - start[key]);
  }
  console.log('****************\n');
};
