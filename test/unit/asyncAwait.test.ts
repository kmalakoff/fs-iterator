import assert from 'assert';
import generate from 'fs-generate';
// @ts-ignore
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

describe('async await', () => {
  if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) return;
  (() => {
    // patch and restore promise
    // @ts-ignore
    let rootPromise: Promise;
    before(() => {
      rootPromise = global.Promise;
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  it('should be default false', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry: Entry): undefined => {
        spys(entry.stats);
      },
    });

    let value = (await iterator.next()) as IteratorReturnResult<Entry>;
    while (!value.done) {
      assert.ok(typeof value.value.basename === 'string');
      assert.ok(typeof value.value.path === 'string');
      assert.ok(typeof value.value.fullPath === 'string');
      assert.ok(typeof value.value.stats === 'object');
      value = (await iterator.next()) as IteratorReturnResult<Entry>;
    }

    assert.equal(spys.callCount, 12);
  });

  it('Should find everything with no return', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry: Entry): undefined => {
        spys(entry.stats);
      },
      lstat: true,
    });

    let value = (await iterator.next()) as IteratorReturnResult<Entry>;
    while (!value.done) {
      assert.ok(typeof value.value.basename === 'string');
      assert.ok(typeof value.value.path === 'string');
      assert.ok(typeof value.value.fullPath === 'string');
      assert.ok(typeof value.value.stats === 'object');
      value = (await iterator.next()) as IteratorReturnResult<Entry>;
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('Should find everything with return true', async () => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry: Entry) => {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });

    let value = (await iterator.next()) as IteratorReturnResult<Entry>;
    while (!value.done) {
      assert.ok(typeof value.value.basename === 'string');
      assert.ok(typeof value.value.path === 'string');
      assert.ok(typeof value.value.fullPath === 'string');
      assert.ok(typeof value.value.stats === 'object');
      value = (await iterator.next()) as IteratorReturnResult<Entry>;
    }

    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 2);
  });

  it('should propagate errors', async () => {
    const iterator = new Iterator(TEST_DIR, {
      filter: () => Promise.reject(new Error('Failed')),
    });

    try {
      let value = (await iterator.next()) as IteratorReturnResult<Entry>;
      while (value) {
        assert.ok(typeof value.value.basename === 'string');
        assert.ok(typeof value.value.path === 'string');
        assert.ok(typeof value.value.fullPath === 'string');
        assert.ok(typeof value.value.stats === 'object');
        value = (await iterator.next()) as IteratorReturnResult<Entry>;
      }
    } catch (err) {
      assert.ok(!!err);
    }
  });
});
