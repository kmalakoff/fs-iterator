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

describe('asyncIterator', function () {
  after(function (done) {
    rimraf(DIR, done);
  });
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });

  it('should be default false', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats, entry.path);
      },
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.ok(spys.callCount, 13);
  });

  it('Should find everything with no return', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats, entry.path);
      },
      lstat: true,
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('Should find everything with return true', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats, entry.path);
        return true;
      },
      lstat: true,
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('should propagate errors', async function () {
    var iterator = new Iterator(DIR, {
      filter: function () {
        return sleep().then(function () {
          throw new Error('Failed');
        });
      },
    });

    try {
      for await (const value of iterator) {
        assert.ok(typeof value.basename === 'string');
        assert.ok(typeof value.path === 'string');
        assert.ok(typeof value.fullPath === 'string');
        assert.ok(typeof value.stats === 'object');
      }
    } catch (err) {
      assert.ok(!!err);
    }
  });
});
