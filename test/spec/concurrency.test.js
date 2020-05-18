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

describe('concurrency', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('synchronous', function () {
    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
      });

      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        function () {},
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          nextTick(callback);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        function () {},
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
          return Promise.resolve();
        },
      });
      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });
});
