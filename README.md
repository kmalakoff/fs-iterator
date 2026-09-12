## fs-iterator

A file system iterator with filter and async iterator interfaces.

```sh
npm install fs-iterator
```

Entries are of the format:

- string: basename - file or directory name
- string: path - relative path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats || fsDirent: stats - file, directory or symlink stats

## Promise

```js
const Iterator = require('fs-iterator');

async function main() {
  // Traverse while skipping .git directories.
  const iterator = new Iterator(__dirname, {
    filter: (entry) => entry.basename !== '.git',
  });
  iterator.on('error', console.log); // Log expected filesystem errors.

  for await (const entry of iterator) {
    console.log(entry.path);
  }

  const iterator2 = new Iterator(__dirname);
  await iterator2.forEach((entry) => console.log(entry.path), { concurrency: 32 });
}

main().catch(console.error);
```

## Callback

```js
const Iterator = require('fs-iterator');

var iterator = new Iterator(__dirname, {
  filter: function (entry) {
    return entry.basename !== '.git';
  },
});
iterator.forEach(
  function (entry) {
    console.log(entry.path);
  },
  { concurrency: 32 },
  function (err) {
    if (err) console.error(err);
  }
);
```

## Iterator options

- number: depth - choose maximum depth of the tree to traverse. (default: Infinity)
- function: filter - filter function to continue processing the tree. Return false to skip processing (default: process all)
- bool: callbacks - use a filter function with a callback format like `function(entry, callback)`. (default: false)
- bool: alwaysStat - stat each file individually rather than fetching dirents when reading directories. (default: false)
- bool: lstat - use lstat to get the link's stats instead of using stat on the file itself. (default: false)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filesystem errors)

## forEach options

- bool: callbacks - use an each function with a callback `function(entry, callback)` (default: false)
- number: concurrency - parallelism of processing. (default: 1)
- number: limit - maximum number to process. (default: Infinity)
