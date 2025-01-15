const _Pinkie = require('pinkie-promise');
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

describe('promise', () => {
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

  describe('setup', () => {
    beforeEach((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, () => {
        generate(TEST_DIR, STRUCTURE, done);
      });
    });
    after((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, done);
    });

    it('should be default false', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });

      function consume() {
        iterator.next().then((value) => {
          if (value === null) {
            assert.ok(spys.callCount, 13);
            done();
          } else consume();
        });
      }
      consume();
    });

    it('simple forEach (async)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry, callback) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(!callback);
          return Promise.resolve();
        },
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (stop)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry, callback) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(!callback);
          return Promise.resolve(false);
        },
        { concurrency: 1 },
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('Should find everything with no return', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
        lstat: true,
      });

      async function consume() {
        const value = await iterator.next();
        if (value === null) {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
        } else await consume();
      }
      await consume();
    });

    it('Should find everything with return true', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
          return true;
        },
        lstat: true,
      });

      function consume() {
        iterator.next().then((value) => {
          if (value === null) {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          } else consume();
        });
      }
      consume();
    });

    it('should propagate errors', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      function consume() {
        iterator.next().catch((err) => {
          assert.ok(!!err);
          done();
        });
      }
      consume();
    });
  });
});
