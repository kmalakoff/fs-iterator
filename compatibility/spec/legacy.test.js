var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

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

var statsSpys = require('../statsSpys');

describe('legacy', function () {
  after(function (done) {
    rimraf(DIR, done);
  });
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });

  it('Iterator async renamed to callbacks', function (done) {
    var filterSpy = sinon.spy();

    var iterator = new Iterator(DIR, {
      filter: function (entry, callback) {
        filterSpy();
        setTimeout(callback, 10);
      },
      async: true,
      lstat: true,
    });
    iterator.forEach(
      function () {},
      { concurrency: 1 },
      function (err) {
        assert.ok(!err);
        assert.ok(filterSpy.callCount, 13);
        done();
      }
    );
  });

  it('forEach async renamed to callbacks', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, { lstat: true });
    iterator.forEach(
      function (entry, callback) {
        spys(entry.stats, entry.path);
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
