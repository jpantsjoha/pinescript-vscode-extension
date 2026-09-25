#!/usr/bin/env node
/**
 * Ask the pinned @vscode/vsce which of a set of paths it would package.
 *
 *   node scripts/vsce-ls.js <path> [<path> ...]    # prints the shipped subset as JSON
 *
 * vsce's own `listFiles` applies .vscodeignore exactly as `vsce package` does. It runs
 * against a throwaway skeleton (this repo's package.json and .vscodeignore, plus an
 * empty placeholder at every path asked about), so it works before a build and never
 * touches the network.
 *
 * Where this differs from `vsce package`, and why each difference is guarded:
 *  - Dependencies: listFiles runs with PackageManager.None, so node_modules is not
 *    collected. With PackageManager.Npm the listing for this repo is identical
 *    (`.vscodeignore` excludes node_modules/** and the extension has no runtime
 *    engine dependency); `--compare-npm` re-checks that on the real tree, and
 *    test/engine-parity.test.js plus scripts/verify-vsix.js enforce no npm engine.
 *  - Manifest validation: `vsce package` refuses a package.json `files` field
 *    alongside .vscodeignore; listFiles does not check. scripts/audit.js fails if
 *    package.json gains a `files` field.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { listFiles, PackageManager } = require('@vscode/vsce');

const ROOT = path.join(__dirname, '..');

async function compareNpm() {
  // Real tree, both dependency modes: the sets must be identical.
  const none = await listFiles({ cwd: ROOT, packageManager: PackageManager.None });
  const npm = await listFiles({ cwd: ROOT, packageManager: PackageManager.Npm });
  const a = new Set(none), b = new Set(npm);
  const onlyNone = none.filter(f => !b.has(f)), onlyNpm = npm.filter(f => !a.has(f));
  process.stdout.write(JSON.stringify({ none: none.length, npm: npm.length, onlyNone, onlyNpm }));
}

async function ask(asked) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vsce-ls-'));
  try {
    for (const f of ['package.json', '.vscodeignore']) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
    for (const rel of asked) {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), '');
    }
    const files = await listFiles({ cwd: dir, packageManager: PackageManager.None });
    const shipped = new Set(files.map(f => f.replace(/\\/g, '/')));
    process.stdout.write(JSON.stringify(asked.filter(p => shipped.has(p))));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
(args[0] === '--compare-npm' ? compareNpm() : ask(args))
  .catch(err => { console.error(`vsce-ls: ${err.stack || err}`); process.exit(2); });
