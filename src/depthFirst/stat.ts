import fsCompat from '../fs-compat/index.js';

function ensureStat(iterator, entry, callback) {
  if (entry.stats) return callback();

  const stat = iterator.options.lstat ? fsCompat.lstat : fsCompat.stat;
  return stat(entry.fullPath, iterator.statOptions, function statCallback(err, stats) {
    if (err) return callback(err);
    entry.stats = stats;
    callback();
  });
}

export default function stat(iterator, entry, callback) {
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
