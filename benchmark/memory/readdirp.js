var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ readdirp, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new BenchmarkSuite('ReaddirpStream ' + dir, 'Memory');

  for (const test of testOptions) {
    suite.add(`${version}-${test.name}`, function (fn) {
      return new Promise(function (resolve, reject) {
        let stream = new readdirp.ReaddirpStream(dir, { highWaterMark: test.options ? test.options.concurrency : 4096 });
        stream.on('data', async function () {
          await fn();
        });
        stream.on('error', function (err) {
          if (!stream) return;
          stream.destroy();
          stream = null;
          reject(err);
        });
        stream.on('end', function () {
          if (!stream) return;
          stream.destroy();
          stream = null;
          resolve();
        });
      });
    });
  }

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
  });
  suite.on('complete', function (results) {
    console.log('----------------');
    console.log('Largest');
    console.log('----------------');
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
    console.log('****************\n');
  });

  console.log('Comparing ' + suite.name);
  await suite.run({ time: 10000, heapdumpTrigger: 1024 * 1000 });
  console.log('****************\n');
};
