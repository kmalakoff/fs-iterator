var path = require('path');

var processPath = require('./processPath');

module.exports = function processNextFilename(item, options, callback) {
  if (!item.names.length) return callback();
  var name = item.names.pop();
  if (item.names.length) options.push(item);
  processPath({ root: item.root, path: path.join(item.path, name), depth: item.depth }, options, callback);
};
