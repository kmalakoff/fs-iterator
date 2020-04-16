var directory = require('./directory');
var filterAndStats = require('./filterAndStats');
var join = require('./join');

module.exports = function path(item, options, callback) {
  var entry = {};
  entry.basename = item.basename;
  entry.path = join(item.path, entry.basename);
  entry.fullPath = join(item.root, entry.path);

  filterAndStats(entry, item, options, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    if (entry.stats.isDirectory()) directory(entry, item, options, callback);
    else callback(null, entry);
  });
};
