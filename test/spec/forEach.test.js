var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');
var isPromise = require('is-promise');
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

describe('forEach', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  describe('callback interface', function () {
    it('forEach function is mandatory', function (done) {
      if (typeof Promise === 'undefined') return done(); // no promise support

      var iterator = new Iterator(TEST_DIR);
      var promise = iterator.forEach(function () {});
      assert.ok(isPromise(promise));
      promise
        .then(function () {
          var iterator2 = new Iterator(TEST_DIR);

          var nothing = iterator2.forEach(
            function () {},
            function (err) {
              assert.ok(!err);
              done();
            }
          );
          assert.ok(nothing === undefined);
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('simple forEach (default)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (callbacks)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry, callback) {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(callback);
          nextTick(callback);
        },
        { callbacks: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (callbacks, stop)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry, callback) {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(callback);
          setTimeout(function () {
            callback(null, false);
          }, 10);
        },
        { callbacks: true, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('simple forEach (concurency: 1)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: 5)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: Infinity)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          nextTick(function () {
            callback(null, new Error('Failed'));
          });
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

    it('should propagate errors (concurency: 1)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          nextTick(function () {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        function () {},
        { concurrency: 1 },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 5)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          nextTick(function () {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        function () {},
        { concurrency: 5 },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: Infinity)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function (entry, callback) {
          nextTick(function () {
            callback(null, new Error('Failed'));
          });
        },
        callbacks: true,
      });

      iterator.forEach(
        function () {},
        { concurrency: Infinity },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });
  });

  describe('promise interface', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('forEach function is mandatory', function (done) {
      try {
        var iterator = new Iterator(TEST_DIR);
        iterator
          .forEach()
          .then(function () {
            assert.ok(false);
          })
          .catch(function () {
            assert.ok(false);
          });
      } catch (err) {
        assert.ok(!!err);
        done();
      }
    });

    it('simple forEach (default)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator
        .forEach(function (entry) {
          spys(entry.stats);
        })
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('simple forEach (concurrency: 1)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator
        .forEach(
          function (entry) {
            spys(entry.stats);
          },
          { concurrency: 1 }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('simple forEach (concurrency: 5)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator
        .forEach(
          function (entry) {
            spys(entry.stats);
          },
          { concurrency: 5 }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('simple forEach (concurrency: Infinity)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator
        .forEach(
          function (entry) {
            spys(entry.stats);
          },
          { concurrency: Infinity }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function () {
          return Promise.reject(new Error('Failed'));
        },
      });

      iterator
        .forEach(function (err) {
          if (err) throw err;
        })
        .then(function () {
          assert.ok(false);
        })
        .catch(function (err) {
          assert.ok(!!err);
          done();
        });
    });

    it('should propagate errors (concurrency: 1)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function () {
          return Promise.reject(new Error('Failed'));
        },
      });

      iterator
        .forEach(
          function (err) {
            if (err) throw err;
          },
          { concurrency: 1 }
        )
        .then(function () {
          assert.ok(false);
        })
        .catch(function (err) {
          assert.ok(!!err);
          done();
        });
    });

    it('should propagate errors (concurrency: 5)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function () {
          return Promise.reject(new Error('Failed'));
        },
      });

      iterator
        .forEach(
          function (err) {
            if (err) throw err;
          },
          { concurrency: 5 }
        )
        .then(function () {
          assert.ok(false);
        })
        .catch(function (err) {
          assert.ok(!!err);
          done();
        });
    });

    it('should propagate errors (concurrency: Infinity)', function (done) {
      var iterator = new Iterator(TEST_DIR, {
        filter: function () {
          return Promise.reject(new Error('Failed'));
        },
      });

      iterator
        .forEach(
          function (err) {
            if (err) throw err;
          },
          { concurrency: Infinity }
        )
        .then(function () {
          assert.ok(false);
        })
        .catch(function (err) {
          assert.ok(!!err);
          done();
        });
    });
  });
});
