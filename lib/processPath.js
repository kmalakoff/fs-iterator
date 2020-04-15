var path = require('path');

var processDirectory = require('./processDirectory');
var processFilterAndStats = require('./processFilterAndStats');

module.exports = function processPath(item, options, callback) {
  var entry = {};
  entry.path = item.path;
  entry.fullPath = path.join(item.root, entry.path);
  entry.basename = path.basename(item.path); // TODO: optimize?

  processFilterAndStats(entry, item, options, function (err, keep) {
    if (err) return callback(err);
    if (!keep) return callback();

    if (entry.stats.isDirectory()) processDirectory(entry, item, options, callback);
    else callback(null, entry);
  });
};
