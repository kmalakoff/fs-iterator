var Stats = require('stats-incremental');
var heapdump = require('heapdump');

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
      const run = await this.runOnce(this.fn, options);
      stats.end.stats.update(run.end);
      stats.max.stats.update(run.iteration.max);
    } while (Date.now() - startTime <= maxTime);

    return stats;
  }

  async runOnce(fn, options = {}) {
    const now = Date.now();
    const stats = Stats();
    gc();
    const start = process.memoryUsage();

    const dump = options.heapdumpTrigger && !options.heapdumped;
    if (dump) {
      options.heapdumped = true;
      heapdump.writeSnapshot(`hd-${this.name}-${now}-start.heapsnapshot`);
    }

    await fn(() => {
      const heapUsed = process.memoryUsage().heapUsed - start.heapUsed;
      stats.update(heapUsed);
      if (dump && heapUsed > options.heapdumpTrigger) {
        heapdump.writeSnapshot(`hd-${this.name}-${now}-triggered.heapsnapshot`);
      }
    });
    gc();
    return { end: process.memoryUsage().heapUsed - start.heapUsed, iteration: stats };
  }
};
