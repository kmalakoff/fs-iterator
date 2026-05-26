declare module 'fs.realpath' {
  import type fs from 'fs';

  const realpath: typeof fs.realpath;
  export default realpath;
}
