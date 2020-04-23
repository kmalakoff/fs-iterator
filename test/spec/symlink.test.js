var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

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
  link2: '~dir3/dir4',
};

describe('symlink', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('Should find everything with no return (lstat)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(fs.lstatSync(entry.fullPath), entry.path);
      },
      stats: true,
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 3);
        done();
      }
    );
  });

  it('Should find everything with no return (stat)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(fs.lstatSync(entry.fullPath), entry.path);
      },
      stats: true,
      lstat: false,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 6);
        assert.equal(spys.link.callCount, 3);
        done();
      }
    );
  });
});
