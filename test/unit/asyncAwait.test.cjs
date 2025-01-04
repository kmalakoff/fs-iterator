const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');

const Iterator = require('fs-iterator');

const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
const STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  filelink1: '~dir3/dir4/file1',
  'dir3/filelink2': '~dir2/file1',
};

describe('async await', () => {
  if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) return;
  (() => {
    // patch and restore promise
    const root = typeof global !== 'undefined' ? global : window;
    let rootPromise;
    before(() => {
      rootPromise = root.Promise;
      root.Promise = require('pinkie-promise');
    });
    after(() => {
      root.Promise = rootPromise;
    });
  })();

  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  it('should be default false', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
      },
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.ok(spys.callCount, 13);
  });

  it('Should find everything with no return', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
      },
      lstat: true,
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('Should find everything with return true', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('should propagate errors', async () => {
    const iterator = new Iterator(TEST_DIR, {
      filter: () => Promise.reject(new Error('Failed')),
    });

    try {
      let value = await iterator.next();
      while (value) {
        assert.ok(typeof value.basename === 'string');
        assert.ok(typeof value.path === 'string');
        assert.ok(typeof value.fullPath === 'string');
        assert.ok(typeof value.stats === 'object');
        value = await iterator.next();
      }
    } catch (err) {
      assert.ok(!!err);
    }
  });
});
