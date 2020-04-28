var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf2');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');
var nextTick = require('next-tick');

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
  filelink1: '~dir3/dir4/file1',
  'dir3/filelink2': '~dir2/file1',
};

describe('forEach', function () {
  describe('limit', function () {
    after(function (done) {
      rimraf(DIR, done);
    });
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    describe('synchronous', function () {
      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, { lstat: true });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should run with concurrency 1', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, { lstat: true });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, { lstat: true });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 3, concurrency: 5 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, { lstat: true });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity and only files', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return !entry.stats.isDirectory();
          },
          lstat: true,
        });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });
    });

    describe('callbacks', function () {
      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });

        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: Infinity, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should run with concurrency 1', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { lstat: true, limit: 3, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { lstat: true, limit: 3, concurrency: 5 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 3, concurrency: Infinity },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          }
        );
      });
      it('should run with concurrency Infinity and only files', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            setTimeout(function () {
              callback(null, !entry.stats.isDirectory());
            }, 10);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          { limit: 100, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });
    });

    describe('promise', function () {
      if (typeof Promise === 'undefined') return; // no promise support

      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return Promise.resolve();
          },
          lstat: true,
        });

        iterator
          .forEach(
            function (entry) {
              spys(entry.stats);
            },
            { limit: Infinity, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });

      it('should run with concurrency 1', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return Promise.resolve();
          },
          lstat: true,
        });
        iterator
          .forEach(
            function (entry) {
              spys(entry.stats);
            },
            { limit: 3, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 1);
            assert.equal(spys.link.callCount, 0);
            done();
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });

      it('should run with concurrency 5', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return Promise.resolve();
          },
          lstat: true,
        });
        iterator
          .forEach(
            function (entry) {
              spys(entry.stats);
            },
            { limit: 3, concurrency: 5 }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });

      it('should run with concurrency Infinity', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return Promise.resolve();
          },
          lstat: true,
        });
        iterator
          .forEach(
            function (entry) {
              spys(entry.stats);
            },
            { limit: 3, concurrency: Infinity }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.callCount, 3);
            done();
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });
      it('should run with concurrency Infinity and only files', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return Promise.resolve(!entry.stats.isDirectory());
          },
          lstat: true,
        });
        iterator
          .forEach(
            function (entry) {
              spys(entry.stats);
            },
            { limit: 100, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(empty);
            assert.equal(spys.callCount, 3);
            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });
    });
  });
});
