import type Iterator from '../FSIterator.ts';
import type { Entry, StackEntry } from '../types.ts';
export type Callback = (error?: Error, entry?: IteratorResult<Entry>) => void;
export default function depthFirst<_T>(item: StackEntry, iterator: Iterator, callback: Callback): void;
