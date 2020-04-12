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

describe('forEach', function () {
  describe('limit', function () {
    after(function (done) {
      rimraf(DIR, done);
    });

    describe('sync', function () {
      beforeEach(function (done) {
        rimraf(DIR, function () {
          generate(DIR, STRUCTURE, done);
        });
      });

      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR);
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: Infinity, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 6);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should run with concurrency 1', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR);
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 0);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR);
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: 5 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR);
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: Infinity },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity and only files', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return entry.basename ? !entry.stats.isDirectory() : true;
          },
        });
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 4, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 4);
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

      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            setTimeout(callback, 10);
          },
          async: true,
        });

        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: Infinity, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 6);
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
            setTimeout(callback, 10);
          },
          async: true,
        });
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 0);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('should run with concurrency 5', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            setTimeout(callback, 10);
          },
          async: true,
        });
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: 5 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            setTimeout(callback, 10);
          },
          async: true,
        });
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 3, concurrency: Infinity },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            done();
          }
        );
      });
      it('should run with concurrency Infinity and only files', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry, callback) {
            setTimeout(function () {
              callback(null, entry.basename ? !entry.stats.isDirectory() : true);
            }, 10);
          },
          async: true,
        });
        iterator.forEach(
          function (entry) {
            spys(fs.lstatSync(entry.fullPath), entry.path);
          },
          { limit: 4, concurrency: 1 },
          function (err, empty) {
            assert.ok(!err);
            assert.ok(empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 4);
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

      it('infinite limit to get all', function (done) {
        var spys = statsSpys();

        var iterator = new Iterator(DIR, {
          filter: function (entry) {
            return sleep(10);
          },
        });

        iterator
          .forEach(
            function (entry) {
              spys(fs.lstatSync(entry.fullPath), entry.path);
            },
            { limit: Infinity, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(empty);
            assert.equal(spys.dir.callCount, 6);
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
            return sleep(10);
          },
        });
        iterator
          .forEach(
            function (entry) {
              spys(fs.lstatSync(entry.fullPath), entry.path);
            },
            { limit: 3, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 0);
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
            return sleep(10);
          },
        });
        iterator
          .forEach(
            function (entry) {
              spys(fs.lstatSync(entry.fullPath), entry.path);
            },
            { limit: 3, concurrency: 5 }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
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
            return sleep(10);
          },
        });
        iterator
          .forEach(
            function (entry) {
              spys(fs.lstatSync(entry.fullPath), entry.path);
            },
            { limit: 3, concurrency: Infinity }
          )
          .then(function (empty) {
            assert.ok(!empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 3);
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
            return sleep(10).then(function () {
              return entry.basename ? !entry.stats.isDirectory() : true;
            });
          },
        });
        iterator
          .forEach(
            function (entry) {
              spys(fs.lstatSync(entry.fullPath), entry.path);
            },
            { limit: 4, concurrency: 1 }
          )
          .then(function (empty) {
            assert.ok(empty);
            assert.equal(spys.dir.callCount + spys.file.callCount + spys.link.callCount, 4);
            assert.equal(spys.dir.callCount, 1);
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
