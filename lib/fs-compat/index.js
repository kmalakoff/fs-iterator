var lstat = require('./lstat');
var readdir = require('./readdir');
var stat = require('./stat');

module.exports = {
  lstat: lstat,
  readdir: readdir,
  stat: stat,
};
