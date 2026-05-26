import type fs from 'fs';
import lstat from './lstat.ts';
import realpath from './realpath.ts';

function lstatReal(path: string, options: object | undefined, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void): void {
  realpath(path, function realpathCallback(err: NodeJS.ErrnoException | null, realpath: string): void {
    if (err) return callback(err, undefined as unknown as fs.Stats);
    lstat(realpath, options, callback);
  });
}
export default lstatReal as typeof fs.lstat;
