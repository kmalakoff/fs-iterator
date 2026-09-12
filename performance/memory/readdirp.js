var MemorySuite = require('../benchmark-memory');

module.exports = async function run({ readdirp, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new MemorySuite('ReaddirpStream ' + dir);

  for (const test of testOptions) {
    suite.add(`${version}-${test.name}`, function (fn) {
      return new Promise(function (resolve, reject) {
        const stream = new readdirp.ReaddirpStream(dir, { highWaterMark: test.options ? test.options.concurrency : 4096 });
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
  await suite.run({ maxTime: 10000, heapdumpTrigger: 1024 * 1024 * 4 });
  console.log('****************\n');
};
