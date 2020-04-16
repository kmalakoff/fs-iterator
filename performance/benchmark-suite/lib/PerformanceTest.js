var Stats = require('stats-incremental');

module.exports = class PerformanceTest {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  async run(options) {
    const maxTime = options.maxTime;
    await this.callibrate();
    const startTime = Date.now();
    const stats = { end: { name: this.name, stats: Stats() } };

    do {
      const run = await this.runOnce(options);
      stats.end.stats.update(run.end);
    } while (Date.now() - startTime <= maxTime);

    return stats;
  }

  async callibrate(options = {}) {
    await this.fn(() => {});
    await this.fn(() => {});
  }

  async runOnce(options = {}) {
    const now = Date.now();
    await this.fn(() => {});
    return { end: Date.now() - now };
  }

  formatStats(stats) {
    return `${stats.mean.toFixed(1)} ±${(Math.sqrt(stats.variance / stats.mean) / 100).toFixed(1)}% (${stats.n} runs sampled)`;
  }
};
