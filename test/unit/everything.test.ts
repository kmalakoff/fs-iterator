import assert from 'assert';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import statsSpys from 'fs-stats-spys';
import path from 'path';
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
const DELETE_PATH = `dir2${path.sep}file1`;

describe('everything', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });

  it('Should find everything with no return', (done) => {
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
        spys(entry.stats);
        return true;
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error): undefined => {
        errors.push(err);
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
      },
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
      },
      (err?: Error) => {
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error) => {
        assert.ok(!!err);
        return true;
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
        error: (err?: Error): undefined => {
          errors.push(err);
        },
      },
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
        error: (err?: Error) => {
          errors.push(err);
          return false;
        },
      },
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
        error: (err?: Error) => {
          errors.push(err);
          return true;
        },
      },
      (err?: Error) => {
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
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err?: Error) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      (_entry: Entry): undefined => {},
      {
        concurrency: 1,
        error: (err?: Error): undefined => {
          errors.push(err);
        },
      },
      (err?: Error) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });
});
