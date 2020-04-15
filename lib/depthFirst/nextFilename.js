var path = require('./path');

module.exports = function nextFilename(item, options, callback) {
  if (!item.names.length) return callback();

  var name = item.names.pop();
  if (item.names.length) options.push(item);
  path({ root: item.root, path: item.path, basename: name, depth: item.depth }, options, callback);
};
