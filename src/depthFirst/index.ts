import type { BigIntStats, Dirent, Stats } from 'fs';
import type Iterator from '../FSIterator.ts';
import fsCompat from '../fs-compat/index.ts';
import type { Entry, StackEntry } from '../types.ts';
import createEntry from './createEntry.ts';
import filter from './filter.ts';
import stat from './stat.ts';

function isDirectory(entry: Entry): boolean {
  if (entry.realStats) return entry.realStats.isDirectory();
  return entry.stats?.isDirectory() ?? false;
}

export type Callback = (error?: Error, entry?: IteratorResult<Entry>) => void;

export default function depthFirst<_T>(item: StackEntry, iterator: Iterator, callback: Callback): void {
  const depth = item.depth;
  const entry = createEntry(iterator, item);

  stat(iterator, entry, function statCallback(err: Error | undefined) {
    if (err || iterator.isDone()) return callback(err);

    filter(iterator, entry, function filterCallback(err: Error | undefined, keep: boolean | undefined) {
      if (err || !keep || iterator.isDone()) return callback(err);

      // not a directory or is a directory, but next level is too deep
      if (!isDirectory(entry) || depth + 1 > iterator.depth) return callback(undefined, { done: false, value: entry });

      // get files in this directory
      (fsCompat.readdir as unknown as (path: string, options: object, callback: (err: NodeJS.ErrnoException | null, files: string[] | Dirent[]) => void) => void)(entry.fullPath, iterator.readdirOptions, (err: NodeJS.ErrnoException | null, files: string[] | Dirent[]) => {
        if (err || iterator.isDone()) return callback(err ?? undefined);
        if (files.length) {
          const stackItems = files.map((x) => depthFirst.bind(undefined, { path: entry.path, depth: depth + 1, basename: x as unknown as string | Stats | BigIntStats | Dirent<string> })).reverse();
          (iterator.push as (...args: unknown[]) => void).apply(iterator, stackItems);
        }
        return callback(undefined, { done: false, value: entry });
      });
    });
  });
}
