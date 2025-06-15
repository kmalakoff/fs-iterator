import type { Dirent } from 'fs';
import path from 'path';
import type Iterator from '../FSIterator.js';
import type { Entry, StackEntry } from '../types.js';

function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + path.sep + right;
}

export default function createEntry(iterator: Iterator, item: StackEntry): Entry {
  if ((item.basename as Dirent).name) {
    const stats = item.basename as Dirent;
    const basename = stats.name.toString();
    const path = join(item.path, basename);
    const fullPath = join(iterator.root, path);
    return { basename, stats, path, fullPath };
  }

  const basename = item.basename as string;
  const path = join(item.path, basename);
  const fullPath = join(iterator.root, path);
  return { basename, stats: null, path, fullPath };
}
