import compat from 'async-compat';

import type { AbstractIterator } from 'stack-base-iterator';
import type Iterator from '../FSIterator.js';
import type { Entry, IteratorOptions } from '../types.js';

export type Callback = (error?: Error, keep?: boolean) => undefined;

export default function filter(iterator: Iterator, entry: Entry, callback: Callback): undefined {
  const optons = (iterator as unknown as AbstractIterator<Entry>).options as IteratorOptions;
  if (!optons.filter) return callback(null, true);

  compat.asyncFunction(optons.filter, optons.callbacks, entry, (err, keep) => {
    if (err) return callback(err);
    if (!compat.defaultValue(keep, true)) return callback();
    callback(null, true);
  });
}
