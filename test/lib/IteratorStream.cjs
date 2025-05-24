const ReadableStream = require('stream').Readable;
const inherits = require('util').inherits;

const Iterator = require('fs-iterator');

function IteratorStream(root, options = {}) {
  if (!(this instanceof IteratorStream)) return new IteratorStream(root, options);
  options = { ...options };
  ReadableStream.call(this, { objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });

  const self = this;
  const error = options.error;
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
if (ReadableStream) inherits(IteratorStream, ReadableStream);

IteratorStream.prototype.destroy = function (err) {
  ReadableStream.prototype.destroy.call(this, err);
  if (this.iterator) {
    this.iterator.destroy();
    this.iterator = null;
  }
};

IteratorStream.prototype._read = function (batch) {
  this.processing++;
  this.iterator.forEach(
    (entry) => {
      if (this.destroyed || this.done) return;
      batch--;
      this.push(entry);
    },
    {
      limit: batch,
    },
    (err, done) => {
      this.processing--;
      if (this.destroyed || this.done) return;
      if (err) this.destroy(err);
      else if (done) {
        if (this.processing <= 0) {
          this.done = true;
          this.push(null);
        }
      } else if (batch) this._read(batch);
    }
  );
};
module.exports = ReadableStream ? IteratorStream : undefined;
