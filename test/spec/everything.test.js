var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var maximize = require('maximize-iterator');

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

describe('iterate over everything', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        var stats = fs.lstatSync(entry.fullPath);
        spys(stats, entry.path);
      },
    });
    maximize(iterator, function (err) {
      assert.ok(!err);
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        var stats = fs.lstatSync(entry.fullPath);
        spys(stats, entry.path);
        return true;
      },
    });
    maximize(iterator, function (err) {
      assert.ok(!err);
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });
  it('Should handle a delete', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        var stats = fs.lstatSync(entry.fullPath);
        spys(stats, entry.path);

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
    });
    maximize(iterator, { concurrency: 1 }, function (err) {
      assert.ok(!err);
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 4);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });
});
