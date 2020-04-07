var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var sysPath = require('path');
var fs = require('fs');
var maximize = require('maximize-iterator');

var Iterator = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));
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

describe('depth', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (path) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 1);
        assert.equal(spys.file.callCount, 2);
        assert.equal(spys.link.callCount, 1);
        done();
      });
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 1,
        filter: function (path) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 4);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 2,
        filter: function (path) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 3,
        filter: function (path) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });
  });

  describe('async', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 1);
        assert.equal(spys.file.callCount, 2);
        assert.equal(spys.link.callCount, 1);
        done();
      });
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 1,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 4);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 2,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: Infinity,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          setTimeout(callback, 50);
        },
        async: true,
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('depth 0', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 0,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          return sleep(50);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 1);
        assert.equal(spys.file.callCount, 2);
        assert.equal(spys.link.callCount, 1);
        done();
      });
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 1,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          return sleep(50);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 4);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: 2,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          return sleep(50);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        depth: Infinity,
        filter: function (path, stat, callback) {
          var stats = fs.lstatSync(sysPath.join(DIR, path));
          spys(stats, path);
          return sleep(50);
        },
      });
      maximize(iterator, function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      });
    });
  });
});
