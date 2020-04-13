var MemorySuite = require('./MemorySuite');

const CONCURRENCIES = [1, 100, 1600, Infinity];

const TESTS = [];
TESTS.push({ name: `default` });
for (const concurrency of CONCURRENCIES) {
  TESTS.push({ name: `${concurrency}`, options: { concurrency: concurrency } });
}

module.exports = async function run({ ReaddirpStream, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new MemorySuite('ReaddirpStream ' + dir);

  for (const test of TESTS) {
    suite.add(test.name, function (fn) {
      return new Promise(function (resolve, reject) {
        const stream = new ReaddirpStream(dir, test.options);
        stream.on('data', function () {
          fn();
        });
        stream.on('error', function (err) {
          reject(err);
        });
        stream.on('end', function () {
          resolve();
        });
      });
    });
  }

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
  global.gc();
  await suite.run({ maxTime: 10000 });
  console.log('****************\n');
};
