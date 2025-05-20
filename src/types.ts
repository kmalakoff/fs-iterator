import type { BigIntStats, Dirent, Stats } from 'fs';
import type { StackOptions } from 'stack-base-iterator';

export interface Entry {
  basename: string;
  path: string;
  fullPath: string;
  stats?: Stats | BigIntStats | Dirent;
}

export type Callback = (err?: Error, value?: unknown) => void;

export interface IteratorOptions extends StackOptions {
  depth?: number;
  alwaysStat?: boolean;
  filter?: (entry: Entry, callback?: Callback) => boolean | undefined;
  callbacks?: boolean;
  lstat?: boolean;
}
