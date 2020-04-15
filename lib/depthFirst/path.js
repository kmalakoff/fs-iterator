var path = require('path');

var directory = require('./directory');
var filterAndStats = require('./filterAndStats');

module.exports = function processPath(item, options, callback) {
  var entry = {};
  entry.basename = item.basename;
  entry.path = item.path ? path.join(item.path, entry.basename) : entry.basename;
  entry.fullPath = entry.path ? path.join(item.root, entry.path) : item.root;

  filterAndStats(entry, item, options, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    if (entry.stats.isDirectory()) directory(entry, item, options, callback);
    else callback(null, entry);
  });
};
