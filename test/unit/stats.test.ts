import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import rimraf2 from 'rimraf2';

// @ts-ignore
import Iterator, { type Entry } from 'fs-iterator';

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
    rimraf2(TEST_DIR, { disableGlob: true }, done);
  });
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
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
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry: Entry): undefined => {
          spys(entry.stats);
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
  });

  describe('dirent', () => {
    it('stat', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: false });
      iterator.forEach(
        (entry: Entry): undefined => {
          spys(entry.stats);
        },
        (err?: Error) => {
          if (err) {
            done(err.message);
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

    it('lstat', (done) => {
      const spys = statsSpys();

      const iterator = new Iterator(TEST_DIR, { lstat: true });
      iterator.forEach(
        (entry: Entry): undefined => {
          spys(entry.stats);
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
  });
});
