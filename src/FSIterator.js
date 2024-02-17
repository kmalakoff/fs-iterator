const inherits = require('inherits');
const StackBaseIterator = require('stack-base-iterator');
const fs = require('fs');
const path = require('path');

const PathStack = require('./PathStack');
const fifoRemove = require('./fifoRemove');
const fsCompat = require('./fs-compat');
const lifoFromArray = require('./lifoFromArray');

function FSIterator(root, options) {
  if (!(this instanceof FSIterator)) return new FSIterator(root, options);
  StackBaseIterator.call(this, options);
  options = options || {};

  if (this.options.depth === undefined) this.options.depth = Infinity;
  this.options.readdir = { encoding: 'utf8', withFileTypes: fs.Dirent && !options.alwaysStat };
  this.options.stat = { bigint: process.platform === 'win32' };
  this.options.error =
    options.error ||
    function defaultError(err) {
      return ~FSIterator.EXPECTED_ERRORS.indexOf(err.code); // skip known issues
    };

  this.root = path.resolve(root);
  this.stack = new PathStack();
  let cancelled = false;
  function setup() {
    cancelled = true;
  }
  this.processing.push(setup);
  fsCompat.readdir(this.root, this.options.readdir, (err, files) => {
    fifoRemove(this.processing, setup);
    if (this.done || cancelled) return;
    if (err) return this.end(err);
    if (files.length) this.push({ path: null, depth: 0, files: lifoFromArray(files) });
  });
}

inherits(FSIterator, StackBaseIterator);

FSIterator.EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

module.exports = FSIterator;
