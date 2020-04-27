var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
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
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
};

describe('async await', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('should be default false', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.ok(spys.callCount, 13);
  });

  it('Should find everything with no return', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
      },
      lstat: true,
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('Should find everything with return true', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });

    let value = await iterator.next();
    while (value) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
      value = await iterator.next();
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('should propagate errors', async function () {
    var iterator = new Iterator(DIR, {
      filter: function () {
        return Promise.reject(new Error('Failed'));
      },
    });

    try {
      let value = await iterator.next();
      while (value) {
        assert.ok(typeof value.basename === 'string');
        assert.ok(typeof value.path === 'string');
        assert.ok(typeof value.fullPath === 'string');
        assert.ok(typeof value.stats === 'object');
        value = await iterator.next();
      }
    } catch (err) {
      assert.ok(!!err);
    }
  });
});
