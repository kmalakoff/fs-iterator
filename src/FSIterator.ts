import fs from 'fs';
import path from 'path';
import StackBaseIterator from 'stack-base-iterator';

import PathStack from './PathStack.js';
import fifoRemove from './fifoRemove.js';
import fsCompat from './fs-compat/index.js';
import lifoFromArray from './lifoFromArray.js';

import type { StackOptions } from 'stack-base-iterator';
import type { IteratorOptions } from './types.js';

function defaultError(err: NodeJS.ErrnoException): boolean {
  return FSIterator.EXPECTED_ERRORS.indexOf(err.code) >= 0; // skip known issues
}
const bigint = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

export default class FSIterator extends StackBaseIterator {
  static EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];
  root: string;
  depth: number;
  readdirOptions: { encoding: string; withFileTypes: boolean };
  statOptions: { bigint: boolean };

  constructor(root: string, options: IteratorOptions = {}) {
    super(options as StackOptions);
    this.options.error = options.error || defaultError;

    this.depth = options.depth === undefined ? Infinity : options.depth;
    this.readdirOptions = { encoding: 'utf8', withFileTypes: fs.Dirent && !options.alwaysStat };
    this.statOptions = { bigint };

    this.root = path.resolve(root);
    this.stack = new PathStack();
    let cancelled = false;
    function setup() {
      cancelled = true;
    }
    this.processing.push(setup);
    fsCompat.readdir(this.root, this.readdirOptions, (err, files) => {
      fifoRemove(this.processing, setup);
      if (this.done || cancelled) return;
      if (err) return this.end(err);
      if (files.length) this.push({ path: null, depth: 0, files: lifoFromArray(files) });
    });
  }
}
