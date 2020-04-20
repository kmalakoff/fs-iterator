var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ Iterator, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new BenchmarkSuite('Iterator ' + dir, 'Operations');

  for (const test of testOptions) {
    suite.add(`${version}-${test.name}`, async function (fn) {
      const iterator = new Iterator(dir);
      await iterator.forEach(fn, test.options);
      iterator.destroy(function () {});
    });
  }
  suite.add(`serial`, async function (fn) {
    const iterator = new Iterator(dir);
    let result = await iterator.next();
    while (result) {
      fn();
      result = await iterator.next();
    }
    iterator.destroy(function () {});
  });

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
  });
  suite.on('complete', function (results) {
    console.log('----------------');
    console.log('Fastest');
    console.log('----------------');
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
    console.log('****************\n');
  });

  console.log('Comparing ' + suite.name);
  await suite.run({ time: 10000 });
  console.log('****************\n');
};
