var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var isPromise = require('is-promise');

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

describe('forEach', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('callback interface', function () {
    it('forEach function is mandatory', function (done) {
      if (typeof Promise === 'undefined') return done(); // no promise support

      var iterator = new Iterator(DIR);
      var promise = iterator.forEach(function () {});
      assert.ok(isPromise(promise));
      promise
        .then(function () {
          var iterator2 = new Iterator(DIR);

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

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry) {
          try {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          } catch (err) {
            return err;
          }
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (async)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          assert.ok(entry);
          assert.ok(callback);
          setTimeout(callback, 10);
        },
        { callbacks: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (async, stop)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry, callback) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
          assert.ok(entry);
          assert.ok(callback);
          setTimeout(function () {
            callback(null, false);
          }, 10);
        },
        { callbacks: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: 1)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: 5)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (concurency: Infinity)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR);
      iterator.forEach(
        function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('should propagate errors (default)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setImmediate(function () {
            callback(null, new Error('Failed'));
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

    it('should propagate errors (concurency: 1)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setImmediate(function () {
            callback(null, new Error('Failed'));
          }, 10);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setImmediate(function () {
            callback(null, new Error('Failed'));
          }, 10);
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
      var iterator = new Iterator(DIR, {
        filter: function (entry, callback) {
          setImmediate(function () {
            callback(null, new Error('Failed'));
          }, 10);
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
        var iterator = new Iterator(DIR);
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

      var iterator = new Iterator(DIR);
      iterator
        .forEach(function (entry) {
          spys(fs.lstatSync(entry.fullPath), entry.path);
        })
        .then(function () {
          assert.equal(spys.dir.callCount, 6);
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

      var iterator = new Iterator(DIR);
      iterator
        .forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { concurrency: 1 }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 6);
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

      var iterator = new Iterator(DIR);
      iterator
        .forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { concurrency: 5 }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 6);
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

      var iterator = new Iterator(DIR);
      iterator
        .forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { concurrency: Infinity }
        )
        .then(function () {
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
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
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
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
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
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
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
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
