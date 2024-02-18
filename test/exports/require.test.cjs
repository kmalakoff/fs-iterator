const assert = require('assert');
const FSIterator = require('fs-iterator');

describe('exports .cjs', () => {
  it('signature', () => {
    assert.ok(FSIterator);
  });
});
