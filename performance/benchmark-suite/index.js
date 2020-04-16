var EventEmitter = require('eventemitter3');

var TESTS = {
  Memory: require('./lib/MemoryTest'),
  Performance: require('./lib/PerformanceTest'),
};

module.exports = class Suite extends EventEmitter {
  constructor(name, type) {
    super();
    this.name = name;
    if (!type) throw new Error('Performance Suite needs a test type');
    this.type = type;
    this.Test = TESTS[this.type];
    if (!this.Test) throw new Error(`Performance Suite test type not recognized ${type}`);
    this.tests = [];
  }

  add(name, fn) {
    this.tests.push(new this.Test(name, fn));
  }

  async run(options) {
    if (!options.maxTime) throw new Error('Missing maxTime option');
    const largest = {};

    for (const test of this.tests) {
      const stats = await test.run(options);
      for (var key in stats) {
        if (!largest[key] || largest[key].stats.max < stats[key].stats.max) largest[key] = stats.end;
      }
      this.emit('cycle', stats);
    }
    this.emit('complete', largest);
  }

  formatStats(stats) {
    return this.Test.formatStats(stats);
  }
};
