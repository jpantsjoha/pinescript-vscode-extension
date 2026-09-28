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
const DIFF_DIAGNOSTICS = path.join(ROOT, 'scripts/diff-diagnostics.js');
const PACK_GUARD_PATH = path.join(ROOT, 'packages', 'validator', 'scripts', 'check-pack.js');
const PACK_GUARD = require(PACK_GUARD_PATH);
const { listFiles, PackageManager } = require('@vscode/vsce');
const {
  auditWorkflowVsixOrder,
  findPackageScriptPublishCallers,
} = require('../scripts/audit.js');

const tmp = prefix => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
const hasCli = cmd => spawnSync(cmd, ['-v'], { stdio: 'ignore' }).status === 0 ||
  spawnSync(cmd, ['-h'], { stdio: 'ignore' }).status === 0;
const run = (script, args, options = {}) => spawnSync(process.execPath, [script, ...args], {
  encoding: 'utf8',
  ...options,
});

/** A VSIX listing that satisfies every required-file and allowlist rule. */
function buildVsix(dir, extraEntries, root = ROOT) {
  const tsJs = d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
    .map(f => f.replace(/\.ts$/, '.js'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
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

test('verify-vsix: an iCloud conflict-copy build is rejected before extraction', (t) => {
  if (!hasCli('zip') || !hasCli('unzip')) {
    assert.ok(!process.env.CI, 'zip/unzip are missing in CI — the VSIX guard would go untested');
    t.skip('zip/unzip not installed');
    return;
  }
  const dir = tmp('vsix-conflict-');
  try {
    const bad = run(VERIFY, [buildVsix(dir, ['extension/dist/src/extension 2.js'])]);
    assert.strictEqual(bad.status, 1, bad.stdout + bad.stderr);
    assert.match(bad.stderr, /unexpected file in VSIX .*extension\/dist\/src\/extension 2\.js/);
    assert.match(bad.stderr, /not extracted/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify-vsix: a conflict-copy TypeScript source cannot whitelist its compiled JavaScript', (t) => {
  if (!hasCli('zip') || !hasCli('unzip')) {
    assert.ok(!process.env.CI, 'zip/unzip are missing in CI — the VSIX guard would go untested');
    t.skip('zip/unzip not installed');
    return;
  }
  const dir = tmp('vsix-source-conflict-');
  try {
    for (const rel of ['scripts', 'src', 'v6', 'packages/validator/src', 'packages/validator/data']) {
      fs.mkdirSync(path.join(dir, rel), { recursive: true });
    }
    fs.copyFileSync(VERIFY, path.join(dir, 'scripts/verify-vsix.js'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ main: './dist/src/extension.js' }));
    fs.writeFileSync(path.join(dir, 'src/extension.ts'), '');
    fs.writeFileSync(path.join(dir, 'src/extension 2.ts'), '');

    const bad = run(path.join(dir, 'scripts/verify-vsix.js'), [
      buildVsix(dir, ['extension/dist/src/extension 2.js'], dir),
    ]);
    assert.strictEqual(bad.status, 1, bad.stdout + bad.stderr);
    assert.match(bad.stderr, /unexpected file in VSIX .*extension\/dist\/src\/extension 2\.js/);
    assert.match(bad.stderr, /not extracted/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verify-vsix: extraction failure still removes its temporary directory', (t) => {
  if (!hasCli('zip') || !hasCli('unzip')) {
    assert.ok(!process.env.CI, 'zip/unzip are missing in CI — the VSIX guard would go untested');
    t.skip('zip/unzip not installed');
    return;
  }
  const dir = tmp('vsix-extract-failure-');
  try {
    const scratch = path.join(dir, 'tmp');
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(scratch);
    fs.mkdirSync(bin);
    const realUnzip = spawnSync('which', ['unzip'], { encoding: 'utf8' }).stdout.trim();
    const injectedUnzip = path.join(bin, 'unzip');
    fs.writeFileSync(injectedUnzip,
      `#!/bin/sh\nif [ "$1" = "-q" ]; then exit 42; fi\nexec "${realUnzip}" "$@"\n`);
    fs.chmodSync(injectedUnzip, 0o755);

    const failed = run(VERIFY, [buildVsix(dir, [])], {
      env: {
        ...process.env,
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        TMPDIR: scratch,
      },
    });
    assert.notStrictEqual(failed.status, 0, failed.stdout + failed.stderr);
    assert.deepStrictEqual(
      fs.readdirSync(scratch).filter(name => name.startsWith('verify-vsix-')),
      [],
      'the extraction temp directory leaked after unzip failed'
    );
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

test('vsce-ls --compare-npm: UUID fallback reports the real package file count', async () => {
  const outer = tmp('npm-uuid-count-');
  const dir = path.join(outer, '0f8fad5b-d9cb-469f-a165-70867728950e', 'repo');
  try {
    fs.mkdirSync(path.join(dir, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'uuid-count-fixture', version: '1.0.0', publisher: 'fixture', engines: { vscode: '^1.88.0' },
    }));
    fs.writeFileSync(path.join(dir, '.vscodeignore'), '*.md\n');
    fs.writeFileSync(path.join(dir, 'dist/index.js'), '');

    const expected = await listFiles({ cwd: fs.realpathSync(dir), packageManager: PackageManager.None });
    const compared = JSON.parse(run(VSCE_LS, ['--compare-npm', dir]).stdout);
    assert.deepStrictEqual([compared.onlyNone, compared.onlyNpm], [[], []], JSON.stringify(compared));
    assert.strictEqual(compared.none, expected.length, JSON.stringify({ compared, expected }));
    assert.strictEqual(compared.npm, expected.length, JSON.stringify({ compared, expected }));
  } finally {
    fs.rmSync(outer, { recursive: true, force: true });
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

test('publish workflow audit uses executable steps, rejects bypasses, and binds one VSIX', () => {
  const good = `
jobs:
  publish:
    steps:
      - run: node scripts/verify-vsix.js build/extension-*.vsix
      - run: npx --no-install vsce publish --packagePath build/extension-*.vsix
      - run: npx --yes ovsx@1.2.0 publish build/extension-*.vsix
`;
  assert.deepStrictEqual(auditWorkflowVsixOrder(good, ['vsce publish', 'ovsx publish']), []);

  const commentOnly = `
jobs:
  publish:
    steps:
      # node scripts/verify-vsix.js build/extension-*.vsix
      - run: npx --no-install vsce publish --packagePath build/extension-*.vsix
`;
  assert.match(auditWorkflowVsixOrder(commentOnly, ['vsce publish']).join('\n'), /no executable verify-vsix step/);

  const continueOnError = good.replace(
    '- run: node scripts/verify-vsix.js build/extension-*.vsix',
    '- run: node scripts/verify-vsix.js build/extension-*.vsix\n        continue-on-error: true'
  );
  assert.match(auditWorkflowVsixOrder(continueOnError, ['vsce publish']).join('\n'), /continue-on-error/);

  const swallowed = good.replace(
    'node scripts/verify-vsix.js build/extension-*.vsix',
    'node scripts/verify-vsix.js build/extension-*.vsix || true'
  );
  assert.match(auditWorkflowVsixOrder(swallowed, ['vsce publish']).join('\n'), /\|\| true/);

  const multilineSwallowed = `
jobs:
  publish:
    steps:
      - run: |
          node scripts/verify-vsix.js build/extension-*.vsix ||
            true
      - run: npx --no-install vsce publish --packagePath build/extension-*.vsix
`;
  assert.match(auditWorkflowVsixOrder(multilineSwallowed, ['vsce publish']).join('\n'), /\|\| true/);

  const mismatch = good.replace(
    '--packagePath build/extension-*.vsix',
    '--packagePath build/different-*.vsix'
  );
  assert.match(auditWorkflowVsixOrder(mismatch, ['vsce publish']).join('\n'), /different VSIX/);

  const secondPublish = good.replace(
    'npx --no-install vsce publish --packagePath build/extension-*.vsix',
    'npx --no-install vsce publish --packagePath build/extension-*.vsix\n' +
      '          npx --no-install vsce publish --packagePath build/unverified-*.vsix'
  ).replace(
    '- run: npx --no-install vsce publish --packagePath build/extension-*.vsix',
    '- run: |\n          npx --no-install vsce publish --packagePath build/extension-*.vsix'
  );
  assert.match(auditWorkflowVsixOrder(secondPublish, ['vsce publish']).join('\n'), /different VSIX/);

  const skipped = good.replace(
    '- run: node scripts/verify-vsix.js build/extension-*.vsix',
    '- if: ${{ false }}\n        run: node scripts/verify-vsix.js build/extension-*.vsix'
  );
  assert.match(auditWorkflowVsixOrder(skipped, ['vsce publish']).join('\n'), /conditional and may be skipped/);

  const wrongOrder = good.replace(
    '      - run: node scripts/verify-vsix.js build/extension-*.vsix\n' +
      '      - run: npx --no-install vsce publish --packagePath build/extension-*.vsix',
    '      - run: npx --no-install vsce publish --packagePath build/extension-*.vsix\n' +
      '      - run: node scripts/verify-vsix.js build/extension-*.vsix'
  );
  assert.match(auditWorkflowVsixOrder(wrongOrder, ['vsce publish']).join('\n'), /before verify-vsix/);
});

test('repository tag workflows verify the exact VSIX they publish or upload', () => {
  const publish = fs.readFileSync(path.join(ROOT, '.github/workflows/publish.yml'), 'utf8');
  const release = fs.readFileSync(path.join(ROOT, '.github/workflows/release.yml'), 'utf8');
  assert.deepStrictEqual(auditWorkflowVsixOrder(publish, ['vsce publish', 'ovsx publish']), []);
  assert.deepStrictEqual(auditWorkflowVsixOrder(release, ['action-gh-release']), []);
});

test('publish workflow pins ovsx and keeps OVSX_PAT off the command line', () => {
  const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/publish.yml'), 'utf8');
  assert.match(workflow, /npx --yes ovsx@1\.2\.0 publish/);
  assert.match(workflow, /env:\n\s+OVSX_PAT: \$\{\{ secrets\.OVSX_PAT \}\}/);
  assert.doesNotMatch(workflow, /ovsx[^\n]*\s(?:-p|--pat)(?:\s|=)/);
});

test('diff-diagnostics reserves exit 2 for usage errors', () => {
  const missing = run(DIFF_DIAGNOSTICS, []);
  assert.strictEqual(missing.status, 2, missing.stdout + missing.stderr);
  assert.match(missing.stderr, /usage:/);

  const optionLike = run(DIFF_DIAGNOSTICS, ['--against', '--not-a-ref']);
  assert.strictEqual(optionLike.status, 2, optionLike.stdout + optionLike.stderr);
  assert.match(optionLike.stderr, /must not start with '-'/);
});

test('diff-diagnostics exits 3 with a clear message when git archive fails', () => {
  const failed = run(DIFF_DIAGNOSTICS, ['--against', 'refs/heads/issue-62-ref-does-not-exist']);
  assert.strictEqual(failed.status, 3, failed.stdout + failed.stderr);
  assert.match(failed.stderr, /diff-diagnostics: git archive failed/);
});
