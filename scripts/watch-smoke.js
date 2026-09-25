#!/usr/bin/env node
/**
 * Smoke test for `npm run watch` (scripts/watch.js). CI runs it on every Node
 * version in the matrix (.github/workflows/ci.yml); it never skips.
 *
 * In a throwaway copy of the project (PINE_WATCH_ROOT), with no prior build, it:
 *   1. starts the watcher and waits for the engine sync and both tsc watchers;
 *   2. edits a message in packages/validator/src/accurateValidator.ts and asserts
 *      dist/engine picks it up;
 *   3. introduces a type error alongside a second edit and asserts dist/engine is
 *      NOT synced from the failed cycle (it keeps the last good build);
 *   4. sends SIGTERM and asserts the watcher and every tsc child have exited.
 *
 *   node scripts/watch-smoke.js
 */
'use strict';

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.join(__dirname, '..');
const TIMEOUT_MS = Number(process.env.WATCH_SMOKE_TIMEOUT_MS || 120000);
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'pine-watch-smoke-')));

let watcher = null;
let log = '';
const failures = [];

function done(code) {
  if (watcher && watcher.exitCode === null) { try { watcher.kill('SIGKILL'); } catch { /* gone */ } }
  fs.rmSync(root, { recursive: true, force: true });
  process.exit(code);
}
process.on('uncaughtException', err => { console.error(`watch-smoke: ${err.stack || err}`); done(1); });

function copy(rel) { fs.cpSync(path.join(REPO, rel), path.join(root, rel), { recursive: true }); }
for (const rel of ['package.json', 'tsconfig.json', 'src', 'v6', 'packages/validator/src',
  'packages/validator/data', 'packages/validator/index.ts', 'packages/validator/tsconfig.json',
  'packages/validator/package.json']) copy(rel);
fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'junction');

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(what, predicate) {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    if (predicate()) return Date.now() - start;
    await sleep(250);
  }
  throw new Error(`timed out after ${TIMEOUT_MS} ms waiting for ${what}\n--- watch log ---\n${log}`);
}
const engineFile = path.join(root, 'dist/engine/src/accurateValidator.js');
const engineHas = s => fs.existsSync(engineFile) && fs.readFileSync(engineFile, 'utf8').includes(s);
const srcFile = path.join(root, 'packages/validator/src/accurateValidator.ts');
const count = re => (log.match(re) || []).length;

/** Every process whose command line mentions the throwaway root. */
function processesUnderRoot() {
  if (process.platform === 'win32') return [];
  const out = execFileSync('ps', ['-A', '-o', 'pid=,command='], { encoding: 'utf8' });
  return out.split('\n').filter(l => l.includes(root) && !l.includes('ps -A'));
}

(async () => {
  watcher = spawn(process.execPath, [path.join(REPO, 'scripts/watch.js')], {
    cwd: root, env: { ...process.env, PINE_WATCH_ROOT: root }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  watcher.stdout.on('data', d => { log += d; });
  watcher.stderr.on('data', d => { log += d; });

  const ready = await waitFor('initial sync and both watchers',
    () => /synced .*initial build/.test(log) && count(/Watching for file changes/g) >= 2 &&
      fs.existsSync(path.join(root, 'dist/src/extension.js')));
  console.log(`watch-smoke: ready in ${ready} ms (no prior build)`);

  // 2. A good edit reaches dist/engine.
  const src = fs.readFileSync(srcFile, 'utf8');
  if (!src.includes('constant or function')) throw new Error('probe anchor not found in accurateValidator.ts');
  fs.writeFileSync(srcFile, src.replace('constant or function', 'constant or function SMOKEPROBE1'));
  const picked = await waitFor('dist/engine to pick up SMOKEPROBE1', () => engineHas('SMOKEPROBE1'));
  console.log(`watch-smoke: edit synced into dist/engine in ${picked} ms`);
  if (fs.readdirSync(path.join(root, 'dist')).some(n => /^engine\.(staging|old)-/.test(n))) {
    failures.push('staging or old engine directories left behind after a sync');
  }

  // 3. A cycle with errors must not sync.
  const errorsBefore = count(/Found [1-9]\d* errors?\. Watching/g);
  fs.writeFileSync(srcFile, fs.readFileSync(srcFile, 'utf8')
    .replace('SMOKEPROBE1', 'SMOKEPROBE2') + '\nconst smokeTypeError: number = "not a number";\n');
  await waitFor('tsc to report the injected error', () => count(/Found [1-9]\d* errors?\. Watching/g) > errorsBefore);
  await sleep(1000);
  if (engineHas('SMOKEPROBE2')) failures.push('dist/engine was synced from a cycle that had errors');
  if (!engineHas('SMOKEPROBE1')) failures.push('dist/engine lost the last good build after a failed cycle');
  console.log('watch-smoke: failed cycle left dist/engine at the last good build');

  // 4. Stop, and leave nothing behind.
  const exited = new Promise(r => watcher.on('exit', (code, signal) => r({ code, signal })));
  watcher.kill('SIGTERM');
  const status = await Promise.race([exited, sleep(15000).then(() => null)]);
  if (!status) failures.push('watcher did not exit within 15 s of SIGTERM');
  await sleep(1000);
  const leftovers = processesUnderRoot();
  if (leftovers.length) failures.push(`processes still running after stop:\n    ${leftovers.join('\n    ')}`);
  else console.log('watch-smoke: watcher and tsc children all exited');

  if (failures.length) {
    console.error(`watch-smoke: FAIL\n  - ${failures.join('\n  - ')}\n--- watch log ---\n${log}`);
    done(1);
  }
  console.log('watch-smoke: PASS');
  done(0);
})().catch(err => { console.error(`watch-smoke: FAIL: ${err.message}`); done(1); });
