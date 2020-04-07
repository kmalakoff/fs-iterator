var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var sysPath = require('path');
var maximize = require('maximize-iterator');

var Iterator = require('../..');

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

describe('errors', function () {
  after(function (callback) {
    rimraf(DIR, callback);
  });

  describe('sync', function () {
    beforeEach(function (callback) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should propagate errors', function (callback) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          throw new Error('Failed');
        },
      });
      maximize(
        iterator,
        {
          each: function (err) {
            assert.ok(!!err);
            throw err;
          },
        },
        function (err) {
          assert.ok(!!err);
          callback();
        }
      );
    });
  });

  describe('async', function () {
    beforeEach(function (callback) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should propagate errors', function (callback) {
      var iterator = new Iterator(DIR, {
        filter: function (path, stat, callback2) {
          setTimeout(function () {
            callback2(new Error('Failed'));
          }, 100);
        },
        async: true,
      });
      maximize(
        iterator,
        {
          each: function (err) {
            assert.ok(!!err);
            throw err;
          },
        },
        function (err) {
          assert.ok(!!err);
          callback();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    beforeEach(function (callback) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should propagate errors', function (callback) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(100).then(function () {
            throw new Error('Failed');
          });
        },
      });
      maximize(
        iterator,
        {
          each: function (err) {
            assert.ok(!!err);
            throw err;
          },
        },
        function (err) {
          assert.ok(!!err);
          callback();
        }
      );
    });
  });
});
