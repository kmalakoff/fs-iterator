import type Iterator from '../FSIterator.js';
import fsCompat from '../fs-compat/index.js';
import lifoFromArray from '../lifoFromArray.js';
import createEntry from './createEntry.js';
import filter from './filter.js';
import stat from './stat.js';

function isDirectory(entry) {
  if (entry.realStats) return entry.realStats.isDirectory();
  return entry.stats.isDirectory();
}

export default function path<T>(item, iterator: Iterator<T>, callback) {
  const depth = item.depth;
  const entry = createEntry(iterator, item);
  item = null; // release reference

  stat(iterator, entry, function statCallback(err) {
    if (err || iterator.isDone()) return callback(err);

    filter(iterator, entry, function filterCallback(err, keep) {
      if (err || !keep || iterator.isDone()) return callback(err);

      // not a directory or is a directory, but next level is too deep
      if (!isDirectory(entry) || depth + 1 > iterator.depth) return callback(null, entry);

      // get files in this directory
      fsCompat.readdir(entry.fullPath, iterator.readdirOptions, function readdirCallback(err, files) {
        if (err || iterator.isDone()) return callback(err);
        if (files.length) iterator.push({ path: entry.path, depth: depth + 1, files: lifoFromArray(files) });
        return callback(null, entry);
      });
    });
  });
}
