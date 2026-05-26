import StackBaseIterator from 'stack-base-iterator';
import type { Entry, IteratorOptions } from './types.ts';
export default class FSIterator extends StackBaseIterator<Entry, Entry> {
  static EXPECTED_ERRORS: string[];
  root: string;
  depth: number;
  readdirOptions: {
    encoding: 'buffer';
    withFileTypes: true;
    recursive?: boolean;
  };
  statOptions: {
    bigint: boolean;
  };
  constructor(root: string, options?: IteratorOptions);
}
