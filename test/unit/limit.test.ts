import assert from 'assert';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import { safeRm } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import nextTick from 'next-tick';
import path from 'path';
import Pinkie from 'pinkie-promise';
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
  describe('limit', () => {
    after((done) => {
      safeRm(TEST_DIR, done);
    });
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('synchronous', () => {
      it('infinite limit to get all', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 5 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity and only files', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => !entry.stats.isDirectory(),
          lstat: true,
        });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('infinite limit to get all', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });

        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 5 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });
      it('should run with concurrency Infinity and only files', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry, callback) => {
            setTimeout(() => {
              callback(null, !entry.stats.isDirectory());
            }, 10);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          (err, empty) => {
            if (err) {
              done(err.message);
              return;
            }
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });
    });

    describe('promise', () => {
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
      it('infinite limit to get all', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(undefined),
          lstat: true,
        });

        const empty = await iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 }
        );
        assert.ok(empty);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
      });

      it('should run with concurrency 1', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(undefined),
          lstat: true,
        });
        const empty = await iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 1 }
        );
        assert.ok(!empty);
        assert.equal(spys.callCount, 3);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
      });

      it('should run with concurrency 5', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(undefined),
          lstat: true,
        });
        const empty = await iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 5 }
        );
        assert.ok(!empty);
        assert.equal(spys.callCount, 3);
      });

      it('should run with concurrency Infinity', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(undefined),
          lstat: true,
        });
        const empty = await iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity }
        );
        assert.ok(!empty);
        assert.equal(spys.callCount, 3);
      });
      it('should run with concurrency Infinity and only files', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => Promise.resolve(!entry.stats.isDirectory()),
          lstat: true,
        });
        const empty = await iterator.forEach(
          (entry: Entry): undefined => {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 }
        );
        assert.ok(empty);
        assert.equal(spys.callCount, 3);
        assert.equal(spys.dir.callCount, 0);
        assert.equal(spys.file.callCount, 2);
        assert.equal(spys.link.callCount, 1);
      });
    });
  });
});
