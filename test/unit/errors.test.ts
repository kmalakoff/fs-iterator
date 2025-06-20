import assert from 'assert';
import generate from 'fs-generate';
// @ts-ignore
import Iterator, { type Entry } from 'fs-iterator';
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

describe('errors', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  describe('synchronous', () => {
    it('should propagate errors (default)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => new Error('Failed'),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (true)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: () => new Error('Failed'),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          concurrency: 1,
          error: (err?: Error) => {
            errors.push(err);
            return true;
          },
        },
        (err?: Error) => {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: () => new Error('Failed'),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          error: (err?: Error) => {
            errors.push(err);
            return false;
          },
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('handle invalid root (next)', (done) => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);

      iterator
        .next()
        .then((value) => {
          assert.ok(!value);
        })
        .catch((err) => {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        });
    });

    it('handle invalid root (forEach)', (done) => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: NodeJS.ErrnoException) => {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        }
      );
    });

    it('should propagate errors (default)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          setTimeout(() => {
            callback(new Error('Failed'));
          }, 10);
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

    it('should propagate errors (true)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          setTimeout(() => {
            callback(new Error('Failed'));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          concurrency: 1,
          error: (err?: Error) => {
            errors.push(err);
            return true;
          },
        },
        (err?: Error) => {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (_entry, callback) => {
          setTimeout(() => {
            callback(new Error('Failed'));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          error: (err?: Error) => {
            errors.push(err);
            return false;
          },
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(errors.length, 6);
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
    it('handle invalid root (next)', async () => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);

      try {
        const value = await iterator.next();
        assert.ok(!value);
      } catch (err) {
        assert.ok(err);
        assert.equal(err.code, 'ENOENT');
      }
    });

    it('handle invalid root (forEach)', (done) => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: NodeJS.ErrnoException) => {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        }
      );
    });

    it('should propagate errors (default)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        (err?: Error) => {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (true)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          concurrency: 1,
          error: (err?: Error) => {
            errors.push(err);
            return true;
          },
        },
        (err?: Error) => {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', (done) => {
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });
      iterator.forEach(
        (_entry: Entry): undefined => {},
        {
          error: (err?: Error) => {
            errors.push(err);
            return false;
          },
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });
});
