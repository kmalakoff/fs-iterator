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

// using each with concurrency
const iterator2 = new Iterator(__dirname, { error: (err) => { return true; /* filter errors */ }});
await iterator2.forEach((entry) => { /* do something */ }, { concurrency: 1024 })
```

**Callback**

```
const Iterator = require('fs-iterator');

// traverse skipping .git folders
const iterator = new Iterator(__dirname, { filter: (entry) => { return entry.stats.isDirectory() && entry.basename === '.git'; }, error: (err) => { return true; /* filter errors */ } });
iterator.forEach((entry) => { /* do something */ }, { concurrency: 1024 }, (err) => {})
```

**Options**:

- number: filter - filter to continue processing the tree
- number: depth - choose maximum depth of the tree to traverse. (default: infinity)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filsystem errors)
- object: fs - choose an fs implementation; for example, you can use use graceful-fs and concurrency 1. (default: fs)
- bool: async - use an async filter function of the form function(entry, callback) with callback being of the form function(err, keep) where keep undefined means continue. `If you use promises, this is unnecessary`. (default: false)
