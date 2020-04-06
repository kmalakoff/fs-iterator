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
