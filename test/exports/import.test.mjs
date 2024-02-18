import assert from 'assert';
import FSIterator from 'fs-iterator';

describe('exports .mjs', () => {
  it('signature', () => {
    assert.ok(FSIterator);
  });
});
