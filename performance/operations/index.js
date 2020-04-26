const path = require('path');
var assign = require('object.assign');

const tests = require('./tests');

const VERSIONS = require('../VERSIONS');
const TESTS_OPTIONS = require('../TESTS_OPTIONS');
const DATA_DIR = path.resolve(path.join(__dirname, '..', 'node_modules'));
const ITERATION_COUNT = 3;

(async () => {
  for (const options of VERSIONS) {
    for (let i = 0; i < ITERATION_COUNT; i++) {
      await tests(assign({}, options, { testOptions: TESTS_OPTIONS }), DATA_DIR);
    }
  }
})();
