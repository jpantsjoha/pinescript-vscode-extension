/**
 * Declared-names cache eviction order (issue #47).
 *
 * A version change used to replace the Map value without moving the key to the
 * newest position, so after editing document A and opening a 21st document, A
 * (freshly edited) was evicted instead of B (the oldest). The fix deletes the
 * URI before setting the refreshed entry.
 *
 * The cache is vscode-free (src/declaredNamesCache.ts) and tested here against
 * the compiled dist output, like test/intellisense-coverage.test.js.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { VersionedLruCache } = require('../dist/src/declaredNamesCache.js');

const LIMIT = 20;
const names = (tag) => new Map([[tag, 0]]);

function fill(cache, count, startCode = 65 /* 'A' */) {
  for (let i = 0; i < count; i++) {
    const tag = String.fromCharCode(startCode + i);
    cache.set(`file:///${tag}.pine`, 1, names(tag));
  }
}

test('edit + request refreshes recency: oldest untouched entry is evicted', () => {
  const cache = new VersionedLruCache(LIMIT);
  fill(cache, LIMIT); // A..T, all at version 1

  // Edit A (version 2) and request it: a miss on version, then a refreshed set.
  assert.strictEqual(cache.get('file:///A.pine', 2), undefined);
  cache.set('file:///A.pine', 2, names('A2'));

  // Open U: the cache overflows and must evict B, not the just-edited A.
  cache.set('file:///U.pine', 1, names('U'));

  assert.strictEqual(cache.get('file:///B.pine', 1), undefined, 'B should be evicted');
  assert.deepStrictEqual(cache.get('file:///A.pine', 2), names('A2'), 'A should survive');
  assert.deepStrictEqual(cache.get('file:///U.pine', 1), names('U'), 'U should be cached');
});

test('matching version returns the cached names and refreshes recency', () => {
  const cache = new VersionedLruCache(LIMIT);
  fill(cache, LIMIT); // A..T

  assert.deepStrictEqual(cache.get('file:///A.pine', 1), names('A'));

  // A was just touched, so the overflow evicts B.
  cache.set('file:///U.pine', 1, names('U'));
  assert.strictEqual(cache.get('file:///B.pine', 1), undefined, 'B should be evicted');
  assert.deepStrictEqual(cache.get('file:///A.pine', 1), names('A'), 'A should survive');
});

test('stale version is a miss and delete drops the entry', () => {
  const cache = new VersionedLruCache(LIMIT);
  cache.set('file:///A.pine', 1, names('A'));

  assert.strictEqual(cache.get('file:///A.pine', 2), undefined);

  cache.delete('file:///A.pine');
  assert.strictEqual(cache.get('file:///A.pine', 1), undefined);
});
