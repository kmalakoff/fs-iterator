declare module 'fs.realpath' {
  import fs from 'fs';
  const realpath: typeof fs.realpath;
  export = realpath;
}
