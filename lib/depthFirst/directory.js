var toLifo = require('../toLifo');

module.exports = function directory(entry, item, options, callback) {
  options.fs.realpath(entry.fullPath, function (err, realFullPath) {
    if (err) return callback(err);

    options.fs.readdir(realFullPath, function (err, names) {
      if (err) return callback(err);

      if (names.length) {
        if (entry.fullPath === realFullPath) {
          options.push({ root: item.root, path: entry.path, depth: item.depth + 1, names: toLifo(names) });
        } else {
          options.push({ root: realFullPath, path: '', depth: item.depth + 1, names: toLifo(names) });
        }
      }
      return callback(null, entry);
    });
  });
};
