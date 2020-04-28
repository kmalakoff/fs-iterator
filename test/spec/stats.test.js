var assert = require('assert');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

var Iterator = require('../..');

var DIR = path.resolve(path.join(__dirname, '..', 'data'));
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
};

describe('stats compatibility', function () {
  after(function (done) {
    rimraf(DIR, done);
  });
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });

  describe('stats', function () {
    it('stat', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, { alwaysStat: true, lstat: false });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 7);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('lstat', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, { alwaysStat: true, lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('dirent', function () {
    it('stat', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, { lstat: false });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
          assert.ok(!err);
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

    it('lstat', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
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
