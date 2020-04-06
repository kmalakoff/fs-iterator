var maximize = require('maximize-iterator');

var serial = require('./lib/serial');
var parallel = require('./lib/parallel');

module.exports = async function run(options, dir) {
  await serial(options, dir);
  await parallel(options, dir);
};
