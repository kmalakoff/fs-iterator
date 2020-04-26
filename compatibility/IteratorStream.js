var ReadableStream = require('stream').Readable;
var inherits = require('inherits');
var assign = require('object.assign');

var Iterator = require('..');

function IteratorStream(root, options) {
  if (!(this instanceof IteratorStream)) return new IteratorStream(root, options);
  options = assign({}, options || {});
  ReadableStream.call(this, { objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });

  var self = this;
  var error = options.error;
  options.error = function (err) {
    if (!this.destroyed) return;
    if (~Iterator.EXPECTED_ERRORS.indexOf(err.code)) self.emit('warn', err);
    else self.emit('error', err);
    return !error || error(err);
  };
  this.options = options;
  this.processing = 0;
  this.iterator = new Iterator(root, options);
}
inherits(IteratorStream, ReadableStream);

IteratorStream.prototype.destroy = function (err) {
  ReadableStream.prototype.destroy.call(this, err);
  if (this.iterator) {
    this.iterator.destroy();
    this.iterator = null;
  }
};

IteratorStream.prototype._read = function (batch) {
  var self = this;
  this.processing++;
  this.iterator.forEach(
    function (entry) {
      if (self.destroyed || self.done) return;
      batch--;
      self.push(entry);
    },
    {
      limit: batch,
    },
    function (err, done) {
      self.processing--;
      if (self.destroyed || self.done) return;
      if (err) self.destroy(err);
      else if (done) {
        if (self.processing <= 0) {
          self.done = true;
          self.push(null);
        }
      } else if (batch) self._read(batch);
    }
  );
};

module.exports = IteratorStream;
