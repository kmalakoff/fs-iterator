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

describe('depth', () => {
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
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 2,
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 2,
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry, callback) => {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    it('depth 0 (satst: true)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 2,
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve(undefined);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
