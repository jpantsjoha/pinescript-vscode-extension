#!/usr/bin/env node
/**
 * `npm run watch` for the single-engine layout (issue #55).
 *
 * The extension loads the engine from dist/engine, a COPY of packages/validator/dist.
 * A plain `tsc -w -p .` fails on a clean checkout (src/engine.ts type-imports the
 * package declarations, which do not exist yet) and, once built, never recompiles
 * packages/validator/src or refreshes dist/engine — so a validator edit would run
 * stale code without any sign of it. This script:
 *
 *   1. builds the engine once (tsc -p packages/validator) and copies it to dist/engine;
 *   2. runs `tsc -w -p packages/validator` and re-copies packages/validator/dist into
 *      dist/engine whenever that output changes (debounced);
 *   3. runs `tsc -w -p .` for the extension.
 *
 * No dependencies beyond typescript. Ctrl-C stops both watchers.
 */
'use strict';

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TSC = require.resolve('typescript/bin/tsc');
const PKG_DIST = path.join(ROOT, 'packages/validator/dist');
const ENGINE = path.join(ROOT, 'dist/engine');

function syncEngine(reason) {
  fs.rmSync(ENGINE, { recursive: true, force: true });
  fs.mkdirSync(ENGINE, { recursive: true });
  fs.cpSync(PKG_DIST, ENGINE, { recursive: true });
  console.log(`[watch] dist/engine synced from packages/validator/dist (${reason})`);
}

// 1. Initial engine build, so the extension's type imports resolve.
execFileSync(process.execPath, [TSC, '-p', 'packages/validator'], { cwd: ROOT, stdio: 'inherit' });
syncEngine('initial build');

const children = [];
function run(args, label) {
  const child = spawn(process.execPath, [TSC, ...args], { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
  child.stdout.on('data', d => process.stdout.write(d.toString().replace(/^(?=.)/gm, `[${label}] `)));
  child.on('exit', code => { console.log(`[watch] ${label} exited (${code})`); shutdown(code || 0); });
  children.push(child);
}

// 2. Engine watcher + copy on change.
run(['-w', '--preserveWatchOutput', '-p', 'packages/validator'], 'engine');
let timer = null;
fs.watch(PKG_DIST, { recursive: true }, (_event, file) => {
  if (!file || !file.endsWith('.js')) return;
  clearTimeout(timer);
  timer = setTimeout(() => syncEngine(`changed: ${file}`), 200);
});

// 3. Extension watcher.
run(['-w', '--preserveWatchOutput', '-p', '.'], 'extension');

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  for (const c of children) c.kill();
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
