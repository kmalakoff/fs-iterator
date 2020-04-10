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

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

describe.skip('limit', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
      });

      iterator.each(
        function () {},
        { limit: 3, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });
  });

  describe('async', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          return sleep(50);
        },
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          return sleep(50);
        },
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          return sleep(50);
        },
      });
      iterator.each(
        function () {},
        { limit: 3, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });
  });
});
