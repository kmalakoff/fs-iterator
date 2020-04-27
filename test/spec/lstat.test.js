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
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
};

describe('lstat', function () {
  after(function (done) {
    rimraf(DIR, done);
  });
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });

  describe('default', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
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

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: Infinity,
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        function () {},
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
  });

  describe('lstat false', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (entry) {
          spys(entry.stats);
        },
        lstat: false,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
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

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: Infinity,
        filter: function (entry) {
          spys(entry.stats);
        },
        lstat: false,
      });
      iterator.forEach(
        function () {},
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
  });

  describe('lstat true', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (entry) {
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

      var iterator = new Iterator(DIR, {
        depth: Infinity,
        filter: function (entry) {
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
});
