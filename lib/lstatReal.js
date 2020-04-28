const fs = require('fs');

var fsCompat = require('./fs-compat');

module.exports = function lstatReal(path, options, callback) {
  fs.realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    fsCompat.lstat(realpath, options, callback);
  });
};
