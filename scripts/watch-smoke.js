#!/usr/bin/env node
/**
 * Smoke test for `npm run watch` (scripts/watch.js). CI runs it on every Node
 * version in the matrix (.github/workflows/ci.yml); it never skips.
 *
 * In a throwaway copy of the project (PINE_WATCH_ROOT), with no prior build, it:
 *   1. starts the watcher and waits for the initial sync and both tsc watchers;
 *   2. edits a message in packages/validator/src/accurateValidator.ts and waits for
 *      dist/engine to pick it up;
 *   3. makes a second edit together with a type error, waits for tsc to report the
 *      error, then STOPS the watcher and asserts on the final state: the sync
 *      counter watch.js printed did not move, and dist/engine still holds the
 *      first edit and not the second. (watch.js syncs synchronously inside its
 *      stdout handler, so once it has exited nothing more can be synced.)
 *   4. asserts the watcher exited on SIGTERM and no process under the throwaway
 *      root is left.
 *
 * On any failure it stops the watcher the same way — SIGTERM, then wait for its
 * own cleanup to kill the tsc children — and only as a last resort SIGKILLs the
 * watcher and every process under the root by pid.
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
let exited = null;
let log = '';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Every process whose command line mentions the throwaway root, as [pid, line]. */
function processesUnderRoot() {
  if (process.platform === 'win32') return [];
  return execFileSync('ps', ['-A', '-o', 'pid=,command='], { encoding: 'utf8' })
    .split('\n').filter(l => l.includes(root)).map(l => [Number(l.trim().split(/\s+/)[0]), l.trim()])
    .filter(([pid]) => pid !== process.pid);
}

/** SIGTERM, wait for the wrapper's own cleanup; SIGKILL by pid only as a last resort. */
async function stopWatcher() {
  const notes = [];
  if (watcher && watcher.exitCode === null && watcher.signalCode === null) {
    watcher.kill('SIGTERM');
    const status = await Promise.race([exited, sleep(15000).then(() => null)]);
    if (!status) {
      notes.push('watcher ignored SIGTERM for 15 s; SIGKILL');
      try { watcher.kill('SIGKILL'); } catch { /* gone */ }
    }
  }
  await sleep(1000);
  let left = processesUnderRoot();
  if (left.length) {
    for (const [pid] of left) { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
    await sleep(500);
  }
  return { notes, left };
}

async function finish(failures) {
  const { notes, left } = await stopWatcher();
  failures.push(...notes);
  if (left.length) failures.push(`processes still running after stop:\n    ${left.map(([, l]) => l).join('\n    ')}`);
  const stillLeft = processesUnderRoot();
  if (stillLeft.length) failures.push(`processes survived SIGKILL: ${stillLeft.map(([p]) => p).join(', ')}`);
  fs.rmSync(root, { recursive: true, force: true });
  if (failures.length) {
    console.error(`watch-smoke: FAIL\n  - ${failures.join('\n  - ')}\n--- watch log ---\n${log}`);
    process.exit(1);
  }
  console.log('watch-smoke: watcher and tsc children all exited');
  console.log('watch-smoke: PASS');
  process.exit(0);
}

function copy(rel) { fs.cpSync(path.join(REPO, rel), path.join(root, rel), { recursive: true }); }
for (const rel of ['package.json', 'tsconfig.json', 'src', 'v6',
  'packages/validator/src', 'packages/validator/data', 'packages/validator/index.ts',
  'packages/validator/tsconfig.json', 'packages/validator/package.json']) copy(rel);
fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'junction');

async function waitFor(what, predicate) {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    if (predicate()) return Date.now() - start;
    await sleep(250);
  }
  throw new Error(`timed out after ${TIMEOUT_MS} ms waiting for ${what}`);
}
const engineFile = path.join(root, 'dist/engine/src/accurateValidator.js');
const engineHas = s => fs.existsSync(engineFile) && fs.readFileSync(engineFile, 'utf8').includes(s);
const srcFile = path.join(root, 'packages/validator/src/accurateValidator.ts');
const count = re => (log.match(re) || []).length;
const lastSync = () => Math.max(0, ...[...log.matchAll(/\[watch\] sync #(\d+):/g)].map(m => Number(m[1])));

(async () => {
  const failures = [];
  try {
    watcher = spawn(process.execPath, [path.join(REPO, 'scripts/watch.js')], {
      cwd: root, env: { ...process.env, PINE_WATCH_ROOT: root }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    exited = new Promise(r => watcher.on('exit', (code, signal) => r({ code, signal })));
    watcher.stdout.on('data', d => { log += d; });
    watcher.stderr.on('data', d => { log += d; });

    const ready = await waitFor('initial sync and both watchers',
      () => /sync #\d+: .*initial build/.test(log) && count(/Watching for file changes/g) >= 2 &&
        fs.existsSync(path.join(root, 'dist/src/extension.js')));
    console.log(`watch-smoke: ready in ${ready} ms (no prior build)`);

    // 2. A good edit reaches dist/engine.
    const src = fs.readFileSync(srcFile, 'utf8');
    if (!src.includes('constant or function')) throw new Error('probe anchor not found in accurateValidator.ts');
    fs.writeFileSync(srcFile, src.replace('constant or function', 'constant or function SMOKEPROBE1'));
    const picked = await waitFor('dist/engine to pick up SMOKEPROBE1', () => engineHas('SMOKEPROBE1'));
    console.log(`watch-smoke: edit synced into dist/engine in ${picked} ms (sync #${lastSync()})`);

    // 3. A cycle with errors must not sync — judged on the final state after stop.
    const syncsBefore = lastSync();
    const errorsBefore = count(/Found [1-9]\d* errors?\. Watching/g);
    fs.writeFileSync(srcFile, fs.readFileSync(srcFile, 'utf8')
      .replace('SMOKEPROBE1', 'SMOKEPROBE2') + '\nconst smokeTypeError: number = "not a number";\n');
    await waitFor('tsc to report the injected error', () => count(/Found [1-9]\d* errors?\. Watching/g) > errorsBefore);

    // 4. Stop, then judge.
    watcher.kill('SIGTERM');
    const status = await Promise.race([exited, sleep(15000).then(() => null)]);
    if (!status) failures.push('watcher did not exit within 15 s of SIGTERM');
    if (lastSync() !== syncsBefore) failures.push(`dist/engine was synced from a cycle that had errors (sync #${syncsBefore} → #${lastSync()})`);
    if (engineHas('SMOKEPROBE2')) failures.push('dist/engine holds the edit from the failed cycle');
    if (!engineHas('SMOKEPROBE1')) failures.push('dist/engine lost the last good build');
    if (fs.readdirSync(path.join(root, 'dist')).some(n => /^engine\.(staging|old)-/.test(n))) {
      failures.push('staging or old engine directories left behind');
    }
    if (!failures.length) console.log('watch-smoke: failed cycle not synced; dist/engine holds the last good build');
  } catch (err) {
    failures.push(err.message);
  }
  await finish(failures);
})();
