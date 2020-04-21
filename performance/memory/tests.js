var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ Iterator, version, testOptions }, dir) {
  var suite = new BenchmarkSuite('Iterator ' + version, 'Memory');

  for (const test of testOptions) {
    suite.add(`${test.name}`, async function (fn) {
      const iterator = new Iterator(dir);
      await iterator.forEach(fn, test.options);
      iterator.destroy(function () {});
    });
  }
  suite.add(`serial`, async function (fn) {
    const iterator = new Iterator(dir);
    let result = await iterator.next();
    while (result) {
      await fn();
      result = await iterator.next();
    }
    iterator.destroy(function () {});
  });

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)} - ${key}`);
  });
  suite.on('complete', function (results) {
    console.log('-----Largest-----');
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)} - ${key}`);
  });

  console.log('----------' + suite.name + '----------');
  await suite.run({ time: 1000 }); //, heapdumpTrigger: 1024 * 10 });
  console.log('');
};
