var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

var Iterator = require('../..');
var statsSpys = require('../utils').statsSpys;

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

describe('destroy', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('callback interface', function () {
    it('destroys after iteration', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
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

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          if (++count === 5) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 5);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          if (++count === 5) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 5);
          done();
        }
      );
    });
  });

  describe('promise interface', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('destroys after iteration', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
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

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          if (++count === 5) return iterator.destroy();
        },
      });
      iterator
        .forEach(function () {}, { concurrency: 1 })
        .then(function () {
          assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 5);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          if (++count === 5) iterator.destroy();
          callback();
        },
        callbacks: true,
      });
      iterator
        .forEach(function () {}, { concurrency: Infinity })
        .then(function () {
          assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 5);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });
});
