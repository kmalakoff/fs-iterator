var assert = require('assert');
var path = require('path');
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

describe('destroy', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('callback interface', function () {
    it('destroys after iteration', function (done) {
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
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          iterator.destroy();
          done();
        }
      );
    });

    it('destroys before iteration', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.destroy();
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 0);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('handle mid-iterator destroy (concurrency 1)', function (done) {
      var spys = statsSpys();

      var count = 0;
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.callCount, 4);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('handle mid-iterator destroy (concurrency Infinity)', function (done) {
      var spys = statsSpys();

      var count = 0;
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.callCount, 4);
          done();
        }
      );
    });
  });

  describe('promise interface', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('destroys after iteration', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator
        .forEach(function () {})
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          iterator.destroy();
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('destroys before iteration', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
        },
      });
      iterator.destroy();
      iterator
        .forEach(function () {})
        .then(function () {
          assert.equal(spys.dir.callCount, 0);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('handle mid-iterator destroy (concurrency 1)', function (done) {
      var spys = statsSpys();

      var count = 0;
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry) {
          spys(entry.stats);
          if (++count === 4) return iterator.destroy();
        },
        lstat: true,
      });
      iterator
        .forEach(function () {}, { concurrency: 1 })
        .then(function () {
          assert.equal(spys.callCount, 4);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 0);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('handle mid-iterator destroy (concurrency Infinity)', function (done) {
      var spys = statsSpys();

      var count = 0;
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          spys(entry.stats);
          if (++count === 4) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator
        .forEach(function () {}, { concurrency: Infinity })
        .then(function () {
          assert.equal(spys.callCount, 4);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });
});
