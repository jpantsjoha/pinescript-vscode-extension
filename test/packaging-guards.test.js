/**
 * Negative tests for the packaging guards: each one must FAIL on a bad fixture and
 * stay quiet on the matching good one. Fixtures are built in a temp directory.
 *
 *   - scripts/verify-vsix.js: a VSIX with one extra entry fails at the listing
 *     stage (expected-contents allowlist) and is never extracted.
 *   - scripts/vsce-ls.js --check-manifest: a package.json `files` field fails.
 *   - scripts/vsce-ls.js --compare-npm: a dependency that ships only in vsce's Npm
 *     mode is reported as a divergence.
 *   - packages/validator/scripts/check-pack.js: extra, missing, duplicate and
 *     iCloud conflict-copy entries fail while the exact set passes.
 *
 * The VSIX fixture needs the `zip` and `unzip` CLIs. Without them the VSIX test
 * skips locally and FAILS under CI, so the guard can never go silently untested.
 */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VERIFY = path.join(ROOT, 'scripts/verify-vsix.js');
const VSCE_LS = path.join(ROOT, 'scripts/vsce-ls.js');
const PACK_GUARD_PATH = path.join(ROOT, 'packages', 'validator', 'scripts', 'check-pack.js');
const PACK_GUARD = require(PACK_GUARD_PATH);
const { findPackageScriptPublishCallers } = require('../scripts/audit.js');

const tmp = prefix => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
const hasCli = cmd => spawnSync(cmd, ['-v'], { stdio: 'ignore' }).status === 0 ||
  spawnSync(cmd, ['-h'], { stdio: 'ignore' }).status === 0;
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

