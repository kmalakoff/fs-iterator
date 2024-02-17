const assert = require('assert');
const path = require('path');
const rimraf = require('rimraf');
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

describe('concurrency', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('synchronous', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });

      iterator.forEach(
        () => {},
        { concurrency: 1 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        () => {},
        { concurrency: 5 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        () => {},
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
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
        () => {},
        { concurrency: 1 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
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
        () => {},
        { concurrency: 5 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
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
        () => {},
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    if (typeof Promise === 'undefined') return; // no promise support

    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        () => {},
        { concurrency: 1 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        () => {},
        { concurrency: 5 },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        () => {},
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });
});
