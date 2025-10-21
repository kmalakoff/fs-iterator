import assert from 'assert';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import url from 'url';

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

  describe('setup', () => {
    beforeEach((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, done);
    });

    it('should be default false', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
      });

      function consume() {
        iterator.next().then((value) => {
          if (value.done) {
            assert.equal(spys.callCount, 12);
            done();
          } else consume();
        });
      }
      consume();
    });

    it('simple forEach (async)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      // biome-ignore lint/suspicious/useIterableCallbackReturn: Not an iterable
      iterator.forEach(
        (entry, callback?) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(!callback);
          return Promise.resolve(undefined);
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('simple forEach (stop)', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      // biome-ignore lint/suspicious/useIterableCallbackReturn: Not an iterable
      iterator.forEach(
        (entry, callback?) => {
          spys(entry.stats);
          assert.ok(entry);
          assert.ok(!callback);
          return Promise.resolve(false);
        },
        { concurrency: 1 },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.dir.callCount, 1);
          assert.equal(spys.file.callCount, 0);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });

    it('Should find everything with no return', async () => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry): undefined => {
          spys(entry.stats);
        },
        lstat: true,
      });

      async function consume() {
        const value = await iterator.next();
        if (value.done) {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
        } else await consume();
      }
      await consume();
    });

    it('Should find everything with return true', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, {
        filter: (entry: Entry) => {
          spys(entry.stats);
          return true;
        },
        lstat: true,
      });

      function consume() {
        iterator.next().then((value) => {
          if (value.done) {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          } else consume();
        });
      }
      consume();
    });

    it('should propagate errors', (done) => {
      const iterator = new Iterator(TEST_DIR, {
        filter: () => Promise.reject(new Error('Failed')),
      });

      function consume() {
        iterator.next().catch((err?: Error) => {
          assert.ok(!!err);
          done();
        });
      }
      consume();
    });
  });
});
