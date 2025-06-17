import compat from 'async-compat';

import type { AbstractIterator } from 'stack-base-iterator';
import type Iterator from '../FSIterator.js';
import type { Entry, IteratorOptions } from '../types.js';

export type Callback = (error?: Error, keep?: boolean) => undefined;

export default function filter(iterator: Iterator, entry: Entry, callback: Callback): undefined {
  const options = (iterator as unknown as AbstractIterator<Entry>).options as IteratorOptions;
  if (!options.filter) return callback(null, true);

  compat.asyncFunction(options.filter, options.callbacks, entry, (err, keep) => {
    err ? callback(err) : callback(null, !!compat.defaultValue(keep, true));
  });
}
