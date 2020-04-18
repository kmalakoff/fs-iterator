const HAS_ASYNC_ITERATOR = typeof Symbol !== 'undefined' && Symbol.asyncIterator;
const HAS_ASYNC_AWAIT = typeof Symbol !== 'undefined' && Symbol.asyncIterator;

describe('platform specific', function () {
  if (HAS_ASYNC_ITERATOR) require('./asyncIterator');
  if (HAS_ASYNC_AWAIT) require('./asyncAwait');
});
