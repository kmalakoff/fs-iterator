import type Iterator from '../FSIterator.ts';
import fsCompat from '../fs-compat/index.ts';
import type { Entry, IteratorOptions } from '../types.ts';

export type Callback = (error?: Error) => undefined;

interface IteratorWithOptions {
  options: IteratorOptions;
}

function ensureStat(iterator: Iterator, entry: Entry, callback: Callback): undefined {
  if (entry.stats) return callback();
  const options = (iterator as unknown as IteratorWithOptions).options as IteratorOptions;

  const stat = options.lstat ? fsCompat.lstat : fsCompat.stat;
  stat(entry.fullPath, iterator.statOptions, function statCallback(err, stats) {
    if (err) return callback(err);
    entry.stats = stats;
    callback();
  });
}

export default function stat(iterator: Iterator, entry: Entry, callback: Callback) {
  ensureStat(iterator, entry, function ensureStatCallback(err) {
    if (err) return callback(err);
    if (!entry.stats.isSymbolicLink()) return callback();
    fsCompat.lstatReal(entry.fullPath, iterator.statOptions, function lstatRealCallback(err, realStats) {
      if (err) return callback(err);
      entry.realStats = realStats;
      callback();
    });
  });
}
