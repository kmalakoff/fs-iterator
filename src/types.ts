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

export type FilterSync = (entry: Entry) => boolean | undefined | Error | Promise<boolean | undefined>;
export type FilterCallback = (err?: Error, value?: boolean) => undefined;
export type FilterAsync = (entry: Entry, callback: FilterCallback) => undefined;
export type FilterFunction = FilterSync | FilterAsync;

export interface IteratorOptions extends StackOptions {
  depth?: number;
  alwaysStat?: boolean;
  filter?: FilterFunction;
  callbacks?: boolean;
  async?: boolean;
  concurrency?: number;
  lstat?: boolean;
}
