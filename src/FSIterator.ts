import fs from 'fs';
import path from 'path';
import StackBaseIterator from 'stack-base-iterator';

import depthFirst from './depthFirst/index.ts';
import fsCompat from './fs-compat/index.ts';
import type { Entry, IteratorOptions } from './types.ts';

const bigint = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

function defaultError(err: NodeJS.ErrnoException): boolean {
  return FSIterator.EXPECTED_ERRORS.indexOf(err.code) >= 0; // skip known issues
}

export default class FSIterator extends StackBaseIterator<Entry, Entry> {
  static EXPECTED_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];
  root: string;
  depth: number;
  readdirOptions: { encoding: 'buffer'; withFileTypes: true; recursive?: boolean };
  statOptions = { bigint };

  constructor(root: string, options: IteratorOptions = {}) {
    super(options);
    this.options.error = options.error || defaultError;
    this.depth = options.depth === undefined ? Infinity : options.depth;
    this.readdirOptions = { encoding: 'utf8', withFileTypes: fs.Dirent && !options.alwaysStat } as unknown as { encoding: 'buffer'; withFileTypes: true; recursive?: boolean };

    this.root = path.resolve(root);
    let cancelled = false;
    function setup(): void {
      cancelled = true;
    }
    this.processing.push(setup);
    fsCompat.readdir(this.root, this.readdirOptions, (err, files) => {
      this.processing.remove(setup);
      if (this.done || cancelled) return;
      if (err) return this.end(err);
      if (files.length) {
        const stackItems = files.map((x) => depthFirst.bind(null, { path: null, depth: 0, basename: x })).reverse();
        this.push.apply(this, stackItems);
      }
    });
  }
}
