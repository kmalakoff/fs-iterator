const assert = require('assert');
const path = require('path');
const fs = require('fs');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');

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

describe('lstat', () => {
  after((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, done);
  });
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('default', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err, err ? err.message : '');
          if (fs.Dirent) {
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
          } else {
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 3);
            assert.equal(spys.link.callCount, 0);
          }
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
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err, err ? err.message : '');
          if (fs.Dirent) {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
          } else {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 0);
          }
          done();
        }
      );
    });
  });

  describe('lstat false', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          spys(entry.stats);
        },
        lstat: false,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err, err ? err.message : '');
          if (fs.Dirent) {
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
          } else {
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 3);
            assert.equal(spys.link.callCount, 0);
          }
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
        lstat: false,
      });
      iterator.forEach(
        () => {},
        (err) => {
          assert.ok(!err, err ? err.message : '');
          if (fs.Dirent) {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
          } else {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 0);
          }
          done();
        }
      );
    });
  });

  describe('lstat true', () => {
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
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
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
          assert.ok(!err, err ? err.message : '');
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
