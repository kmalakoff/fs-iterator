import fs from 'fs';
import path from 'path';
import StackBaseIterator from 'stack-base-iterator';

import PathStack from './PathStack.mjs';
import fifoRemove from './fifoRemove.mjs';
import fsCompat from './fs-compat/index.mjs';
import lifoFromArray from './lifoFromArray.mjs';

export default class FSIterator extends StackBaseIterator {
  constructor(root, options) {
    super(options);
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
}

FSIterator.EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];
