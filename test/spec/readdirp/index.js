'use strict';

const fs = require('fs');
const { Readable } = require('stream');
const sysPath = require('path');
const { promisify } = require('util');
const picomatch = require('picomatch');
const Iterator = require('../../..');

const lstat = promisify(fs.lstat);
const realpath = promisify(fs.realpath);

/**
 * @typedef {Object} EntryInfo
 * @property {String} path
 * @property {String} fullPath
 * @property {fs.Stats=} stats
 * @property {fs.Dirent=} dirent
 * @property {String} basename
 */

const BANG = '!';
const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP']);
const FILE_TYPE = 'files';
const DIR_TYPE = 'directories';
const FILE_DIR_TYPE = 'files_directories';
const EVERYTHING_TYPE = 'all';
const ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];

const isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);

const normalizeFilter = (filter) => {
  if (filter === undefined) return;
  if (typeof filter === 'function') return filter;

  if (typeof filter === 'string') {
    const glob = picomatch(filter.trim());
    return (entry) => glob(entry.basename);
  }

  if (Array.isArray(filter)) {
    const positive = [];
    const negative = [];
    for (const item of filter) {
      const trimmed = item.trim();
      if (trimmed.charAt(0) === BANG) {
        negative.push(picomatch(trimmed.slice(1)));
      } else {
        positive.push(picomatch(trimmed));
      }
    }

    if (negative.length > 0) {
      if (positive.length > 0) {
        return (entry) => positive.some((f) => f(entry.basename)) && !negative.some((f) => f(entry.basename));
      }
      return (entry) => !negative.some((f) => f(entry.basename));
    }
    return (entry) => positive.some((f) => f(entry.basename));
  }
};

class ReaddirpStream extends Readable {
  static get defaultOptions() {
    return {
      root: '.',
      /* eslint-disable no-unused-vars */
      fileFilter: (path) => true,
      directoryFilter: (path) => true,
      /* eslint-enable no-unused-vars */
      type: FILE_TYPE,
      lstat: false,
      depth: 2147483648,
      alwaysStat: false,
    };
  }

  constructor(options = {}) {
    super({
      objectMode: true,
      autoDestroy: true,
      highWaterMark: options.highWaterMark || 4096,
    });
    const opts = { ...ReaddirpStream.defaultOptions, ...options };
    const { root, type } = opts;

    this._fileFilter = normalizeFilter(opts.fileFilter);
    this._directoryFilter = normalizeFilter(opts.directoryFilter);

    this._wantsDir = [DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
    this._wantsFile = [FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
    this._wantsEverything = type === EVERYTHING_TYPE;
    this._root = sysPath.resolve(root);
    this._isDirent = 'Dirent' in fs && !opts.alwaysStat;
    this._statsProp = this._isDirent ? 'dirent' : 'stats';

    const iteratorOptions = {
      stat: opts.lstat ? 'lstat' : 'stat',
      alwaysStat: opts.alwaysStat,
      depth: opts.depth,
      // filter: async (relativePath, stats) => {
      //   var entry = { fullPath: sysPath.join(this._root, relativePath) };
      //   entry[this._statsProp] = stats;

      //   const entryType = await this._getEntryType(entry);
      //   if (entryType === 'directory') {
      //     return this._directoryFilter(entry);
      //   } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
      //     return this._wantsFile;
      //   }
      // },
    };
    this.iterator = new Iterator(root, iteratorOptions);
  }

  async _read(batch) {
    if (this.reading) return;
    this.reading = true;

    try {
      while (!this.destroyed && batch > 0) {
        var entry;

        try {
          entry = await this.iterator.next();
        } catch (error) {
          this._onError(error);
        }

        if (this.destroyed) break;
        if (!entry) {
          this.push(null);
          break;
        }
        if (this._statsProp !== 'stats') {
          entry[this._statsProp] = entry.stats;
        }

        const entryType = await this._getEntryType(entry);
        if (entryType === 'directory' && this._directoryFilter(entry)) {
          if (this._wantsDir) {
            this.push(entry);
            batch--;
          }
        } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
          if (this._wantsFile) {
            this.push(entry);
            batch--;
          }
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }

  _onError(err) {
    if (isNormalFlowError(err) && !this.destroyed) {
      this.emit('warn', err);
    } else {
      this.destroy(err);
    }
  }

  async _getEntryType(entry) {
    // entry may be undefined, because a warning or an error were emitted
    // and the statsProp is undefined
    const stats = entry && entry[this._statsProp];
    if (!stats) {
      return;
    }
    if (stats.isFile()) {
      return 'file';
    }
    if (stats.isDirectory()) {
      return 'directory';
    }
    if (stats && stats.isSymbolicLink()) {
      try {
        const entryRealPath = await realpath(entry.fullPath);
        const entryRealPathStats = await lstat(entryRealPath);
        if (entryRealPathStats.isFile()) {
          return 'file';
        }
        if (entryRealPathStats.isDirectory()) {
          return 'directory';
        }
      } catch (error) {
        this._onError(error);
      }
    }
  }

  _includeAsFile(entry) {
    const stats = entry && entry[this._statsProp];

    return stats && this._wantsEverything && !stats.isDirectory();
  }
}

/**
 * @typedef {Object} ReaddirpArguments
 * @property {Function=} fileFilter
 * @property {Function=} directoryFilter
 * @property {String=} type
 * @property {Number=} depth
 * @property {String=} root
 * @property {Boolean=} lstat
 * @property {Boolean=} bigint
 */

/**
 * Main function which ends up calling readdirRec and reads all files and directories in given root recursively.
 * @param {String} root Root directory
 * @param {ReaddirpArguments=} options Options to specify root (start directory), filters and recursion depth
 */
const readdirp = (root, options = {}) => {
  let type = options.entryType || options.type;
  if (type === 'both') type = FILE_DIR_TYPE; // backwards-compatibility
  if (type) options.type = type;
  if (!root) {
    throw new Error('readdirp: root argument is required. Usage: readdirp(root, options)');
  } else if (typeof root !== 'string') {
    throw new TypeError('readdirp: root argument must be a string. Usage: readdirp(root, options)');
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(', ')}`);
  }

  options.root = root;
  return new ReaddirpStream(options);
};

const readdirpPromise = (root, options = {}) => {
  return new Promise((resolve, reject) => {
    const files = [];
    readdirp(root, options)
      .on('data', (entry) => files.push(entry))
      .on('end', () => resolve(files))
      .on('error', (error) => reject(error));
  });
};

readdirp.promise = readdirpPromise;
readdirp.ReaddirpStream = ReaddirpStream;
readdirp.default = readdirp;

module.exports = readdirp;
