## fs-iterator

A file system iterator with filter and asyncIterator iterafaces. Supports Node 0.10 and above

Entries are of the format:

- string: basename - file or directory name
- string: path - realtive path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats: stats - file, directory or symlink stats

**Promise**

```
const Iterator = require('fs-iterator');

const iterator = new Iterator(/* directory */);
let entry = await iterator.next();
while(entry) {
  entry = await iterator.next();
}
```

**Callback**

```
const Iterator = require('fs-iterator');
const maximize = require('maximize-iterator');

const iterator = new Iterator(/* directory */);
maximize(iterator, { concurrency: 1, each: (err, entry) => { /* do something */ }}, (err) => {
  /* done */
})
```

**Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: infinity)
- number: concurrency - choose maximum number of concurrently processed files or folders. (default: set from performance testing)
- object: fs - choose an fs implementation; for example, you can use use graceful-fs and concurrency 1. (default: fs)
- bool: async - use an async filter function of the form function(entry, callback) with callback being of the form function(err, keep) where keep undefined means continue. `If you use promises, this is unnecessary`. (default: false)
