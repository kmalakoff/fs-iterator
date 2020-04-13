const path = require('path');

const tests = require('./tests');
const readdirp = require('./readdirp');

const ITERATOR_VERSIONS = require('../ITERATOR_VERSIONS');
const READDIRP_VERSIONS = require('../READDIRP_VERSIONS');
const DATA_DIR = path.resolve(path.join(__dirname, '..', 'node_modules'));

(async () => {
  for (const options of ITERATOR_VERSIONS) {
    await tests(options, DATA_DIR);
  }

  for (const options of READDIRP_VERSIONS) {
    await readdirp(options, DATA_DIR);
  }
})();
