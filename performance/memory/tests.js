var MemorySuite = require('./MemorySuite');

const CONCURRENCIES = [1, 100, 1600, Infinity];

const TESTS = [];
TESTS.push({ name: `default` });
for (const concurrency of CONCURRENCIES) {
  TESTS.push({ name: `${concurrency}`, options: { concurrency: concurrency } });
}

module.exports = async function run({ Iterator, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new MemorySuite('Iterator ' + dir);

  for (const test of TESTS) {
    suite.add(test.name, async function () {
      const iterator = new Iterator(dir);
      await iterator.forEach(function () {}, test.options);
    });
  }
  suite.add(`serial`, async function () {
    const iterator = new Iterator(dir);
    let result = await iterator.next();
    while (result) result = await iterator.next();
  });

  suite.on('cycle', (result) => {
    console.log(result);
  });

  console.log('Comparing ' + suite.name);
  global.gc();
  await suite.run({ maxTime: 10000 });
  console.log('****************\n');
};
