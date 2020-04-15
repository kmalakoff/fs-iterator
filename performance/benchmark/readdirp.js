var Benchmark = require('benchmark');
const gc = require('expose-gc/function');

module.exports = async function run({ readdirp, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  return new Promise(function (resolve, reject) {
    const suite = new Benchmark.Suite('ReaddirpStream ' + dir);

    for (const test of testOptions) {
      suite.add(
        test.name,
        async function (deferred) {
          const stream = new readdirp.ReaddirpStream(dir, { highWaterMark: test.options ? test.options.concurrency : 4096 });
          stream.on('data', function (entry) {});
          stream.on('error', function (err) {
            deferred.reject(err);
          });
          stream.on('end', function () {
            deferred.resolve();
          });
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
