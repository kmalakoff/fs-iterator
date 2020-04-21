var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

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

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

describe('errors', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return new Error('Failed');
        },
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (true)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function () {
          return new Error('Failed');
        },
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return true;
          },
        },
        function (err) {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function () {
          return new Error('Failed');
        },
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return false;
          },
        },
        function (err) {
          assert.ok(!err);
          assert.equal(errors.length, 1);
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

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setTimeout(function () {
            callback(new Error('Failed'));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (true)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setTimeout(function () {
            callback(new Error('Failed'));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return true;
          },
        },
        function (err) {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setTimeout(function () {
            callback(new Error('Failed'));
          }, 10);
        },
        callbacks: true,
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return false;
          },
        },
        function (err) {
          assert.ok(!err);
          assert.equal(errors.length, 1);
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

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
        },
      });
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (true)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
        },
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return true;
          },
        },
        function (err) {
          assert.ok(!!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });

    it('should not propagate errors (false)', function (done) {
      var errors = [];

      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
        },
      });
      iterator.forEach(
        function () {},
        {
          error: function (err) {
            errors.push(err);
            return false;
          },
        },
        function (err) {
          assert.ok(!err);
          assert.equal(errors.length, 1);
          done();
        }
      );
    });
  });
});
