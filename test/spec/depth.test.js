var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');
var nextTick = require('next-tick');

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

describe('depth', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('synchronous', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
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

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: function (entry) {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 2,
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

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
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

  describe('callbacks', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
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

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
        lstat: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 2,
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
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

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
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

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('depth 0 (satst: true)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 0,
        filter: function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
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

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 1,
        filter: function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
        },
        lstat: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: 2,
        filter: function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
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

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        depth: Infinity,
        filter: function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
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
