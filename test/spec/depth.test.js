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

describe('depth', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('synchronous', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        () => {},
        (err) => {
          assert.ok(!err);
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
        () => {},
        (err) => {
          assert.ok(!err);
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
        () => {},
        (err) => {
          assert.ok(!err);
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
        () => {},
        (err) => {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    if (typeof Promise === 'undefined') return; // no promise support

    it('depth 0 (satst: true)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry, _callback) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        filter: (entry, _callback) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        filter: (entry, _callback) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
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
        filter: (entry, _callback) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        lstat: true,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
