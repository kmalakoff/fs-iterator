import assert from 'assert';
import generate from 'fs-generate';
// @ts-ignore
import type { Entry } from 'fs-iterator';
import statsSpys from 'fs-stats-spys';
import oo from 'on-one';
import path from 'path';
import rimraf2 from 'rimraf2';
import url from 'url';
import IteratorStream from '../lib/IteratorStream.ts';

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

describe('stream', () => {
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

  it('default', (done) => {
    const spys = statsSpys();

    const stream = new IteratorStream(TEST_DIR, { lstat: true }) as unknown as NodeJS.ReadableStream;
    stream.on('data', (entry: Entry): undefined => {
      spys(entry.stats);
    });
    oo(stream, ['error', 'end', 'close', 'finish'], (err?: Error) => {
      if (err) {
        done(err.message);
        return;
      }
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('directories only (highWaterMark: 1)', (done) => {
    const spys = statsSpys();

    const stream = new IteratorStream(TEST_DIR, {
      lstat: true,
      highWaterMark: 1,
      filter: function filter(entry) {
        return entry.stats.isDirectory();
      },
    }) as unknown as NodeJS.ReadableStream;
    stream.on('data', (entry: Entry): undefined => {
      spys(entry.stats);
    });
    oo(stream, ['error', 'end', 'close', 'finish'], (err?: Error) => {
      if (err) {
        done(err.message);
        return;
      }
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 0);
      assert.equal(spys.link.callCount, 0);
      done();
    });
  });

  it('skip directories (highWaterMark: 1)', (done) => {
    const spys = statsSpys();

    const stream = new IteratorStream(TEST_DIR, {
      lstat: true,
      highWaterMark: 1,
    }) as unknown as NodeJS.ReadableStream;
    stream.on('data', (entry: Entry): undefined => {
      if (entry.stats.isDirectory()) return;
      spys(entry.stats);
    });
    oo(stream, ['error', 'end', 'close', 'finish'], (err?: Error) => {
      if (err) {
        done(err.message);
        return;
      }
      assert.equal(spys.dir.callCount, 0);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });
});
