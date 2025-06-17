import type Iterator from '../FSIterator.js';
import fsCompat from '../fs-compat/index.js';
import type { Entry, StackEntry } from '../types.js';
import createEntry from './createEntry.js';
import filter from './filter.js';
import stat from './stat.js';

function isDirectory(entry) {
  if (entry.realStats) return entry.realStats.isDirectory();
  return entry.stats.isDirectory();
}

export type Callback = (error?: Error, entry?: IteratorResult<Entry>) => undefined;

export default function depthFirst<_T>(item: StackEntry, iterator: Iterator, callback: Callback): undefined {
  const depth = item.depth;
  const entry = createEntry(iterator, item);
  item = null; // release reference

  stat(iterator, entry, function statCallback(err) {
    if (err || iterator.isDone()) return callback(err);

    filter(iterator, entry, function filterCallback(err, keep) {
      if (err || !keep || iterator.isDone()) return callback(err);

      // not a directory or is a directory, but next level is too deep
      if (!isDirectory(entry) || depth + 1 > iterator.depth) return callback(null, { done: false, value: entry });

      // get files in this directory
      fsCompat.readdir(entry.fullPath, iterator.readdirOptions, (err, files) => {
        if (err || iterator.isDone()) return callback(err);
        if (files.length) {
          const stackItems = files.map((x) => depthFirst.bind(null, { path: entry.path, depth: depth + 1, basename: x })).reverse();
          iterator.push.apply(iterator, stackItems);
        }
        return callback(null, { done: false, value: entry });
      });
    });
  });
}
