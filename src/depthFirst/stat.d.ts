import type Iterator from '../FSIterator.ts';
import type { Entry } from '../types.ts';
export type Callback = (error?: Error) => void;
export default function stat(iterator: Iterator, entry: Entry, callback: Callback): void;
