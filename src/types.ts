import type { BigIntStats, Dirent, Stats } from 'fs';
import type { StackOptions } from 'stack-base-iterator';

export interface Entry {
  basename: string;
  path: string;
  fullPath: string;
  stats?: Stats | BigIntStats | Dirent;
  realStats?: Stats | BigIntStats | Dirent;
}

export interface StackEntry {
  path?: string;
  basename: string | Stats | BigIntStats | Dirent;
  depth: number;
}

export type FilterSync = (entry: Entry) => boolean | undefined | Error;
export type FilterCallback = (entry: Entry, callback: (err?: Error, value?: boolean) => undefined) => undefined;
export type FilterPromise = (entry: Entry) => Promise<boolean | undefined>;

export interface IteratorOptions extends StackOptions {
  depth?: number;
  alwaysStat?: boolean;
  filter?: FilterSync | FilterCallback | FilterPromise;
  callbacks?: boolean;
  lstat?: boolean;
}
