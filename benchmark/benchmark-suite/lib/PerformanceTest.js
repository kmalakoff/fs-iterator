var Stats = require('stats-incremental');

module.exports = class PerformanceTest {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  async run(options) {
    const maxTime = options.maxTime;
    await this.callibrate(options);
    const startTime = Date.now();
    const stats = { end: { name: this.name, stats: Stats() } };

    do {
      const time = await this.runOnce(options);
      stats.end.stats.update(time);
    } while (Date.now() - startTime <= maxTime);

    return stats;
  }

  async callibrate(options) {
    await this.fn(() => {});
    await this.fn(() => {});
  }

  async runOnce(options) {
    const now = Date.now();
    await this.fn(() => {});
    return Date.now() - now;
  }

  static formatStats(stats) {
    var ops = stats.n / stats.mean;
    var opsStdev = stats.n / Math.sqrt(stats.variance / stats.mean) / 100;
    return `${ops.toFixed(2)} ops/s ±${opsStdev.toFixed(1)}% (${stats.n} runs sampled)`;
  }
};
