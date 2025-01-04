const _Pinkie = require('pinkie-promise');
const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');
const isPromise = require('is-promise');
const nextTick = require('next-tick');

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

describe('forEach', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('callback interface', () => {
    it('simple forEach (default)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (callbacks)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry, callback) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(callback);
          nextTick(callback);
        },
        { callbacks: true },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (callbacks, stop)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry, callback) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(callback);
          setTimeout(() => {
            callback(null, false);
          }, 10);
        },
        { callbacks: true, concurrency: 1 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('simple forEach (concurency: 1)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 1 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: 5)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 5 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: Infinity)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('should propagate errors (default)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 1)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        () => {},
        { concurrency: 1 },
        (err) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 5)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        () => {},
        { concurrency: 5 },
        (err) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: Infinity)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        () => {},
        { concurrency: Infinity },
        (err) => {
          assert.ok(!!err);
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
    it('forEach function is mandatory', async () => {
      const iterator = new Iterator(TEST_DIR);
      const promise = iterator.forEach(() => {});
      assert.ok(isPromise(promise));
      await promise;
      const iterator2 = new Iterator(TEST_DIR);
      const nothing = await iterator2.forEach(
        () => {},
        (err) => {
          assert.ok(!err, err ? err.message : '');
        }
      );
      assert.ok(nothing === undefined);
    });

    it('forEach function is mandatory', async () => {
      try {
        const iterator = new Iterator(TEST_DIR);
        const promise = iterator.forEach();
        assert.ok(isPromise(promise));
      } catch (err) {
        assert.ok(!!err);
      }
    });

    it('simple forEach (default)', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach((entry) => {
        spys(entry.stats);
      });
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('simple forEach (concurrency: 1)', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 1 }
      );
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('simple forEach (concurrency: 5)', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 5 }
      );
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('simple forEach (concurrency: Infinity)', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach(
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: Infinity }
      );
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('should propagate errors (default)', async () => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      try {
        await iterator.forEach((err) => {
          if (err) throw err;
        });
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });

    it('should propagate errors (concurrency: 1)', async () => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      try {
        await iterator.forEach(
          (err) => {
            if (err) throw err;
          },
          { concurrency: 1 }
        );
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });

    it('should propagate errors (concurrency: 5)', async () => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      try {
        await iterator.forEach(
          (err) => {
            if (err) throw err;
          },
          { concurrency: 5 }
        );
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });

    it('should propagate errors (concurrency: Infinity)', async () => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      try {
        await iterator.forEach(
          (err) => {
            if (err) throw err;
          },
          { concurrency: Infinity }
        );
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });
  });
});
