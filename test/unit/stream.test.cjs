const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');
const eos = require('end-of-stream');

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
  if (!require('stream').Readable) return; // no readable streams
  const IteratorStream = require('../lib/IteratorStream.cjs');

  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, done);
  });

  it('default', (done) => {
    const spys = statsSpys();

    const iteratorStream = new IteratorStream(TEST_DIR, { lstat: true });
    iteratorStream.on('data', (entry) => {
      spys(entry.stats);
    });
    eos(iteratorStream, (err) => {
      assert.ok(!err, err ? err.message : '');
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('directories only (highWaterMark: 1)', (done) => {
    const spys = statsSpys();

    const iteratorStream = new IteratorStream(TEST_DIR, {
      lstat: true,
      highWaterMark: 1,
      filter: function filter(entry) {
        return entry.stats.isDirectory();
      },
    });
    iteratorStream.on('data', (entry) => {
      spys(entry.stats);
    });
    eos(iteratorStream, (err) => {
      assert.ok(!err, err ? err.message : '');
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 0);
      assert.equal(spys.link.callCount, 0);
      done();
    });
  });

  it('skip directories (highWaterMark: 1)', (done) => {
    const spys = statsSpys();

    const iteratorStream = new IteratorStream(TEST_DIR, {
      lstat: true,
      highWaterMark: 1,
    });
    iteratorStream.on('data', (entry) => {
      if (entry.stats.isDirectory()) return;
      spys(entry.stats);
    });
    eos(iteratorStream, (err) => {
      assert.ok(!err, err ? err.message : '');
      assert.equal(spys.dir.callCount, 0);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });
});
