var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

var stream = require('stream');
var inherits = require('inherits');

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

function IteratorStream(iterator, options) {
  if (!(this instanceof IteratorStream)) throw new Error('Create IteratorStream using new');
  options = options || {};
  stream.Readable.call(this, { objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });
  this.iterator = iterator;
  this.options = options;
}
inherits(IteratorStream, stream.Readable);

IteratorStream.prototype._read = function (batch) {
  if (this.reading) return;
  this.reading = true;

  var self = this;
  this.iterator.forEach(
    function (entry) {
      if (self.destroyed) return;
      self.push(entry);
    },
    { limit: batch, concurrency: this.highWaterMark || 4096 },
    function (err, done) {
      self.reading = false;
      if (err) return self.destroy(err);
      if (done) self.push(null);
    }
  );
};
IteratorStream.prototype.destroy = function (err) {
  stream.Readable.prototype.destroy.call(this, err);
  if (!this.iterator.destroyed) this.iterator.destroy();
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

  it('simple forEach (async)', function (done) {
    var spys = statsSpys();

    var iteratorStream = new IteratorStream(new Iterator(DIR, { lstat: true }));
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
});
