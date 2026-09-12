import assert from 'assert';
import type { Stats } from 'fs';
import fs from 'fs';
import generate from 'fs-generate';
import Iterator, { type EachFunction, type Entry } from 'fs-iterator';
import { safeRm, safeRmSync } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import isPromise from 'is-promise';
import nextTick from 'next-tick';
import path from 'path';
import Pinkie from 'pinkie-promise';
import url from 'url';
import { stringStartsWith } from '../lib/compat.ts';

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('alwaysStat', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('default', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('alwaysStat false', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
          alwaysStat: false,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            assert.ok(fs.Dirent ? entry.stats instanceof fs.Dirent : entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
          alwaysStat: false,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('alwaysStat true', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();
        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            assert.ok(entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
          alwaysStat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            assert.ok(entry.stats instanceof fs.Stats);
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
          alwaysStat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('concurrency', () => {
    (() => {
      // patch and restore promise
      if (typeof global === 'undefined') return;
      const globalPromise = global.Promise;
      before(() => {
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = globalPromise;
      });
    })();

    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('synchronous', () => {
      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
        });

        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 5 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: Infinity },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 5 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: Infinity },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      it('should run with concurrency 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 5 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: Infinity },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('depth', () => {
    (() => {
      // patch and restore promise
      if (typeof global === 'undefined') return;
      const globalPromise = global.Promise;
      before(() => {
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = globalPromise;
      });
    })();

    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('synchronous', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 1,
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 2,
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 1,
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 2,
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            nextTick(callback);
          },
          callbacks: true,
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      it('depth 0 (satst: true)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 1,
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 2,
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            return Promise.resolve(undefined);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('destroy', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('callback interface', () => {
      it('destroys after iteration', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            iterator.destroy();
            done();
          }
        );
      });

      it('destroys before iteration', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
        });
        iterator.destroy();
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 0);
            assert.equal(spys.file.callCount, 0);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('handle mid-iterator destroy (concurrency 1)', (done) => {
        const spys = statsSpys();

        let count = 0;
        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            if (++count === 4) iterator.destroy();
            callback();
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 4);
            assert.equal(spys.dir.callCount, 2);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('handle mid-iterator destroy (concurrency Infinity)', (done) => {
        const spys = statsSpys();

        let count = 0;
        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            if (++count === 4) iterator.destroy();
            callback();
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: Infinity },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 4);
            done();
          }
        );
      });
    });

    describe('promise interface', () => {
      (() => {
        // patch and restore promise
        if (typeof global === 'undefined') return;
        const globalPromise = global.Promise;
        before(() => {
          global.Promise = Pinkie;
        });
        after(() => {
          global.Promise = globalPromise;
        });
      })();

      it('destroys after iteration', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
          lstat: true,
        });
        await iterator.forEach((_entry: Entry): void => {});
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        iterator.destroy();
      });

      it('destroys before iteration', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry): void => {
            spys(entry.stats as Stats);
          },
        });
        iterator.destroy();
        await iterator.forEach((_entry: Entry): void => {});
        assert.equal(spys.dir.callCount, 0);
        assert.equal(spys.file.callCount, 0);
        assert.equal(spys.link.callCount, 0);
      });

      it('handle mid-iterator destroy (concurrency 1)', async () => {
        const spys = statsSpys();

        let count = 0;
        const iterator: Iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as Stats);
            if (++count === 4) return iterator.destroy();
          },
          lstat: true,
        });
        await iterator.forEach((_entry: Entry): void => {}, { concurrency: 1 });
        assert.equal(spys.callCount, 4);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 2);
        assert.equal(spys.link.callCount, 0);
      });

      it('handle mid-iterator destroy (concurrency Infinity)', async () => {
        const spys = statsSpys();

        let count = 0;
        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry, callback) => {
            spys(entry.stats as Stats);
            if (++count === 4) iterator.destroy();
            callback();
          },
          callbacks: true,
        });
        await iterator.forEach((_entry: Entry): void => {}, { concurrency: Infinity });
        assert.equal(spys.callCount, 4);
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('errors', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('synchronous', () => {
      it('should propagate errors (default)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => new Error('Failed'),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (true)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: () => new Error('Failed'),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            concurrency: 1,
            error: (err?: Error | null) => {
              errors.push(err);
              return true;
            },
          },
          (err?: Error | null) => {
            assert.ok(!!err);
            assert.equal(errors.length, 1);
            done();
          }
        );
      });

      it('should not propagate errors (false)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: () => new Error('Failed'),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            error: (err?: Error | null) => {
              errors.push(err);
              return false;
            },
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(errors.length, 6);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('handle invalid root (next)', (done) => {
        const iterator = new Iterator(`${TEST_DIR}does-not-exist`);

        iterator
          .next()
          .then((value) => {
            assert.ok(!value);
          })
          .catch((err) => {
            assert.ok(err);
            assert.equal(err.code, 'ENOENT');
            done();
          });
      });

      it('handle invalid root (forEach)', (done) => {
        const iterator = new Iterator(`${TEST_DIR}does-not-exist`);
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: NodeJS.ErrnoException | null) => {
            assert.ok(err);
            assert.equal(err.code, 'ENOENT');
            done();
          }
        );
      });

      it('should propagate errors (default)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            setTimeout(() => {
              callback(new Error('Failed'));
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (true)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            setTimeout(() => {
              callback(new Error('Failed'));
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            concurrency: 1,
            error: (err?: Error | null) => {
              errors.push(err);
              return true;
            },
          },
          (err?: Error | null) => {
            assert.ok(!!err);
            assert.equal(errors.length, 1);
            done();
          }
        );
      });

      it('should not propagate errors (false)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            setTimeout(() => {
              callback(new Error('Failed'));
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            error: (err?: Error | null) => {
              errors.push(err);
              return false;
            },
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(errors.length, 6);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      (() => {
        // patch and restore promise
        if (typeof global === 'undefined') return;
        const globalPromise = global.Promise;
        before(() => {
          global.Promise = Pinkie;
        });
        after(() => {
          global.Promise = globalPromise;
        });
      })();
      it('handle invalid root (next)', async () => {
        const iterator = new Iterator(`${TEST_DIR}does-not-exist`);

        try {
          const value = await iterator.next();
          assert.ok(!value);
        } catch (err) {
          assert.ok(err);
          assert.equal((err as NodeJS.ErrnoException).code, 'ENOENT');
        }
      });

      it('handle invalid root (forEach)', (done) => {
        const iterator = new Iterator(`${TEST_DIR}does-not-exist`);
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: NodeJS.ErrnoException | null) => {
            assert.ok(err);
            assert.equal(err.code, 'ENOENT');
            done();
          }
        );
      });

      it('should propagate errors (default)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (true)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            concurrency: 1,
            error: (err?: Error | null) => {
              errors.push(err);
              return true;
            },
          },
          (err?: Error | null) => {
            assert.ok(!!err);
            assert.equal(errors.length, 1);
            done();
          }
        );
      });

      it('should not propagate errors (false)', (done) => {
        const errors = [];

        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          {
            error: (err?: Error | null) => {
              errors.push(err);
              return false;
            },
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(errors.length, 6);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };
  const DELETE_PATH = `dir2${path.sep}file1`;

  describe('everything', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    it('Should find everything with no return', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): void => {
          spys(entry.stats as fs.Stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('Should find everything with return true', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);
          return true;
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach custom error handler - no return)', (done) => {
      const spys = statsSpys();
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null): void => {
          errors.push(err);
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
        },
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(errors.length, 2);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach custom error handler - return false)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null) => {
          assert.ok(!!err);
          return false;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
        },
        (err?: Error | null) => {
          assert.ok(!!err);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 1);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach custom error handler - return true)', (done) => {
      const spys = statsSpys();
      const errors = [];
      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null) => {
          assert.ok(!!err);
          return true;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
          error: (err?: Error | null): void => {
            errors.push(err);
          },
        },
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(errors.length, 0);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach false)', (done) => {
      const spys = statsSpys();
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null) => {
          assert.ok(!!err);
          return false;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
          error: (err?: Error | null) => {
            errors.push(err);
            return false;
          },
        },
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(errors.length, 2);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach true)', (done) => {
      const spys = statsSpys();
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null) => {
          assert.ok(!!err);
          return false;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
          error: (err?: Error | null) => {
            errors.push(err);
            return true;
          },
        },
        (err?: Error | null) => {
          assert.ok(err);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 1);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('Should handle a delete (error in forEach)', (done) => {
      const spys = statsSpys();
      const errors = [];

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats as fs.Stats);

          if (entry.path === DELETE_PATH) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        alwaysStat: true,
        lstat: true,
        error: (err?: Error | null) => {
          assert.ok(!!err);
          return false;
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        {
          concurrency: 1,
          error: (err?: Error | null): void => {
            errors.push(err);
          },
        },
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(errors.length, 2);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };
  const TEST_DIR_PATH = `dir3${path.sep}dir4`;

  describe('filtering', () => {
    (() => {
      // patch and restore promise
      if (typeof global === 'undefined') return;
      const globalPromise = global.Promise;
      before(() => {
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = globalPromise;
      });
    })();

    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('synchronous', () => {
      it('Should filter everything under the root directory', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return false;
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return entry.path !== 'dir2';
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 10);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by stats and relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return (entry.stats?.isDirectory() ?? false) || stringStartsWith(entry.path, TEST_DIR_PATH);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('Should filter everything under the root directory', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry, callback) => {
            spys(entry.stats as fs.Stats);
            setTimeout(() => {
              callback(undefined, false);
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry, callback) => {
            spys(entry.stats as fs.Stats);
            setTimeout(() => {
              callback(undefined, entry.path !== 'dir2');
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 10);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by stats and relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry, callback) => {
            spys(entry.stats as fs.Stats);
            setTimeout(() => {
              callback(undefined, !entry.stats?.isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH));
            }, 10);
          },
          callbacks: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      it('Should filter everything under the root directory', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return Promise.resolve(false);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return Promise.resolve(entry.path !== 'dir2');
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 10);
            done();
          }
        );
      });

      it('Should filter everything under specific directories by stats and relative path', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          filter: (entry: Entry) => {
            spys(entry.stats as fs.Stats);
            return Promise.resolve(!entry.stats?.isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH));
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('forEach', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('callback interface', () => {
      it('simple forEach (default)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('simple forEach (callbacks)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry, callback) => {
            spys(entry.stats as fs.Stats);
            assert.ok(entry);
            assert.ok(callback);
            nextTick(callback);
          },
          { callbacks: true },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('simple forEach (callbacks)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry, callback) => {
            spys(entry.stats as fs.Stats);
            assert.ok(entry);
            assert.ok(callback);
            setTimeout(() => {
              callback(undefined, false);
            }, 10);
          },
          { callbacks: true, concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 1);
            assert.equal(spys.file.callCount, 0);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('simple forEach (concurency: 1)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: 1 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('simple forEach (concurency: 5)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: 5 },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('simple forEach (concurency: Infinity)', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: Infinity },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('should propagate errors (default)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(() => {
              callback(new Error('Failed'));
            });
          },
          callbacks: true,
        });

        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (concurency: 1)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(() => {
              callback(new Error('Failed'));
            });
          },
          callbacks: true,
        });

        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 1 },
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (concurency: 5)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(() => {
              callback(new Error('Failed'));
            });
          },
          callbacks: true,
        });

        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: 5 },
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });

      it('should propagate errors (concurency: Infinity)', (done) => {
        const iterator = new Iterator(TEST_DIR, {
          filter: (_entry, callback) => {
            nextTick(() => {
              callback(new Error('Failed'));
            });
          },
          callbacks: true,
        });

        iterator.forEach(
          (_entry: Entry): void => {},
          { concurrency: Infinity },
          (err?: Error | null) => {
            assert.ok(!!err);
            done();
          }
        );
      });
    });

    describe('promise interface', () => {
      (() => {
        // patch and restore promise
        if (typeof global === 'undefined') return;
        const globalPromise = global.Promise;
        before(() => {
          global.Promise = Pinkie;
        });
        after(() => {
          global.Promise = globalPromise;
        });
      })();
      it('forEach function is mandatory', async () => {
        const iterator = new Iterator(TEST_DIR);
        const promise = iterator.forEach((_entry: Entry): void => {});
        assert.ok(isPromise(promise));
        await promise;
        const iterator2 = new Iterator(TEST_DIR);
        const nothing = await iterator2.forEach((_entry: Entry): void => {});
        assert.ok(nothing === true);
      });

      it('forEach function is mandatory', async () => {
        try {
          const iterator = new Iterator(TEST_DIR);
          const promise = iterator.forEach(undefined as unknown as EachFunction<Entry>);
          assert.ok(isPromise(promise));
        } catch (err) {
          assert.ok(!!err);
        }
      });

      it('simple forEach (default)', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        await iterator.forEach((entry: Entry): void => {
          spys(entry.stats as fs.Stats);
        });
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
      });

      it('simple forEach (concurrency: 1)', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        await iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: 1 }
        );
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
      });

      it('simple forEach (concurrency: 5)', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        await iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: 5 }
        );
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
      });

      it('simple forEach (concurrency: Infinity)', async () => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        await iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          { concurrency: Infinity }
        );
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
      });

      it('should propagate errors (default)', async () => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });

        try {
          await iterator.forEach((err?: Entry): void => {
            if (err) throw err;
          });
          assert.ok(false);
        } catch (err) {
          assert.ok(!!err);
        }
      });

      it('should propagate errors (concurrency: 1)', async () => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });

        try {
          await iterator.forEach(
            (err?: Entry): void => {
              if (err) throw err;
            },
            { concurrency: 1 }
          );
          assert.ok(false);
        } catch (err) {
          assert.ok(!!err);
        }
      });

      it('should propagate errors (concurrency: 5)', async () => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });

        try {
          await iterator.forEach(
            (err?: Entry): void => {
              if (err) throw err;
            },
            { concurrency: 5 }
          );
          assert.ok(false);
        } catch (err) {
          assert.ok(!!err);
        }
      });

      it('should propagate errors (concurrency: Infinity)', async () => {
        const iterator = new Iterator(TEST_DIR, {
          filter: () => Promise.reject(new Error('Failed')),
        });

        try {
          await iterator.forEach(
            (err?: Entry): void => {
              if (err) throw err;
            },
            { concurrency: Infinity }
          );
          assert.ok(false);
        } catch (err) {
          assert.ok(!!err);
        }
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('forEach', () => {
    describe('limit', () => {
      after((done) => {
        safeRm(TEST_DIR, done);
      });
      beforeEach((done) => {
        safeRm(TEST_DIR, () => {
          generate(TEST_DIR, STRUCTURE, (err) => {
            done(err);
          });
        });
      });

      describe('synchronous', () => {
        it('infinite limit to get all', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, { lstat: true });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: Infinity, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(empty);
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 5);
              assert.equal(spys.link.callCount, 2);
              done();
            }
          );
        });

        it('should run with concurrency 1', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, { lstat: true });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              assert.equal(spys.dir.callCount, 2);
              assert.equal(spys.file.callCount, 1);
              assert.equal(spys.link.callCount, 0);
              done();
            }
          );
        });

        it('should run with concurrency 5', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, { lstat: true });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 5 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              done();
            }
          );
        });

        it('should run with concurrency Infinity', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, { lstat: true });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: Infinity },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              done();
            }
          );
        });

        it('should run with concurrency Infinity and only files', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (entry: Entry) => !entry.stats?.isDirectory(),
            lstat: true,
          });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 100, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(empty);
              assert.equal(spys.callCount, 3);
              assert.equal(spys.dir.callCount, 0);
              assert.equal(spys.file.callCount, 2);
              assert.equal(spys.link.callCount, 1);
              done();
            }
          );
        });
      });

      describe('callbacks', () => {
        it('infinite limit to get all', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry, callback) => {
              nextTick(callback);
            },
            callbacks: true,
            lstat: true,
          });

          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: Infinity, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(empty);
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 5);
              assert.equal(spys.link.callCount, 2);
              done();
            }
          );
        });

        it('should run with concurrency 1', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry, callback) => {
              nextTick(callback);
            },
            callbacks: true,
            lstat: true,
          });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              assert.equal(spys.dir.callCount, 2);
              assert.equal(spys.file.callCount, 1);
              assert.equal(spys.link.callCount, 0);
              done();
            }
          );
        });

        it('should run with concurrency 5', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry, callback) => {
              nextTick(callback);
            },
            callbacks: true,
            lstat: true,
          });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 5 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              done();
            }
          );
        });

        it('should run with concurrency Infinity', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry, callback) => {
              nextTick(callback);
            },
            callbacks: true,
            lstat: true,
          });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: Infinity },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(!empty);
              assert.equal(spys.callCount, 3);
              done();
            }
          );
        });
        it('should run with concurrency Infinity and only files', (done) => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (entry, callback) => {
              setTimeout(() => {
                callback(undefined, !entry.stats?.isDirectory());
              }, 10);
            },
            callbacks: true,
            lstat: true,
          });
          iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 100, concurrency: 1 },
            (err, empty) => {
              if (err) return done(err);
              assert.ok(empty);
              assert.equal(spys.callCount, 3);
              assert.equal(spys.dir.callCount, 0);
              assert.equal(spys.file.callCount, 2);
              assert.equal(spys.link.callCount, 1);
              done();
            }
          );
        });
      });

      describe('promise', () => {
        (() => {
          // patch and restore promise
          if (typeof global === 'undefined') return;
          const globalPromise = global.Promise;
          before(() => {
            global.Promise = Pinkie;
          });
          after(() => {
            global.Promise = globalPromise;
          });
        })();
        it('infinite limit to get all', async () => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry: Entry) => Promise.resolve(undefined),
            lstat: true,
          });

          const empty = await iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: Infinity, concurrency: 1 }
          );
          assert.ok(empty);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
        });

        it('should run with concurrency 1', async () => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry: Entry) => Promise.resolve(undefined),
            lstat: true,
          });
          const empty = await iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 1 }
          );
          assert.ok(!empty);
          assert.equal(spys.callCount, 3);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 1);
          assert.equal(spys.link.callCount, 0);
        });

        it('should run with concurrency 5', async () => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry: Entry) => Promise.resolve(undefined),
            lstat: true,
          });
          const empty = await iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: 5 }
          );
          assert.ok(!empty);
          assert.equal(spys.callCount, 3);
        });

        it('should run with concurrency Infinity', async () => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (_entry: Entry) => Promise.resolve(undefined),
            lstat: true,
          });
          const empty = await iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 3, concurrency: Infinity }
          );
          assert.ok(!empty);
          assert.equal(spys.callCount, 3);
        });
        it('should run with concurrency Infinity and only files', async () => {
          const spys = statsSpys();

          const iterator = new Iterator(TEST_DIR, {
            filter: (entry: Entry) => Promise.resolve(!entry.stats?.isDirectory()),
            lstat: true,
          });
          const empty = await iterator.forEach(
            (entry: Entry): void => {
              spys(entry.stats as fs.Stats);
            },
            { limit: 100, concurrency: 1 }
          );
          assert.ok(empty);
          assert.equal(spys.callCount, 3);
          assert.equal(spys.dir.callCount, 0);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
        });
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('lstat', () => {
    after((done) => {
      safeRm(TEST_DIR, done);
    });
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('default', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            if (fs.Dirent) {
              assert.equal(spys.dir.callCount, 3);
              assert.equal(spys.file.callCount, 2);
              assert.equal(spys.link.callCount, 1);
            } else {
              assert.equal(spys.dir.callCount, 3);
              assert.equal(spys.file.callCount, 3);
              assert.equal(spys.link.callCount, 0);
            }
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            if (fs.Dirent) {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 5);
              assert.equal(spys.link.callCount, 2);
            } else {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 7);
              assert.equal(spys.link.callCount, 0);
            }
            done();
          }
        );
      });
    });

    describe('lstat false', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          lstat: false,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            if (fs.Dirent) {
              assert.equal(spys.dir.callCount, 3);
              assert.equal(spys.file.callCount, 2);
              assert.equal(spys.link.callCount, 1);
            } else {
              assert.equal(spys.dir.callCount, 3);
              assert.equal(spys.file.callCount, 3);
              assert.equal(spys.link.callCount, 0);
            }
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          lstat: false,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            if (fs.Dirent) {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 5);
              assert.equal(spys.link.callCount, 2);
            } else {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 7);
              assert.equal(spys.link.callCount, 0);
            }
            done();
          }
        );
      });
    });

    describe('lstat true', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: 0,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, {
          depth: Infinity,
          filter: (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          lstat: true,
        });
        iterator.forEach(
          (_entry: Entry): void => {},
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
  };

  describe('stats compatibility', () => {
    after((done) => {
      safeRm(TEST_DIR, done);
    });
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });

    describe('stats', () => {
      it('stat', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { alwaysStat: true, lstat: false });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 0);
            done();
          }
        );
      });

      it('lstat', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { alwaysStat: true, lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('dirent', () => {
      it('stat', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: false });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          (err?: Error | null) => {
            if (err) return done(err);

            if (fs.Dirent) {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 5);
              assert.equal(spys.link.callCount, 2);
            } else {
              assert.equal(spys.dir.callCount, 5);
              assert.equal(spys.file.callCount, 7);
              assert.equal(spys.link.callCount, 0);
            }
            done();
          }
        );
      });

      it('lstat', (done) => {
        const spys = statsSpys();

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry: Entry): void => {
            spys(entry.stats as fs.Stats);
          },
          (err?: Error | null) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });
  });
}

{
  const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
  const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
  const STRUCTURE = {
    file1: 'a',
    file2: 'b',
    dir1: null,
    'dir2/file1': 'c',
    'dir2/file2': 'd',
    'dir3/dir4/file1': 'e',
    'dir3/dir4/dir5': null,
    filelink1: '~dir3/dir4/file1',
    'dir3/filelink2': '~dir2/file1',
    'dir3/dir4/dirlink1': '~dir2',
  };

  describe('symlink', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((done) => {
      safeRm(TEST_DIR, done);
    });

    it('Should find everything with no return (lstat)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): void => {
          spys(entry.stats as fs.Stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(spys.callCount, 15);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 7);
          assert.equal(spys.link.callCount, 3);
          done();
        }
      );
    });

    it('Should find everything with no return (stat)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): void => {
          spys(entry.stats as fs.Stats);
        },
        lstat: false,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error | null) => {
          if (err) return done(err);
          assert.equal(spys.callCount, 15);
          if (fs.Dirent) {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 3);
          } else {
            assert.equal(spys.dir.callCount, 6);
            assert.equal(spys.file.callCount, 9);
            assert.equal(spys.link.callCount, 0);
          }
          done();
        }
      );
    });
  });
}
