const assert = require('assert');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
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

describe('alwaysStat', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('default', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
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

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry) => {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
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

  describe('alwaysStat false', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: false,
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

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry) => {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: false,
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

  describe('alwaysStat true', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: (entry) => {
          assert.ok(entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: true,
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

    it('depth Infinity', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: (entry) => {
          assert.ok(entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: true,
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
