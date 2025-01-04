const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');

const Iterator = require('fs-iterator');

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
      generate(TEST_DIR, STRUCTURE, done);
    });
  });

  it('Should find everything with no return', (done) => {
    const spys = statsSpys();

    const iterator = new Iterator(TEST_DIR, {
      filter: (entry) => {
        spys(entry.stats);
      },
      lstat: true,
    });
    iterator.forEach(
      () => {},
      (err) => {
        assert.ok(!err, err ? err.message : '');
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
      filter: (entry) => {
        spys(entry.stats);
        return true;
      },
      lstat: true,
    });
    iterator.forEach(
      () => {},
      (err) => {
        assert.ok(!err, err ? err.message : '');
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        errors.push(err);
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
      },
      (err) => {
        assert.ok(!err, err ? err.message : '');
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
      },
      (err) => {
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        assert.ok(!!err);
        return true;
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
        error: (err) => {
          errors.push(err);
        },
      },
      (err) => {
        assert.ok(!err, err ? err.message : '');
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
        error: (err) => {
          errors.push(err);
          return false;
        },
      },
      (err) => {
        assert.ok(!err, err ? err.message : '');
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
        error: (err) => {
          errors.push(err);
          return true;
        },
      },
      (err) => {
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
      filter: (entry) => {
        spys(entry.stats);

        if (entry.path === DELETE_PATH) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: (err) => {
        assert.ok(!!err);
        return false;
      },
    });
    iterator.forEach(
      () => {},
      {
        concurrency: 1,
        error: (err) => {
          errors.push(err);
        },
      },
      (err) => {
        assert.ok(!err, err ? err.message : '');
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });
});
