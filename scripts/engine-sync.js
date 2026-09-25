/**
 * Replace dist/engine with a fresh copy of packages/validator/dist, keeping the
 * last good build if anything goes wrong. Used by scripts/watch.js.
 *
 *   1. copy the new build into `<engine>.staging-*` (a failure here leaves
 *      dist/engine untouched);
 *   2. rename dist/engine aside to `<engine>.old-*`;
 *   3. rename staging into place; if that fails, rename `old` back and rethrow;
 *   4. remove `old`.
 *
 * Known limit: if the process is KILLED between steps 2 and 3 (a few microseconds),
 * dist/engine is absent until the next sync or `npm run build`; the last good build
 * is still on disk as `<engine>.old-*`. This is development tooling (`npm run watch`)
 * and never a shipped path, so a two-rename swap is accepted rather than an
 * indirection layer.
 *
 * Fault injection: PINE_WATCH_FAIL_SWAP=1 makes step 3 fail, so tests can prove the
 * restore path (test/engine-sync.test.js).
 */
'use strict';

const fs = require('fs');
const path = require('path');

function syncEngine(pkgDist, engine) {
  const tag = `${process.pid}-${Date.now()}`;
  const staging = `${engine}.staging-${tag}`;
  const old = `${engine}.old-${tag}`;
  fs.mkdirSync(path.dirname(engine), { recursive: true });
  try {
    fs.cpSync(pkgDist, staging, { recursive: true });
  } catch (err) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw err;
  }

  const hadEngine = fs.existsSync(engine);
  if (hadEngine) fs.renameSync(engine, old);
  try {
    if (process.env.PINE_WATCH_FAIL_SWAP === '1') throw new Error('injected swap failure (PINE_WATCH_FAIL_SWAP=1)');
    fs.renameSync(staging, engine);
  } catch (err) {
    if (hadEngine) fs.renameSync(old, engine);
    fs.rmSync(staging, { recursive: true, force: true });
    throw err;
  }
  if (hadEngine) fs.rmSync(old, { recursive: true, force: true });
}

module.exports = { syncEngine };
