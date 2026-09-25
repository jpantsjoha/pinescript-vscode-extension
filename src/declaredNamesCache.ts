// Insertion-ordered LRU cache for per-document scan results, keyed by URI and
// guarded by the document version. Extracted from extension.ts so the eviction
// behaviour is testable under `node --test` (extension.ts imports 'vscode').
// Issue #47: on a version change the entry must be DELETED before it is set
// again — a plain `Map.set` on an existing key keeps the old insertion
// position, so the just-edited document stayed the oldest and was the one
// evicted when the cache overflowed.
export class VersionedLruCache<V> {
  private readonly entries = new Map<string, { version: number; value: V }>();

  constructor(private readonly limit: number) {}

  get(uri: string, version: number): V | undefined {
    const hit = this.entries.get(uri);
    if (!hit || hit.version !== version) return undefined;
    // Refresh recency: reinsert so eviction below drops the oldest.
    this.entries.delete(uri);
    this.entries.set(uri, hit);
    return hit.value;
  }

  set(uri: string, version: number, value: V): void {
    // Delete first so a refreshed entry moves to the newest position.
    this.entries.delete(uri);
    this.entries.set(uri, { version, value });
    if (this.entries.size > this.limit) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
  }

  delete(uri: string): void {
    this.entries.delete(uri);
  }
}
