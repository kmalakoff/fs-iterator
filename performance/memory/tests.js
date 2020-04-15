var MemorySuite = require('../benchmark-memory');

module.exports = async function run({ Iterator, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new MemorySuite('Iterator ' + dir);

  for (const test of testOptions) {
    suite.add(`${version}-${test.name}`, async function (fn) {
      const iterator = new Iterator(dir);
      await iterator.forEach(fn, test.options);
      iterator.destroy(function () {});
    });
  }
  // suite.add(`serial`, async function (fn) {
  //   const iterator = new Iterator(dir);
  //   let result = await iterator.next();
  //   while (result) {
  //     fn();
  //     result = await iterator.next();
  //   }
  //   iterator.destroy(function () {});
  // });

  suite.on('cycle', (current) => {
    console.log(`${current.end.name} (end) x ${suite.formatStats(current.end.stats)}`);
    console.log(`${current.max.name} (max) x ${suite.formatStats(current.max.stats)}`);
  });
  suite.on('complete', function (largest) {
    console.log('----------------');
    console.log('Largest');
    console.log('----------------');
    console.log(`${largest.end.name} (end) x ${suite.formatStats(largest.end.stats)}`);
    console.log(`${largest.max.name} (max) x ${suite.formatStats(largest.max.stats)}`);
    console.log('****************\n');
  });

  console.log('Comparing ' + suite.name);
  await suite.run({ maxTime: 10000 });
  console.log('****************\n');
};
