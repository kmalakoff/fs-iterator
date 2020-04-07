var chai = require('chai');
chai.use(require('sinon-chai'));
var sinon = require('sinon');

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var sysPath = require('path');
var fs = require('fs');

var Iterator = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));
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

describe('asyncIterator', function () {
  beforeEach(function (callback) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, callback);
    });
  });
  after(function (callback) {
    rimraf(DIR, callback);
  });

  it('should be default false', async function () {
    var statsSpy = sinon.spy();

    var iterator = new Iterator(DIR, {
      filter: function () {
        statsSpy();
      },
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.ok(statsSpy.callCount, 13);
    statsSpy.args.forEach(function (args) {
      assert.isUndefined(args[0]);
    });
  });

  it('Should find everything with no return', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (path) {
        var stats = fs.lstatSync(sysPath.join(DIR, path));
        spys(stats, path);
      },
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.equal(spys.dir.callCount, 6);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('Should find everything with return true', async function () {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (path) {
        var stats = fs.lstatSync(sysPath.join(DIR, path));
        spys(stats, path);
        return true;
      },
    });

    for await (const value of iterator) {
      assert.ok(typeof value.basename === 'string');
      assert.ok(typeof value.path === 'string');
      assert.ok(typeof value.fullPath === 'string');
      assert.ok(typeof value.stats === 'object');
    }

    assert.equal(spys.dir.callCount, 6);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('should propagate errors', async function () {
    var iterator = new Iterator(DIR, {
      filter: function () {
        return sleep(100).then(function () {
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
