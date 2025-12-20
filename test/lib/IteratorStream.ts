import Iterator, { type IteratorOptions } from 'fs-iterator';
import type { ReadableOptions } from 'stream';
import { Readable } from './compat.ts';

export default class IteratorStream extends Readable {
  options: IteratorOptions;
  processing: number;
  done: boolean;
  iterator_: Iterator;

  constructor(root, options: IteratorOptions | ReadableOptions = {}) {
    const readableOptions = options as ReadableOptions;
    super({ objectMode: true, highWaterMark: readableOptions.highWaterMark || 4096 });

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

  // @ts-expect-error
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
      (entry): void => {
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
}
