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
 *    engine dependency); `--compare-npm [root]` re-checks that against the real
    node_modules, and
 *    test/engine-parity.test.js plus scripts/verify-vsix.js enforce no npm engine.
 *  - Manifest validation: `vsce package` refuses a package.json `files` field
 *    alongside .vscodeignore; listFiles does not check. `--check-manifest [root]`
 *    does, and scripts/audit.js fails on it.
 *
 *   node scripts/vsce-ls.js --compare-npm [root]     # {none, npm, onlyNone, onlyNpm}
 *   node scripts/vsce-ls.js --check-manifest [root]  # {ok, problem}
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { listFiles, PackageManager } = require('@vscode/vsce');

const ROOT = path.join(__dirname, '..');

const UUID_SEGMENT = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

async function listBoth(cwd) {
  const none = await listFiles({ cwd, packageManager: PackageManager.None });
  const npm = await listFiles({ cwd, packageManager: PackageManager.Npm });
  // Compare paths relative to the package root, whatever the checkout is called.
  const a = new Set(none), b = new Set(npm);
  return { none: none.length, npm: npm.length,
    onlyNone: none.filter(f => !b.has(f)), onlyNpm: npm.filter(f => !a.has(f)) };
}

async function compareNpm(root = ROOT) {
  // Both dependency modes on the same tree; the sets must be identical.
  //
  // npm redacts anything shaped like a UUID in its output, including path segments:
  // `npm list --parseable` under .../0f8fad5b-d9cb-469f-a165-70867728950e/repo prints
  // .../[REDACTED_UUID]/repo (or ***), so vsce's Npm mode would find none of the
  // paths and the modes would "differ" on an unmodified tree. When the real path has
  // such a segment, compare on a copy of the package skeleton (manifest, lockfile,
  // .vscodeignore, node_modules) in a temp directory without one. Copy-on-write
  // clones make that cheap where the filesystem supports them.
  if (!UUID_SEGMENT.test(fs.realpathSync(root))) {
    return process.stdout.write(JSON.stringify(await listBoth(fs.realpathSync(root))));
  }
  // realpath: npm prints physical paths, so a symlinked tmpdir (macOS /var) would skew them.
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'vsce-ls-npm-')));
  if (UUID_SEGMENT.test(fs.realpathSync(dir))) throw new Error(`temp directory ${dir} also has a UUID-like segment`);
  try {
    for (const f of ['package.json', 'package-lock.json', '.vscodeignore']) {
      if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(dir, f));
    }
    if (fs.existsSync(path.join(root, 'node_modules'))) {
      fs.cpSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'),
        { recursive: true, mode: fs.constants.COPYFILE_FICLONE, verbatimSymlinks: true });
    }
    process.stdout.write(JSON.stringify(await listBoth(dir)));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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

/** `vsce package` rejects a `files` field next to .vscodeignore; listFiles does not. */
function checkManifest(root = ROOT) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const problem = Object.prototype.hasOwnProperty.call(manifest, 'files')
    ? 'package.json has a `files` field: `vsce package` rejects it alongside .vscodeignore, and listFiles would not notice'
    : null;
  process.stdout.write(JSON.stringify({ ok: !problem, problem }));
}

const args = process.argv.slice(2);
const rootArg = args[1] ? path.resolve(args[1]) : ROOT;
(args[0] === '--compare-npm' ? compareNpm(rootArg)
  : args[0] === '--check-manifest' ? Promise.resolve(checkManifest(rootArg))
  : ask(args))
  .catch(err => { console.error(`vsce-ls: ${err.stack || err}`); process.exit(2); });
