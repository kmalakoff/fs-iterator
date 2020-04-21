## fs-iterator

A file system iterator with filter and asyncIterator iterafaces. Supports Node 0.10 and above

_Note:_ This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/paulmillr/readdirp) test suites plus it does not accumulate results in memory.

Entries are of the format:

- string: basename - file or directory name
- string: path - realtive path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats: stats - file, directory or symlink stats

**Promise**

```
const Iterator = require('fs-iterator');

// traverse skipping .git folders
const iterator = new Iterator(__dirname, { filter: (entry) => { return entry.stats.isDirectory() && entry.basename === '.git'; } });
iterator.on('error', console.log); // log expected errors without stopping flow 'ENOENT', 'EPERM', 'EACCES', 'ELOOP'

let entry = await iterator.next();
while(entry) {
  /* do something */
  entry = await iterator.next();
}

// using forEach with concurrency
const iterator2 = new Iterator(__dirname, { error: (err) => { return true; /* filter errors */ }});
const done = await iterator2.forEach((entry) => { /* do something */ }, { concurrency: 1024 })
```

**Callback**

```
const Iterator = require('fs-iterator');

// traverse skipping .git folders
const iterator = new Iterator(__dirname, { filter: (entry) => { return entry.stats.isDirectory() && entry.basename === '.git'; }, error: (err) => { return true; /* filter errors */ } });
iterator.forEach((entry) => { /* do something */ }, { concurrency: 1024 }, (err, done) => {})
```

**Iterator Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: Infinity)
- function: filter - filter function to continue processing the tree. Return false to skip processing (default: process all)
- bool: callbacks - use a filter function with a callback format like `function(entry, callback)`. (default: false)
- bool: stats - always call stats before filter. (default: false)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filsystem errors)

**forEach Options**:

- bool: callbacks - use an each function with a callback `function(entry, callback)` (default: false)
- number: concurrency - parallelism of processing. (default: Infinity)
- number: limit - maximum number to process. (default: Infinity)
