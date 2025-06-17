## fs-iterator

A file system iterator with filter and asyncIterator interfaces

Entries are of the format:

- string: basename - file or directory name
- string: path - realtive path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats || fsDirent: stats - file, directory or symlink stats

**Promise**

```
const Iterator = require('fs-iterator');

// traverse skipping .git folders
const iterator = new Iterator(__dirname, { filter: (entry: Entry): boolean => { return entry.stats.isDirectory() && entry.basename === '.git'; } });
iterator.on('error', console.log); // log expected errors without stopping flow 'ENOENT', 'EPERM', 'EACCES', 'ELOOP'

let value = await iterator.next();
while(!value.done) {
  /* do something */
  value = await iterator.next();
}

// using forEach with concurrency
const iterator2 = new Iterator(__dirname, { error: (err) => { return true; /* filter errors */ }});
const done = await iterator2.forEach((entry: Entry): undefined => { /* do something */ }, { concurrency: 1024 })
```

**Callback**

```
const Iterator = require('fs-iterator');

// traverse skipping .git folders
const iterator = new Iterator(__dirname, { filter: (entry: Entry): boolean => { return entry.stats.isDirectory() && entry.basename === '.git'; }, error: (err) => { return true; /* filter errors */ } });
iterator.forEach((entry: Entry): undefined => { /* do something */ }, { concurrency: 1024 }, (err, done) => {})
```

**Iterator Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: Infinity)
- function: filter - filter function to continue processing the tree. Return false to skip processing (default: process all)
- bool: callbacks - use a filter function with a callback format like `function(entry, callback)`. (default: false)
- bool: alwaysStat - stat each file individually rather than fetching dirents when reading directories. (default: false)
- bool: lstat - use lstat to get the link's stats instead of using stat on the file itself. (default: false)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filsystem errors)

**forEach Options**:

- bool: callbacks - use an each function with a callback `function(entry, callback)` (default: false)
- number: concurrency - parallelism of processing. (default: Infinity)
- number: limit - maximum number to process. (default: Infinity)
