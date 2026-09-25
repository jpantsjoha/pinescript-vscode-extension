/**
 * scripts/engine-sync.js — the staged swap `npm run watch` uses to refresh
 * dist/engine. A failed swap must leave the LAST GOOD build in place, complete,
 * with no staging or old directories left behind.
 */
'use strict';

const { test, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { syncEngine } = require('../scripts/engine-sync');

let dir;
function setup() {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-sync-'));
  const pkgDist = path.join(dir, 'packages/validator/dist');
  const engine = path.join(dir, 'dist/engine');
  fs.mkdirSync(path.join(pkgDist, 'src'), { recursive: true });
  fs.mkdirSync(path.join(engine, 'src'), { recursive: true });
  fs.writeFileSync(path.join(engine, 'index.js'), 'last-good');
  fs.writeFileSync(path.join(engine, 'src/a.js'), 'last-good-a');
  fs.writeFileSync(path.join(pkgDist, 'index.js'), 'new');
  fs.writeFileSync(path.join(pkgDist, 'src/a.js'), 'new-a');
  return { pkgDist, engine };
}
const leftovers = () => fs.readdirSync(path.join(dir, 'dist')).filter(n => n !== 'engine');

afterEach(() => {
  delete process.env.PINE_WATCH_FAIL_SWAP;
  fs.rmSync(dir, { recursive: true, force: true });
});

test('engine-sync: a successful swap installs the new build and cleans up', () => {
  const { pkgDist, engine } = setup();
  syncEngine(pkgDist, engine);
  assert.strictEqual(fs.readFileSync(path.join(engine, 'index.js'), 'utf8'), 'new');
  assert.strictEqual(fs.readFileSync(path.join(engine, 'src/a.js'), 'utf8'), 'new-a');
  assert.deepStrictEqual(leftovers(), []);
});

test('engine-sync: a failed swap (fault injected) restores the last good build', () => {
  const { pkgDist, engine } = setup();
  process.env.PINE_WATCH_FAIL_SWAP = '1';
  assert.throws(() => syncEngine(pkgDist, engine), /injected swap failure/);
  assert.strictEqual(fs.readFileSync(path.join(engine, 'index.js'), 'utf8'), 'last-good');
  assert.strictEqual(fs.readFileSync(path.join(engine, 'src/a.js'), 'utf8'), 'last-good-a');
  assert.deepStrictEqual(leftovers(), [], 'staging/old directories left behind');
});

test('engine-sync: a failed copy leaves dist/engine untouched', () => {
  const { engine } = setup();
  assert.throws(() => syncEngine(path.join(dir, 'does-not-exist'), engine));
  assert.strictEqual(fs.readFileSync(path.join(engine, 'index.js'), 'utf8'), 'last-good');
  assert.deepStrictEqual(leftovers(), []);
});
