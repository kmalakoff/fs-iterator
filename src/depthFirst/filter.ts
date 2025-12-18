import compat from 'async-compat';

import type Iterator from '../FSIterator.ts';
import type { Entry, IteratorOptions } from '../types.ts';

export type Callback = (error?: Error, keep?: boolean) => void;

interface IteratorWithOptions {
  options: IteratorOptions;
}

export default function filter(iterator: Iterator, entry: Entry, callback: Callback): void {
  const options = (iterator as unknown as IteratorWithOptions).options;
  if (!options.filter) return callback(null, true);

  compat.asyncFunction(options.filter, options.callbacks, entry, (err, keep) => {
    err ? callback(err) : callback(null, !!compat.defaultValue(keep, true));
  });
}
