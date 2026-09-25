#!/usr/bin/env node
/**
 * Ask the pinned @vscode/vsce which of a set of paths it would package.
 *
 *   node scripts/vsce-ls.js <path> [<path> ...]    # prints the shipped subset as JSON
 *
 * vsce's own `listFiles` decides, so .vscodeignore is evaluated exactly as
 * `vsce package` evaluates it. It runs against a throwaway skeleton (this repo's
 * package.json and .vscodeignore, plus an empty placeholder at every path asked
 * about), so it works before a build and never touches the network. Dependencies
 * are not collected (PackageManager.None): node_modules never ships here because
 * .vscodeignore excludes it and the extension has no engine dependency, which
 * test/engine-parity.test.js and scripts/verify-vsix.js enforce.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

// vsce imports cheerio at module load but uses it only to rewrite README images
// while packaging, never in listFiles. This repo's cheerio (1.1.2, for the crawler)
// pulls undici 7, which does not load on Node 18. Hand vsce a stub that throws if
// it is ever actually used, so the listing works on every Node in the CI matrix.
const originalLoad = Module._load;
Module._load = function (request) {
  if (request === 'cheerio') {
    return { load() { throw new Error('vsce-ls: cheerio is stubbed; listFiles must not need it'); } };
  }
  return originalLoad.apply(this, arguments);
};
const { listFiles, PackageManager } = require('@vscode/vsce');
Module._load = originalLoad;

const ROOT = path.join(__dirname, '..');
const asked = process.argv.slice(2);

(async () => {
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
})().catch(err => { console.error(`vsce-ls: ${err.stack || err}`); process.exit(2); });
