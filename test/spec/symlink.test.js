var assert = require('assert');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

var Iterator = require('../..');

var TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));
var STRUCTURE = {
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

describe('symlink', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(TEST_DIR, done);
  });

  it('Should find everything with no return (lstat)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.callCount, 15);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 7);
        assert.equal(spys.link.callCount, 3);
        done();
      }
    );
  });

  it('Should find everything with no return (stat)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
      lstat: false,
    });
    iterator.forEach(
      function () {},
      function (err) {
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
