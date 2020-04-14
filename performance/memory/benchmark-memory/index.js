var EventEmitter = require('eventemitter3');
var humanize = require('humanize-data');

var Test = require('./lib/Test');

module.exports = class MemorySuite extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.tests = [];
  }

  add(name, fn) {
    this.tests.push(new Test(name, fn));
  }

  async run(options) {
    if (!options.maxTime) throw new Error('Missing maxTime option');
    const largest = { end: null, max: null };

    for (const test of this.tests) {
      const stats = await test.run(options);
      if (!largest.end || largest.end.stats.max < stats.end.stats.max) largest.end = stats.end;
      if (!largest.max || largest.max.stats.max < stats.max.stats.max) largest.max = stats.max;
      this.emit('cycle', stats);
    }
    this.emit('complete', largest);
  }

  formatStats(stats) {
    return `${humanize(stats.mean)} ±${Math.sqrt(stats.variance / stats.mean).toFixed(1)}% (${stats.n} runs sampled)`;
  }
};
