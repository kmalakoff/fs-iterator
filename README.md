## fs-iterator

A file system iterator with filter and asyncIterator iterafaces. Supports Node 0.10 and above

**Promise**

```
const Iterator = require('fs-iterator');

const iterator = new Iterator(/* directory */);
let result = await iterator.next();
while(result) result = await iterator.next();
```

**Callback**

```
const Iterator = require('fs-iterator');
const maximize = require('maximize-iterator');

const iterator = new Iterator(/* directory */);
maximize(iterator, { concurrency: 1, each: (value) => { /* do something */ }}, (err) => {
  /* done */
})
```

**Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: infinity)
- number: concurrency - choose maximum number of concurrently processed files or folders. (default: set from performance testing)
- object: fs - choose an fs implementation; for example, you can use use graceful-fs and concurrency 1. (default: fs)
- bool: async - use an async filter function of the form function(path, stats, callback) with callback being of the form function(err, keep) where keep undefined means continue. `If you use promises, this is unnecessary`. (default: false)
