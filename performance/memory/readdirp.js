var BenchmarkSuite = require('../benchmark-suite');

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
  await suite.run({ maxTime: 100000, heapdumpTrigger: 1024 * 800 });
  console.log('****************\n');
};
