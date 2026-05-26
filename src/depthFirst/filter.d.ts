import type Iterator from '../FSIterator.ts';
import type { Entry } from '../types.ts';
export type Callback = (error?: Error, keep?: boolean) => void;
export default function filter(iterator: Iterator, entry: Entry, callback: Callback): void;
