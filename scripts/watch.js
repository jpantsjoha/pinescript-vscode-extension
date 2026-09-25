#!/usr/bin/env node
/**
 * `npm run watch` for the single-engine layout (issue #55).
 *
 * The extension loads the engine from dist/engine, a COPY of packages/validator/dist.
 * A plain `tsc -w -p .` fails on a clean checkout (src/engine.ts type-imports the
 * package declarations, which do not exist yet) and never refreshes dist/engine, so
 * a validator edit would run stale code without any sign of it. This script:
 *
 *   1. builds the engine once and syncs it into dist/engine;
 *   2. runs `tsc -w -p packages/validator` and re-syncs dist/engine each time tsc
 *      reports a finished, error-free cycle ("Found 0 errors. Watching for file
 *      changes."). A cycle with errors is not synced: dist/engine keeps the
 *      last good build;
 *   3. runs `tsc -w -p .` for the extension.
 *
 * The sync is driven by tsc's own end-of-cycle report, not by a filesystem watcher,
 * so it behaves the same on Linux, macOS and Windows and on every supported Node
 * version. Each sync copies into a staging directory beside dist/engine and swaps
 * it in, so dist/engine is never a half-copied mix of two builds.
 *
 * PINE_WATCH_ROOT overrides the project root (used by scripts/watch-smoke.js).
 * No dependencies beyond typescript. Ctrl-C (or SIGTERM) stops both watchers.
 */
'use strict';

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.env.PINE_WATCH_ROOT || path.join(__dirname, '..'));
const TSC = require.resolve('typescript/bin/tsc', { paths: [ROOT, path.join(__dirname, '..')] });
const PKG_DIST = path.join(ROOT, 'packages/validator/dist');
const ENGINE = path.join(ROOT, 'dist/engine');

// ── Cleanup first: nothing is spawned before every exit path can kill it ─────
const children = [];
let stopping = false;
function killChildren() {
  for (const c of children) {
    if (c.exitCode === null && c.signalCode === null) {
      try { c.kill(); } catch { /* already gone */ }
    }
  }
}
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  killChildren();
  process.exit(code);
}
process.on('exit', killChildren);
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('SIGHUP', () => shutdown(0));
process.on('uncaughtException', err => {
  console.error('[watch] fatal:', err && err.stack || err);
  shutdown(1);
});

// ── Staged sync: dist/engine is always one complete build ────────────────────
function syncEngine(reason) {
  const tag = `${process.pid}-${Date.now()}`;
  const staging = `${ENGINE}.staging-${tag}`;
  const old = `${ENGINE}.old-${tag}`;
  fs.mkdirSync(path.dirname(ENGINE), { recursive: true });
  fs.cpSync(PKG_DIST, staging, { recursive: true });
  const hadEngine = fs.existsSync(ENGINE);
  if (hadEngine) fs.renameSync(ENGINE, old);
  fs.renameSync(staging, ENGINE);
  if (hadEngine) fs.rmSync(old, { recursive: true, force: true });
  console.log(`[watch] dist/engine synced from packages/validator/dist (${reason})`);
}

function run(args, label, onLine) {
  const child = spawn(process.execPath, [TSC, ...args], { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
  children.push(child);
  let pending = '';
  child.stdout.on('data', chunk => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop();
    for (const line of lines) {
      if (line.trim()) console.log(`[${label}] ${line}`);
      if (onLine) onLine(line);
    }
  });
  child.on('error', err => { console.error(`[watch] ${label} failed to start: ${err.message}`); shutdown(1); });
  child.on('exit', code => {
    if (stopping) return;
    console.error(`[watch] ${label} exited unexpectedly (${code})`);
    shutdown(code || 1);
  });
  return child;
}

// 1. Initial engine build, so the extension's type imports resolve.
execFileSync(process.execPath, [TSC, '-p', path.join(ROOT, 'packages/validator')], { cwd: ROOT, stdio: 'inherit' });
syncEngine('initial build');

// 2. Engine watcher; sync on each successful end of cycle.
const CYCLE_END = /Found (\d+) errors?\. Watching for file changes/;
run(['-w', '--preserveWatchOutput', '-p', path.join(ROOT, 'packages/validator')], 'engine', line => {
  const m = CYCLE_END.exec(line);
  if (!m) return;
  if (Number(m[1]) === 0) {
    try { syncEngine('engine rebuilt'); }
    catch (err) { console.error(`[watch] sync failed, dist/engine left at the last good build: ${err.message}`); }
  } else {
    console.log(`[watch] engine has ${m[1]} error(s); dist/engine left at the last good build`);
  }
});

// 3. Extension watcher.
run(['-w', '--preserveWatchOutput', '-p', path.join(ROOT, 'tsconfig.json')], 'extension');
