// const CONCURRENCIES = [Infinity];
const CONCURRENCIES = [1];
// const CONCURRENCIES = [1, 100, 1600, Infinity];
const TESTS_OPTIONS = [];

// TESTS_OPTIONS.push({ name: `default` });
for (const concurrency of CONCURRENCIES) {
  TESTS_OPTIONS.push({ name: `${concurrency}`, options: { concurrency: concurrency } });
}

module.exports = TESTS_OPTIONS;
