var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf2');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

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

describe('promise', function () {
  if (typeof Promise === 'undefined') return; // no promise support

  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('should be default false', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.ok(spys.callCount, 13);
          done();
        } else consume();
      });
    }
    consume();
  });

  it('simple forEach (async)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, { lstat: true });
    iterator.forEach(
      function (entry, callback) {
        spys(entry.stats);
        assert.ok(entry);
        assert.ok(!callback);
        return Promise.resolve();
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

  it('simple forEach (stop)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, { lstat: true });
    iterator.forEach(
      function (entry, callback) {
        spys(entry.stats);
        assert.ok(entry);
        assert.ok(!callback);
        return Promise.resolve(false);
      },
      { concurrency: 1 },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 1);
        assert.equal(spys.file.callCount, 0);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
      lstat: true,
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        } else consume();
      });
    }
    consume();
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        } else consume();
      });
    }
    consume();
  });

  it('should propagate errors', function (done) {
    var iterator = new Iterator(DIR, {
      filter: function () {
        return Promise.reject(new Error('Failed'));
      },
    });

    function consume() {
      iterator.next().catch(function (err) {
        assert.ok(!!err);
        done();
      });
    }
    consume();
  });
});
