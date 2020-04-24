// const CONCURRENCIES = [Infinity];
// const CONCURRENCIES = [100];
// const CONCURRENCIES = [10];
// const CONCURRENCIES = [1];
const CONCURRENCIES = [1, 1000, Infinity];
// const CONCURRENCIES = [1, 100, 1000, Infinity];
// const ALWAYS_STATS = [false, true];
const ALWAYS_STATS = [false];
const TESTS_OPTIONS = [];

for (const alwaysStat of ALWAYS_STATS) {
  for (const concurrency of CONCURRENCIES) {
    TESTS_OPTIONS.push({
      name: `${concurrency}-${alwaysStat ? 't' : 'f'}`,
      options: { concurrency: concurrency, alwaysStat: alwaysStat },
    });
  }
}
// TESTS_OPTIONS.push({ name: 'default' });

module.exports = TESTS_OPTIONS;
