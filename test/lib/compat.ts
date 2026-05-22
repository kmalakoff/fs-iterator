/**
 * Compatibility Layer for Node.js 0.8+
 * Local to this package - contains only needed functions.
 */

import Module from 'module';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

/**
 * Stream compatibility - Transform class
 * - Uses native stream.Transform on Node 0.10+
 * - Falls back to readable-stream for Node 0.8
 */
const major = +process.versions.node.split('.')[0];
export const Readable: typeof import('stream').Readable = major > 0 ? _require('stream').Readable : _require('readable-stream').Readable;
export const Writable: typeof import('stream').Writable = major > 0 ? _require('stream').Writable : _require('readable-stream').Writable;
export const Transform: typeof import('stream').Transform = major > 0 ? _require('stream').Transform : _require('readable-stream').Transform;
export const PassThrough: typeof import('stream').PassThrough = major > 0 ? _require('stream').PassThrough : _require('readable-stream').PassThrough;

/**
 * String.prototype.startsWith wrapper for Node.js 0.8+
 * - Uses native startsWith on Node 4.0+ / ES2015+
 * - Falls back to indexOf on Node 0.8-3.x
 */
const hasStartsWith = typeof String.prototype.startsWith === 'function';
export function stringStartsWith(str: string, search: string, position?: number): boolean {
  if (hasStartsWith) return str.startsWith(search, position);
  position = position || 0;
  return str.indexOf(search, position) === position;
}
