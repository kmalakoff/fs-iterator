import assert from 'assert';
import path from 'path';
import url from 'url';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import nextTick from 'next-tick';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';
import rimraf2 from 'rimraf2';

// @ts-ignore
import Iterator, { type Entry } from 'fs-iterator';

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

describe('concurrency', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  describe('synchronous', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
      });

      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 5 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): undefined => {
          console.log(entry);
          spys(entry.stats);
        },
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: Infinity },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 5 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: Infinity },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: 5 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        { concurrency: Infinity },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });
});
