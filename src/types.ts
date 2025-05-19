import type { Dirent, Stats } from 'fs';
import type { StackOptions } from 'stack-base-iterator';

export interface Entry {
  basename: string;
  path: string;
  fullPath: string;
  stats?: Stats | Dirent;
}

export interface IteratorOptions extends StackOptions {
  depth?: number;
  alwaysStat?: boolean;
}
