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
  'dir3/dir4/dirlink1': '~dir2',
};

describe('symlink', () => {
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

  it('Should find everything with no return (lstat)', (done) => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry: Entry): undefined => {
        spys(entry.stats);
      },
      lstat: true,
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
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
      filter: (entry: Entry): undefined => {
        spys(entry.stats);
      },
      lstat: false,
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
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
