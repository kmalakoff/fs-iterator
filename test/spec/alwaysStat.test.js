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
};

describe('alwaysStat', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('default', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: function (entry) {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: function (entry) {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        function () {},
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

  describe('alwaysStat false', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: function (entry) {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: false,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: function (entry) {
          assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: false,
      });
      iterator.forEach(
        function () {},
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

  describe('alwaysStat true', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: function (entry) {
          assert.ok(entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: function (entry) {
          assert.ok(entry.stats instanceof fs.Stats);
          spys(entry.stats);
        },
        lstat: true,
        alwaysStat: true,
      });
      iterator.forEach(
        function () {},
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
