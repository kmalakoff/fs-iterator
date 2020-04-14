var Stats = require('stats-incremental');

var gc = require('./gc');

module.exports = class Test {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  async run(options) {
    const maxTime = options.maxTime;
    const startTime = Date.now();
    const stats = { end: { name: this.name, stats: Stats() }, max: { name: this.name, stats: Stats() } };

    do {
      const run = await this.runOnce(this.fn);
      stats.end.stats.update(run.end);
      stats.max.stats.update(run.iteration.max);
    } while (Date.now() - startTime <= maxTime);

    return stats;
  }

  async runOnce(fn) {
    const stats = Stats();
    gc();
    const start = process.memoryUsage();
    await fn(function () {
      stats.update(process.memoryUsage().heapUsed - start.heapUsed);
    });
    gc();
    return { end: process.memoryUsage().heapUsed - start.heapUsed, iteration: stats };
  }
};
