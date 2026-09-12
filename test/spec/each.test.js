var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

var Iterator = require('../..');
var isPromise = require('../../lib/isPromise');
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

describe('each', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('callback interface', function () {
    it('each function is mandatory', function (done) {
      if (typeof Promise === 'undefined') return done(); // no promise support

      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      var promise = iterator.each(function (err) {
        assert.ok(!err);
      });
      assert.ok(isPromise(promise));
      promise
        .then(function () {
          var iterator2 = new Iterator(DIR, {
            filter: function (entry) {
              var stats = fs.lstatSync(entry.fullPath);
              spys(stats, entry.path);
            },
          });

          var nothing = iterator2.each(
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

    it('simple each (default)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator.each(
        function () {},
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple each (concurency: 1)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator.each(
        function () {},
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

    it('simple each (concurency: 5)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator.each(
        function () {},
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

    it('simple each (concurency: Infinity)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator.each(
        function () {},
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
        filter: function () {
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator.each(
        function (err) {
          if (err) throw err;
        },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 1)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator.each(
        function (err) {
          if (err) throw err;
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: 5)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator.each(
        function (err) {
          if (err) throw err;
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });

    it('should propagate errors (concurency: Infinity)', function (done) {
      var iterator = new Iterator(DIR, {
        filter: function () {
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator.each(
        function (err) {
          if (err) throw err;
        },
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

    it('each function is mandatory', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      try {
        iterator
          .each()
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

    it('simple each (default)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator
        .each(function () {})
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

    it('simple each (concurrency: 1)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator
        .each(function () {}, { concurrency: 1 })
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

    it('simple each (concurrency: 5)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator
        .each(function () {}, { concurrency: 5 })
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

    it('simple each (concurrency: Infinity)', function (done) {
      var spys = statsSpys();

      var iterator = new Iterator(DIR, {
        filter: function (entry) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
      });

      iterator
        .each(function () {}, { concurrency: Infinity })
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
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator
        .each(function (err) {
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
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator
        .each(
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
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator
        .each(
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
          return sleep(50).then(function () {
            throw new Error('Failed');
          });
        },
      });

      iterator
        .each(
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
