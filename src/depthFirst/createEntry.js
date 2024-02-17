const sep = require('path').sep;

function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + sep + right;
}

module.exports = function createEntry(iterator, item) {
  const entry = {};
  if (item.basename.name) {
    entry.basename = item.basename.name;
    entry.stats = item.basename;
  } else {
    entry.basename = item.basename;
  }
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(iterator.root, entry.path);
  return entry;
};
