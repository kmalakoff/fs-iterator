var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf2');
var generate = require('fs-generate');

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

describe('errors', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, DIR));

  describe('synchronous', function () {
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
          concurrency: 1,
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
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    it('handle invalid root (next)', function (done) {
      var iterator = new Iterator(DIR + 'does-not-exist');

      iterator.next(function (err, value) {
        assert.ok(err);
        assert.equal(err.code, 'ENOENT');
        assert.ok(!value);
        done();
      });
    });

    it('handle invalid root (forEach)', function (done) {
      var iterator = new Iterator(DIR + 'does-not-exist');
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        }
      );
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
          concurrency: 1,
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
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('handle invalid root (next)', function (done) {
      var iterator = new Iterator(DIR + 'does-not-exist');

      iterator
        .next()
        .then(function (value) {
          assert.ok(!value);
        })
        .catch(function (err) {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        });
    });

    it('handle invalid root (forEach)', function (done) {
      var iterator = new Iterator(DIR + 'does-not-exist');
      iterator.forEach(
        function () {},
        function (err) {
          assert.ok(err);
          assert.equal(err.code, 'ENOENT');
          done();
        }
      );
    });

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return Promise.reject(new Error('Failed'));
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
          return Promise.reject(new Error('Failed'));
        },
      });
      iterator.forEach(
        function () {},
        {
          concurrency: 1,
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
          return Promise.reject(new Error('Failed'));
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
          assert.equal(errors.length, 6);
          done();
        }
      );
    });
  });
});
