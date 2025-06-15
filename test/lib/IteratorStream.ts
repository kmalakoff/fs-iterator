import stream, { type ReadableOptions } from 'stream';

// @ts-ignore
import Iterator, { type IteratorOptions } from 'fs-iterator';
let value = undefined;

if (stream.Readable) {
  value = class IteratorStream extends stream.Readable {
    options: IteratorOptions;
    processing: number;
    done: boolean;
    iterator_: Iterator;

    constructor(root, options: IteratorOptions | ReadableOptions = {}) {
      const readableOptions = options as ReadableOptions;
      super({ objectMode: true, autoDestroy: true, highWaterMark: readableOptions.highWaterMark || 4096 });

      const iteratorOptions = options as IteratorOptions;

      const error = iteratorOptions.error;
      iteratorOptions.error = (err) => {
        if (!this.destroyed) return;
        if (~Iterator.EXPECTED_ERRORS.indexOf(err.code)) this.emit('warn', err);
        else this.emit('error', err);
        return !error || error(err);
      };
      this.options = iteratorOptions;
      this.processing = 0;
      this.iterator_ = new Iterator(root, iteratorOptions);
    }

    // @ts-ignore
    destroy(err) {
      super.destroy(err);
      if (this.iterator_) {
        this.iterator_.destroy();
        this.iterator_ = null;
      }
    }

    _read(batch) {
      this.processing++;
      this.iterator_.forEach(
        (entry): undefined => {
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
    }
  };
}

export default value;
