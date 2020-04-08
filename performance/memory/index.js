const path = require('path');
const fs = require('fs-extra');

const tests = require('./tests');

const ITERATOR_VERSIONS = require('../ITERATOR_VERSIONS');
const MODULES_DIR = path.resolve(path.join(__dirname, '..', 'node_modules'));
const DATA_DIR = path.resolve(path.join(__dirname, 'data'));
const DATA_COPIES = 200;

(async () => {
  if (!(await fs.exists(DATA_DIR))) {
    await fs.ensureDir(DATA_DIR);
    for (let i = 0; i < DATA_COPIES; i++) {
      await fs.copy(MODULES_DIR, entry.path.join(DATA_DIR, `${i}`));
    }
  }

  for (const options of ITERATOR_VERSIONS) {
    await tests(options, DATA_DIR);
  }
})();
