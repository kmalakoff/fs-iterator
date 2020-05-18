var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

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
var DELETE_PATH = 'dir2' + path.sep + 'file1';

describe('everything', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler - no return)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        errors.push(err);
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler - return false)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!!err);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler - return true)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        assert.ok(!!err);
        return true;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 0);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach false)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
          return false;
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach true)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        assert.ok(!!err);
        return false;
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
        assert.ok(err);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(TEST_DIR, {
      filter: function (entry) {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });
});
