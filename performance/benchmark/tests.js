var Benchmark = require('benchmark');
var maximize = require('maximize-iterator');

const CONCURRENCIES = [1, 25, 100, 400, 1600, 6400, Infinity];
const FILE_SYSTEMS = [
  { name: 'fs', fs: require('fs') },
  // { name: 'gfs', fs: require('graceful-fs') },
];

const TESTS = [];
for (const fileSystem of FILE_SYSTEMS) {
  TESTS.push({ name: `${fileSystem.name}`, options: { fs: fileSystem.fs } });
  for (const concurrency of CONCURRENCIES) {
    TESTS.push({ name: `${fileSystem.name}, ${concurrency}`, options: { fs: fileSystem.fs, concurrency: concurrency } });
  }
}

module.exports = async function run({ Iterator, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');
  global.gc();

  return new Promise(function (resolve, reject) {
    const suite = new Benchmark.Suite('Iterator ' + dir);

    for (const test of TESTS) {
      suite.add(
        test.name,
        async function (deferred) {
          const iterator = new Iterator(dir, test.options);
          await maximize(iterator, test.options)
          deferred.resolve();
        },
        { defer: true }
      );
    }

    suite.on('start', function () {
      console.log('Comparing ' + this.name);
    });
    suite.on('cycle', function (event) {
      console.log(String(event.target));
    });
    suite.on('error', function () {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject();
    });
    suite.on('complete', function () {
      var fastest = this.filter('fastest')[0];
      console.log('----------------\n');
      console.log('Fastest is ' + fastest.name + ' x ' + fastest.hz.toFixed(2) + ' ops/sec');
      console.log('****************\n');
      resolve();
    });
    suite.run({ async: true, maxTime: 1000 });
  });
};
