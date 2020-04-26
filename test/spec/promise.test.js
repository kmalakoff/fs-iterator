var assert = require('assert');
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

var Iterator = require('../..');
var statsSpys = require('../lib/statsSpys');
var sleep = require('../lib/sleep');

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
        spys(entry.stats, entry.path);
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
        spys(entry.stats, entry.path);
        assert.ok(entry);
        assert.ok(!callback);
        return sleep();
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
        spys(entry.stats, entry.path);
        assert.ok(entry);
        assert.ok(!callback);
        return sleep().then(function () {
          return false;
        });
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
        spys(entry.stats, entry.path);
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
        spys(entry.stats, entry.path);
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
        return sleep().then(function () {
          throw new Error('Failed');
        });
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
