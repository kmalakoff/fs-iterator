var Stats = require('stats-incremental');
var heapdump = require('heapdump');
const pify = require('pify');
const gc = require('expose-gc/function');
var humanize = require('humanize-data');

const writeSnapshot = pify(heapdump.writeSnapshot);

module.exports = class MemoryTest {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  async run(options) {
    const maxTime = options.maxTime;
    await this.callibrate();
    const startTime = Date.now();
    const stats = { end: { name: this.name, stats: Stats() }, max: { name: this.name, stats: Stats() } };

    do {
      const run = await this.runOnce(options);
      stats.end.stats.update(run.end);
      stats.max.stats.update(run.iteration.max);
    } while (Date.now() - startTime <= maxTime);

    return stats;
  }

  async callibrate(options = {}) {
    await writeSnapshot(`hd-calibrate.heapsnapshot`);
    await this.fn(() => {});
    await this.fn(() => {});
  }

  async runOnce(options = {}) {
    const now = Date.now();
    const stats = Stats();
    this.n++;

    const dump = options.heapdumpTrigger && !options.heapdumped;
    let dumped = false;
    if (dump) {
      options.heapdumped = true;
      gc();
      await writeSnapshot(`hd-${this.name}-${now}-start.heapsnapshot`);
    }
    gc();
    const start = process.memoryUsage();

    await this.fn(async () => {
      gc();
      const heapUsed = process.memoryUsage().heapUsed - start.heapUsed;
      stats.update(heapUsed);
      if (dump && heapUsed > options.heapdumpTrigger) {
        if (!dumped) {
          dumped = true;
          await writeSnapshot(`hd-${this.name}-${now}-triggered.heapsnapshot`);
        }
      }
    });

    gc();
    const end = process.memoryUsage().heapUsed - start.heapUsed;
    if (dump) {
      gc();
      await writeSnapshot(`hd-${this.name}-${now}-end.heapsnapshot`);
    }
    return { end: end, iteration: stats };
  }

  static formatStats(stats) {
    var memoryStdev = Math.sqrt(stats.variance / stats.mean) / 100;
    return `${humanize(stats.mean)} ±${memoryStdev.toFixed(1)}% (${stats.n} runs sampled)`;
  }
};
