import fsCompat from '../fs-compat/index.mjs';
import lifoFromArray from '../lifoFromArray.mjs';
import createEntry from './createEntry.mjs';
import filter from './filter.mjs';
import stat from './stat.mjs';

function isDirectory(entry) {
  if (entry.realStats) return entry.realStats.isDirectory();
  return entry.stats.isDirectory();
}

export default function path(item, iterator, callback) {
  const depth = item.depth;
  const entry = createEntry(iterator, item);
  item = null; // release reference

  stat(iterator, entry, function statCallback(err) {
    if (err || iterator.done) return callback(err);

    filter(iterator, entry, function filterCallback(err, keep) {
      if (err || !keep || iterator.done) return callback(err);

      // not a directory or is a directory, but next level is too deep
      if (!isDirectory(entry) || depth + 1 > iterator.options.depth) return callback(null, entry);

      // get files in this directory
      fsCompat.readdir(entry.fullPath, iterator.options.readdir, function readdirCallback(err, files) {
        if (err || iterator.done) return callback(err);
        if (files.length) iterator.push({ path: entry.path, depth: depth + 1, files: lifoFromArray(files) });
        return callback(null, entry);
      });
    });
  });
}
