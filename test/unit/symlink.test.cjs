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
  'dir3/dir4/dirlink1': '~dir2',
};

describe('symlink', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((done) => {
    rimraf(TEST_DIR, done);
  });

  it('Should find everything with no return (lstat)', (done) => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
      },
      lstat: true,
    });
    iterator.forEach(
      () => {},
      (err) => {
        assert.ok(!err);
        assert.equal(spys.callCount, 15);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 7);
        assert.equal(spys.link.callCount, 3);
        done();
      }
    );
  });

  it('Should find everything with no return (stat)', (done) => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
      },
      lstat: false,
    });
    iterator.forEach(
      () => {},
      (err) => {
        assert.ok(!err);
        assert.equal(spys.callCount, 15);
        if (fs.Dirent) {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 7);
          assert.equal(spys.link.callCount, 3);
        } else {
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 9);
          assert.equal(spys.link.callCount, 0);
        }
        done();
      }
    );
  });
});
