var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

var statsSpys = require('../statsSpys');
var IteratorStream = require('../IteratorStream');

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

describe('stream', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('default', function (done) {
    var spys = statsSpys();

    var iteratorStream = new IteratorStream(DIR);
    iteratorStream.on('data', function (entry) {
      spys(entry.stats, entry.path);
    });
    iteratorStream.on('error', function (err) {
      assert.ok(!err);
    });
    iteratorStream.on('end', function () {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('directories only (highWaterMark: 1)', function (done) {
    var spys = statsSpys();

    var iteratorStream = new IteratorStream(DIR, {
      highWaterMark: 1,
      filter: function filter(entry) {
        return entry.stats.isDirectory();
      },
    });
    iteratorStream.on('data', function (entry) {
      spys(entry.stats, entry.path);
    });
    iteratorStream.on('error', function (err) {
      assert.ok(!err);
    });
    iteratorStream.on('end', function () {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 0);
      assert.equal(spys.link.callCount, 0);
      done();
    });
  });

  it('skip directories (highWaterMark: 1)', function (done) {
    var spys = statsSpys();

    var iteratorStream = new IteratorStream(DIR, {
      highWaterMark: 1,
    });
    iteratorStream.on('data', function (entry) {
      if (entry.stats.isDirectory()) return;
      spys(entry.stats, entry.path);
    });
    iteratorStream.on('error', function (err) {
      assert.ok(!err);
    });
    iteratorStream.on('end', function () {
      assert.equal(spys.dir.callCount, 0);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });
});
