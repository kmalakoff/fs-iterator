var toLifo = require('../toLifo');

module.exports = function directory(entry, item, options, callback) {
  options.fs.readdir(entry.fullPath, function (err, names) {
    if (err) return callback(err);

    if (names.length) options.push({ root: item.root, path: entry.path, depth: item.depth + 1, names: toLifo(names) });
    return callback(null, entry);
  });
};