/** A VSIX listing that satisfies every required-file and allowlist rule. */
function buildVsix(dir, extraEntries) {
  const tsJs = d => fs.readdirSync(path.join(ROOT, d)).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
    .map(f => f.replace(/\.ts$/, '.js'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const files = [
    'extension.vsixmanifest', '[Content_Types].xml', 'extension/package.json',
    `extension/${manifest.main.replace(/^\.\//, '')}`, 'extension/dist/engine/index.js',
    ...tsJs('packages/validator/src').map(f => `extension/dist/engine/src/${f}`),
    ...tsJs('packages/validator/data').map(f => `extension/dist/engine/data/${f}`),
    ...extraEntries,
  ];
  const stage = path.join(dir, 'stage');
  for (const f of files) {
    fs.mkdirSync(path.dirname(path.join(stage, f)), { recursive: true });
    fs.writeFileSync(path.join(stage, f), f.endsWith('package.json') ? JSON.stringify(manifest) : '');
  }
  const out = path.join(dir, `fixture-${extraEntries.length}.vsix`);
  execFileSync('zip', ['-q', '-r', out, '.'], { cwd: stage });
  fs.rmSync(stage, { recursive: true, force: true });
  return out;
}

test('verify-vsix: an extra entry fails the expected-contents check before extraction', (t) => {
  if (!hasCli('zip') || !hasCli('unzip')) {
    assert.ok(!process.env.CI, 'zip/unzip are missing in CI — the VSIX guard would go untested');
    t.skip('zip/unzip not installed');
    return;
  }
  const dir = tmp('vsix-guard-');
  try {
    const bad = run(VERIFY, [buildVsix(dir, ['extension/delta.diff'])]);
    assert.strictEqual(bad.status, 1, bad.stdout + bad.stderr);
    assert.match(bad.stderr, /unexpected file in VSIX .*extension\/delta\.diff/);
    assert.match(bad.stderr, /not extracted/, 'a failed listing must stop before extraction');

    // Control: the same archive without the extra entry passes the listing stage
    // (it then fails activation, because the placeholder files are empty).
    const good = run(VERIFY, [buildVsix(dir, [])]);
    assert.doesNotMatch(good.stdout + good.stderr, /unexpected file|not extracted/);
    assert.match(good.stdout, /entries; \d+ required runtime files checked/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('vsce-ls --check-manifest: a package.json `files` field is refused', () => {
  const dir = tmp('manifest-guard-');
  try {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', files: ['dist'] }));
    const bad = JSON.parse(run(VSCE_LS, ['--check-manifest', dir]).stdout);
    assert.strictEqual(bad.ok, false);
    assert.match(bad.problem, /`files` field/);

    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x' }));
    const good = JSON.parse(run(VSCE_LS, ['--check-manifest', dir]).stdout);
    assert.deepStrictEqual(good, { ok: true, problem: null });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('vsce-ls --compare-npm: a dependency only the Npm mode would ship is a divergence', () => {
  const dir = tmp('npm-guard-');
  try {
    const manifest = {
      name: 'guard-fixture', version: '1.0.0', publisher: 'fixture', engines: { vscode: '^1.88.0' },
      dependencies: { 'fake-dep': '1.0.0' },
    };
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(dir, 'package-lock.json'), JSON.stringify({
      name: 'guard-fixture', version: '1.0.0', lockfileVersion: 3, requires: true,
      packages: {
        '': { name: 'guard-fixture', version: '1.0.0', dependencies: { 'fake-dep': '1.0.0' } },
        'node_modules/fake-dep': { version: '1.0.0' },
      },
    }, null, 2));
    fs.mkdirSync(path.join(dir, 'node_modules/fake-dep'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules/fake-dep/package.json'), JSON.stringify({ name: 'fake-dep', version: '1.0.0' }));
    fs.writeFileSync(path.join(dir, 'node_modules/fake-dep/index.js'), '');

    // Bad: nothing excludes node_modules, so the Npm mode ships the dependency.
    fs.writeFileSync(path.join(dir, '.vscodeignore'), '*.md\n');
    const bad = JSON.parse(run(VSCE_LS, ['--compare-npm', dir]).stdout);
    assert.ok(bad.onlyNpm.some(f => f.startsWith('node_modules/fake-dep/')), JSON.stringify(bad));

    // Good: node_modules excluded, as in this repo — the modes agree.
    fs.writeFileSync(path.join(dir, '.vscodeignore'), 'node_modules/**\n');
    const good = JSON.parse(run(VSCE_LS, ['--compare-npm', dir]).stdout);
    assert.deepStrictEqual([good.onlyNone, good.onlyNpm], [[], []], JSON.stringify(good));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('check-pack compares as a multiset and rejects sync-conflict copies', () => {
  const packageDir = path.join(ROOT, 'packages', 'validator');
  const { expected, problems } = PACK_GUARD.expectedFiles(packageDir);
  assert.deepStrictEqual(problems, []);
  assert.strictEqual(expected.length, 25);
  assert.deepStrictEqual(PACK_GUARD.compare(expected, expected), {
    extra: [], missing: [], problems: [],
  });

  const missing = PACK_GUARD.compare(expected, expected.slice(1));
  assert.deepStrictEqual(missing.missing, [expected[0]]);

  const duplicate = PACK_GUARD.compare(expected, [...expected, expected[0]]);
  assert.deepStrictEqual(duplicate.extra, [expected[0]]);
  assert.match(duplicate.problems.join('\n'), /duplicate package entry/);

  const conflictName = 'dist/index 2.js';
  const conflict = PACK_GUARD.compare(expected, [...expected, conflictName]);
  assert.deepStrictEqual(conflict.extra, [conflictName]);
  assert.match(conflict.problems.join('\n'), /sync-conflict copy/);
});

test('check-pack does not trust ambient npm cache configuration', () => {
  const dir = tmp('check-pack-cache-');
  try {
    const invalidCache = path.join(dir, 'not-a-directory');
    fs.writeFileSync(invalidCache, 'fixture');
    const checked = spawnSync(process.execPath, [PACK_GUARD_PATH], {
      cwd: path.join(ROOT, 'packages', 'validator'),
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: invalidCache },
    });
    assert.strictEqual(checked.status, 0, checked.stdout + checked.stderr);
    assert.match(checked.stdout, /check-pack: PASS/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('engine publish audit finds npm publish in any package manifest script', () => {
  const dir = tmp('engine-publish-audit-');
  try {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      scripts: { test: 'node --test', release: 'npm publish ./engine.tgz' },
    }));
    assert.deepStrictEqual(
      findPackageScriptPublishCallers(dir, ['package.json']),
      ['package.json#scripts.release']
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
