import fs from 'graceful-fs';

// prior to Node 9, fs.readdir did not return sorted files
const parts = process.versions.node.split('.');
const readdir =
  +parts[0] === 0 && +parts[1] <= 8
    ? function readdirSort(path: string, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void {
        fs.readdir(path, (err: NodeJS.ErrnoException | null, files: string[]) => {
          err ? callback(err, [] as string[]) : callback(null, files.sort());
        });
      }
    : fs.readdir;

function readdirAddOptions(path: string, _options: object | undefined, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void {
  return readdir(path, callback);
}

export default (fs.readdir.length === 3 ? fs.readdir : readdirAddOptions) as unknown as typeof fs.readdir;
