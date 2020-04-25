var stream = require('stream');
var inherits = require('inherits');

var Iterator = require('..');

function IteratorStream(root, options) {
  if (!(this instanceof IteratorStream)) return new IteratorStream(root, options);
  options = options || {};
  stream.Readable.call(this, { objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });
  this.iterator = new Iterator(root, options);
  this.options = options;
}
inherits(IteratorStream, stream.Readable);

IteratorStream.prototype.destroy = function (err) {
  stream.Readable.prototype.destroy.call(this, err);
  if (!this.iterator.destroyed) this.iterator.destroy();
};

IteratorStream.prototype._read = function (batch) {
  if (this.reading) return;
  this.reading = true;

  var self = this;
  this.iterator.forEach(
    function (entry) {
      if (self.destroyed) return;
      self.push(entry);
    },
    { limit: batch, concurrency: this.options.concurrency },
    function (err, done) {
      self.reading = false;
      if (err) return self.destroy(err);
      if (done) self.push(null);
    }
  );
};

module.exports = IteratorStream;
