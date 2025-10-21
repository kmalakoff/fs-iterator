import assert from 'assert';
import generate from 'fs-generate';
import Iterator, { type EachFunction, type Entry } from 'fs-iterator';
import statsSpys from 'fs-stats-spys';
import isPromise from 'is-promise';
import nextTick from 'next-tick';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
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
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  describe('callback interface', () => {
    it('simple forEach (default)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
          setTimeout(() => {
            callback(null, false);
          }, 10);
        },
        { callbacks: true, concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: 5 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: Infinity },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
            callback(new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 1)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 1 },
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 5)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 5 },
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: Infinity)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          nextTick(() => {
            callback(new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: Infinity },
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });
  });

  describe('promise interface', () => {
    (() => {
      // patch and restore promise
      if (typeof global === 'undefined') return;
      const globalPromise = global.Promise;
      before(() => {
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = globalPromise;
      });
    })();
    it('forEach function is mandatory', async () => {
      const iterator = new Iterator(TEST_DIR);
      const promise = iterator.forEach((_entry: Entry): undefined => {});
      assert.ok(isPromise(promise));
      await promise;
      const iterator2 = new Iterator(TEST_DIR);
      const nothing = await iterator2.forEach((_entry: Entry): undefined => {});
      assert.ok(nothing === true);
    });

    it('forEach function is mandatory', async () => {
      try {
        const iterator = new Iterator(TEST_DIR);
        const promise = iterator.forEach(undefined as EachFunction<Entry>);
        assert.ok(isPromise(promise));
      } catch (err) {
        assert.ok(!!err);
      }
    });

    it('simple forEach (default)', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach((entry: Entry): undefined => {
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
        (entry: Entry): undefined => {
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
        (entry: Entry): undefined => {
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
        (entry: Entry): undefined => {
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
        await iterator.forEach((err?: Entry): undefined => {
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
          (err?: Entry): undefined => {
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
          (err?: Entry): undefined => {
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
          (err?: Entry): undefined => {
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
