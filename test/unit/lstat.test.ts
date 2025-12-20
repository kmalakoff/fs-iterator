import assert from 'assert';
import fs from 'fs';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import { safeRm } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import path from 'path';
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
          spys(entry.stats);
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
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
          spys(entry.stats);
        },
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
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
          spys(entry.stats);
        },
        lstat: false,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
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
          spys(entry.stats);
        },
        lstat: false,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
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
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
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
          spys(entry.stats);
        },
        lstat: true,
      });
      iterator.forEach(
        (_entry: Entry): void => {},
        (err?: Error) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
