var chai = require('chai');
chai.use(require('sinon-chai'));
var sinon = require('sinon');

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
};

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

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
    var statsSpy = sinon.spy();

    var iterator = new Iterator(DIR, {
      filter: function () {
        statsSpy();
      },
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.ok(statsSpy.callCount, 13);
          statsSpy.args.forEach(function (args) {
            assert.isUndefined(args[0]);
          });
          done();
        } else consume();
      });
    }
    consume();
  });

  it('simple forEach (async)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR);
    iterator.forEach(
      function (entry, callback) {
        spys(fs.lstatSync(entry.fullPath), entry.path);
        assert.ok(entry);
        assert.ok(!callback);
        return sleep(10);
      },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('simple forEach (async, stop)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR);
    iterator.forEach(
      function (entry, callback) {
        spys(fs.lstatSync(entry.fullPath), entry.path);
        assert.ok(entry);
        assert.ok(!callback);
        return sleep(10).then(function () {
          return false;
        });
      },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(fs.lstatSync(entry.fullPath), entry.path);
      },
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.equal(spys.dir.callCount, 6);
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
        spys(fs.lstatSync(entry.fullPath), entry.path);
        return true;
      },
    });

    function consume() {
      iterator.next().then(function (value) {
        if (value === null) {
          assert.equal(spys.dir.callCount, 6);
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
        return sleep(10).then(function () {
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
