const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');
const nextTick = require('next-tick');

const Iterator = require('fs-iterator');

const TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));
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
      rimraf2(TEST_DIR, { disableGlob: true }, done);
    });
    beforeEach((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, () => {
        generate(TEST_DIR, STRUCTURE, done);
      });
    });

    describe('synchronous', () => {
      it('infinite limit to get all', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry) => {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 5 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity and only files', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry) => !entry.stats.isDirectory(),
          lstat: true,
        });
        iterator.forEach(
          (entry) => {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { lstat: true, limit: 3, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { lstat: true, limit: 3, concurrency: 5 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
          (entry) => {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          (err, empty) => {
            assert.ok(!err, err ? err.message : '');
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
      if (typeof Promise === 'undefined') return; // no promise support

      it('infinite limit to get all', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(),
          lstat: true,
        });

        iterator
          .forEach(
            (entry) => {
              spys(entry.stats);
            },
            { limit: Infinity, concurrency: 1 }
          )
          .then((empty) => {
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          })
          .catch((err) => {
            assert.ok(!err, err ? err.message : '');
          });
      });

      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(),
          lstat: true,
        });
        iterator
          .forEach(
            (entry) => {
              spys(entry.stats);
            },
            { limit: 3, concurrency: 1 }
          )
          .then((empty) => {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          })
          .catch((err) => {
            assert.ok(!err, err ? err.message : '');
          });
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(),
          lstat: true,
        });
        iterator
          .forEach(
            (entry) => {
              spys(entry.stats);
            },
            { limit: 3, concurrency: 5 }
          )
          .then((empty) => {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          })
          .catch((err) => {
            assert.ok(!err, err ? err.message : '');
          });
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry) => Promise.resolve(),
          lstat: true,
        });
        iterator
          .forEach(
            (entry) => {
              spys(entry.stats);
            },
            { limit: 3, concurrency: Infinity }
          )
          .then((empty) => {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          })
          .catch((err) => {
            assert.ok(!err, err ? err.message : '');
          });
      });
      it('should run with concurrency Infinity and only files', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry) => Promise.resolve(!entry.stats.isDirectory()),
          lstat: true,
        });
        iterator
          .forEach(
            (entry) => {
              spys(entry.stats);
            },
            { limit: 100, concurrency: 1 }
          )
          .then((empty) => {
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          })
          .catch((err) => {
            assert.ok(!err, err ? err.message : '');
          });
      });
    });
  });
});
