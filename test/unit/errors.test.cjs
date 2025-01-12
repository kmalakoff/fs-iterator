const _Pinkie = require('pinkie-promise');
const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');

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

describe('errors', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('synchronous', () => {
    it('should propagate errors (default)', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => new Error('Failed'),
      });
      iterator.forEach(
        () => {},
        (err) => {
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
        () => {},
        {
          concurrency: 1,
          error: (err) => {
            errors.push(err);
            return true;
          },
        },
        (err) => {
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
        () => {},
        {
          error: (err) => {
            errors.push(err);
            return false;
          },
        },
        (err) => {
          if (err) return done(err);
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('handle invalid root (next)', (done) => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);

      iterator.next((err, value) => {
        assert.ok(err);
        assert.equal(err.code, 'ENOENT');
        assert.ok(!value);
        done();
      });
    });

    it('handle invalid root (forEach)', (done) => {
      const iterator = new Iterator(`${TEST_DIR}does-not-exist`);
      iterator.forEach(
        () => {},
        (err) => {
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
        () => {},
        (err) => {
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
        () => {},
        {
          concurrency: 1,
          error: (err) => {
            errors.push(err);
            return true;
          },
        },
        (err) => {
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
        () => {},
        {
          error: (err) => {
            errors.push(err);
            return false;
          },
        },
        (err) => {
          if (err) return done(err);
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });

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
        () => {},
        (err) => {
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
        () => {},
        (err) => {
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
        () => {},
        {
          concurrency: 1,
          error: (err) => {
            errors.push(err);
            return true;
          },
        },
        (err) => {
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
        () => {},
        {
          error: (err) => {
            errors.push(err);
            return false;
          },
        },
        (err) => {
          if (err) return done(err);
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });
});
