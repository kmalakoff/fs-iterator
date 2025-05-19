import { sep } from 'path';
import type { Entry } from '../types.js';

function join(left, right) {
  if (!left) return right || '';
  if (!right) return left;
  return left + sep + right;
}

export default function createEntry(iterator, item): Entry {
  const basename = item.basename.name ? item.basename.name : item.basename;
  const stats = item.basename.name ? item.basename : null;
  const path = join(item.path, basename);
  const fullPath = join(iterator.root, path);
  return { basename, stats, path, fullPath };
}
