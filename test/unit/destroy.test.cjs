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

describe('destroy', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('callback interface', () => {
    it('destroys after iteration', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          iterator.destroy();
          done();
        }
      );
    });

    it('destroys before iteration', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });
      iterator.destroy();
      iterator.forEach(
        () => {},
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.dir.callCount, 0);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('handle mid-iterator destroy (concurrency 1)', (done) => {
      const spys = statsSpys();

      let count = 0;
      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        () => {},
        { concurrency: 1 },
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.callCount, 4);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('handle mid-iterator destroy (concurrency Infinity)', (done) => {
      const spys = statsSpys();

      let count = 0;
      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        () => {},
        { concurrency: Infinity },
        (err) => {
          if (err) return done(err.message);
          assert.equal(spys.callCount, 4);
          done();
        }
      );
    });
  });

  describe('promise interface', () => {
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

    it('destroys after iteration', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
        lstat: true,
      });
      await iterator.forEach(() => {});
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      iterator.destroy();
    });

    it('destroys before iteration', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });
      iterator.destroy();
      await iterator.forEach(() => {});
      assert.equal(spys.dir.callCount, 0);
      assert.equal(spys.file.callCount, 0);
      assert.equal(spys.link.callCount, 0);
    });

    it('handle mid-iterator destroy (concurrency 1)', async () => {
      const spys = statsSpys();

      let count = 0;
      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
          if (++count === 4) return iterator.destroy();
        },
        lstat: true,
      });
      await iterator.forEach(() => {}, { concurrency: 1 });
      assert.equal(spys.callCount, 4);
      assert.equal(spys.dir.callCount, 2);
      assert.equal(spys.file.callCount, 2);
      assert.equal(spys.link.callCount, 0);
    });

    it('handle mid-iterator destroy (concurrency Infinity)', async () => {
      const spys = statsSpys();

      let count = 0;
      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      await iterator.forEach(() => {}, { concurrency: Infinity });
      assert.equal(spys.callCount, 4);
    });
  });
});
