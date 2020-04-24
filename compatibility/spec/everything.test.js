var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

var Iterator = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = path.resolve(path.join(__dirname, '..', 'data'));
var STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
};

describe('everything', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats, entry.path);
      },
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        spys(entry.stats, entry.path);
        return true;
      },
      lstat: true,
    });
    iterator.forEach(
      function () {},
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach default emits error)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
    });
    iterator.on('error', function (err) {
      errors.push(err);
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach default emits error)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
    });
    iterator.on('error', function (err) {
      errors.push(err);
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        errors.push(err);
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler)', function (done) {
    var spys = statsSpys();

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
      },
      function (err) {
        assert.ok(!!err);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach custom error handler)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach false)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
          return false;
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach true)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
          return true;
        },
      },
      function (err) {
        assert.ok(err);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });

  it('Should handle a delete (error in forEach)', function (done) {
    var spys = statsSpys();
    var errors = [];

    var iterator = new Iterator(DIR, {
      filter: function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      alwaysStat: true,
      lstat: true,
      error: function (err) {
        return false;
      },
    });
    iterator.forEach(
      function () {},
      {
        concurrency: 1,
        error: function (err) {
          errors.push(err);
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });
});
