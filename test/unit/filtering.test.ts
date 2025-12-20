import assert from 'assert';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import { safeRm } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import url from 'url';
import { stringStartsWith } from '../lib/compat.ts';

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
const TEST_DIR_PATH = `dir3${path.sep}dir4`;

describe('filtering', () => {
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

  beforeEach((done) => {
    safeRm(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  describe('synchronous', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return false;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return entry.path !== 'dir2';
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 10);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return entry.stats.isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH);
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, false);
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, entry.path !== 'dir2');
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 10);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, !entry.stats.isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(false);
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(entry.path !== 'dir2');
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 10);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return Promise.resolve(!entry.stats.isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH));
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });
});
