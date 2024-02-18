import lstat from './lstat.mjs';
import realpath from './realpath.mjs';

export default function lstatReal(path, options, callback) {
  realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
}
