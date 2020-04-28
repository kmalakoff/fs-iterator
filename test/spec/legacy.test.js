var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');
var nextTick = require('next-tick');

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

describe('legacy', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, DIR));

  it('Iterator async renamed to callbacks', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry, callback) {
        spys(entry.stats);
        nextTick(callback);
      },
      async: true,
      lstat: true,
    });
    iterator.forEach(
      function () {},
      { concurrency: 1 },
      function (err) {
        assert.ok(!err);
        assert.ok(spys.callCount, 13);
        done();
      }
    );
  });

  it('forEach async renamed to callbacks', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, { lstat: true });
    iterator.forEach(
      function (entry, callback) {
        spys(entry.stats);
        assert.ok(entry);
        assert.ok(callback);
        setTimeout(function () {
          callback(null, false);
        }, 10);
      },
      { async: true },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });
});
