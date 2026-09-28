/**
 * npm is spawned in exactly one way (#67, release review rounds 1-3).
 *
 * Three review rounds each found an npm call that trusted ambient configuration: a
 * working-tree .npmrc, an unpinned registry, an inspection `npm ci` inheriting the
 * shell's npm_config_*. So the defect is closed as a SHAPE, not a call site:
 *
 *   1. packages/validator/scripts/npm-clean.js (re-exported as scripts/lib/npm.js) and
 *      its shell twin scripts/lib/npm-clean.sh are the only code that runs npm;
 *   2. this test scans every script and release test and FAILS on any other npm or
 *      npx spawn;
 *   3. the helpers are proved to ignore an injected registry and userconfig, pin
 *      --registry on the command line, and refuse to run inside iCloud.
 *
 * Offline and deterministic: the shell helper is driven against a fake `npm` that
 * prints what it was given.
 */
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const N = require('../scripts/lib/npm');
const { buildArtefacts } = require('../scripts/inspect-artefacts.js');
const checkPack = require('../packages/validator/scripts/check-pack.js');

const tmp = prefix => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
const EVIL = 'https://evil.example/';

//────────────────────────────────────────────────────────
// The scanner
//────────────────────────────────────────────────────────

/** The helpers themselves: the only files allowed to run npm directly. */
const HELPERS = new Set(['packages/validator/scripts/npm-clean.js', 'scripts/lib/npm-clean.sh']);

function scannedFiles() {
  const pick = (dir, re) => (fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir)) : [])
    .filter(f => re.test(f)).map(f => `${dir}/${f}`);
  return [
    ...pick('scripts', /\.(js|sh)$/),
    ...pick('scripts/lib', /\.(js|sh)$/),
    ...pick('packages/validator/scripts', /\.js$/),
    'test/npm-package.test.js', 'test/release-guards.test.js', 'test/npm-guard.test.js',
  ].filter(f => !HELPERS.has(f));
}

// A process-spawning call whose program is npm/npx, a command string starting with
// npm/npx, or npx named as a program anywhere.
const JS_RULES = [
  /\b(?:spawn|spawnSync|execFile|execFileSync|exec|execSync|fork|sh|run)\s*\(\s*['"`](?:npm|npx)['"`]/,
  /\b(?:spawn|spawnSync|exec|execSync)\s*\(\s*['"`]\s*(?:npm|npx)\s/,
  /['"`]npx['"`]/,
];
// A shell command position (line start, after ; & | ( { $( ` then/do/else/exec/env
// assignments) holding npm or npx. `npm_clean` does not match.
const SH_RULE = /(?:^|[;&|({]\s*|\$\(\s*|`\s*|\b(?:then|do|else|exec|time|command)\s+|\benv\s+(?:-\S+\s+|\S+=\S*\s+)*)(?:npm|npx)(?=\s|$|\))/;

/** Offending lines in one file's text: [{ line, text }]. */
function scan(file, text) {
  const out = [];
  const lines = text.split('\n');
  const isSh = file.endsWith('.sh');
  lines.forEach((raw, i) => {
    let code = raw;
    if (isSh) {
      if (/^\s*#/.test(code)) return;
      code = code.replace(/'[^']*'/g, "''").replace(/\s#.*$/, '');
      if (SH_RULE.test(code)) out.push({ line: i + 1, text: raw.trim() });
    } else {
      if (/^\s*(\*|\/\/|\/\*)/.test(code)) return;
      code = code.replace(/\/\/.*$/, '');
      if (JS_RULES.some(re => re.test(code))) out.push({ line: i + 1, text: raw.trim() });
    }
  });
  return out;
}

describe('npm is spawned only through the helpers', () => {
  test('no script or release test spawns npm or npx directly', () => {
    const offenders = [];
    for (const file of scannedFiles()) {
      for (const hit of scan(file, fs.readFileSync(path.join(ROOT, file), 'utf8'))) {
        offenders.push(`${file}:${hit.line}: ${hit.text}`);
      }
    }
    assert.deepStrictEqual(offenders, [],
      'spawn npm only through scripts/lib/npm.js (npm-clean.js) or npm_clean (scripts/lib/npm-clean.sh)');
  });

  test('the scan covers the release scripts and the helpers exist', () => {
    const files = scannedFiles();
    for (const f of ['scripts/publish-engine.sh', 'scripts/inspect-artefacts.js', 'scripts/verify-published.js',
      'scripts/engine-tarball-smoke.js', 'scripts/diff-diagnostics.js', 'packages/validator/scripts/check-pack.js',
      'test/npm-package.test.js', 'scripts/install-dev.sh', 'scripts/reload.sh']) {
      assert.ok(files.includes(f), `${f} must be scanned`);
    }
    for (const h of HELPERS) assert.ok(fs.existsSync(path.join(ROOT, h)), `${h} missing`);
  });

  test('the scanner bites: raw spawns are caught, helper calls and prose are not', () => {
    const q = s => s.replace(/Q/g, "'");
    const bad = [
      ['x.js', q("execFileSync(QnpmQ, [QciQ]);")],
      ['x.js', q("const out = spawnSync(QnpmQ, [QpackQ], {});")],
      ['x.js', q("deps.sh(QnpmQ, [QpackQ], { cwd });")],
      ['x.js', q("run(QnpmQ, [QinstallQ], dir);")],
      ['x.js', 'execSync(`N view x`);'.replace('N', 'npm')],
      ['x.js', q("spawn(QnpxQ, [QvsceQ]);")],
      ['x.sh', 'npm ci --ignore-scripts'],
      ['x.sh', '(cd "$PKG" && npm pack)'],
      ['x.sh', 'V="$(npm --version)"'],
      ['x.sh', 'if true; then npm publish x.tgz; fi'],
      ['x.sh', 'env FOO=1 npm install'],
      ['x.sh', 'npx vsce package'],
    ];
    for (const [f, line] of bad) assert.strictEqual(scan(f, line).length, 1, `not caught: ${line}`);
    const good = [
      ['x.js', q("npm([QciQ, Q--ignore-scriptsQ], { cwd: root });")],
      ['x.js', q("A.listArchive(QnpmQ, tgz);")],
      ['x.js', q("console.error(Qrun: npm run buildQ);")],
      ['x.js', '// execFileSync(\'npm\', [\'ci\']) in a comment'],
      ['x.sh', 'npm_clean ci --ignore-scripts'],
      ['x.sh', '(cd "$PKG" && npm_clean pack --silent)'],
      ['x.sh', 'echo "   - Changes to source code require: npm run build"'],
      ['x.sh', "printf '%s\\n' '  npm publish <tarball>'"],
      ['x.sh', '# npm ci in a comment'],
    ];
    for (const [f, line] of good) assert.deepStrictEqual(scan(f, line), [], `false positive: ${line}`);
  });
});

//────────────────────────────────────────────────────────
// The helpers ignore ambient configuration
//────────────────────────────────────────────────────────

describe('the JS helper ignores an injected registry and userconfig', () => {
  const polluted = () => ({
    ...process.env,
    npm_config_registry: EVIL,
    npm_config_userconfig: '/tmp/x',
    NPM_CONFIG_GLOBALCONFIG: '/tmp/evil-global',
    npm_config__authtoken: 'leak',
  });

  test('registry commands: sanitised env, --registry pinned, caller --registry replaced', () => {
    const cwd = tmp('npm-guard-js-');
    for (const args of [['ci'], ['pack', '--dry-run'], ['publish', 'x.tgz', '--registry', EVIL], ['view', 'x', `--registry=${EVIL}`]]) {
      const inv = N.npmInvocation(args, { cwd, env: polluted() });
      assert.strictEqual(inv.file, 'npm');
      const joined = inv.args.join(' ');
      assert.ok(!joined.includes('evil'), joined);
      assert.deepStrictEqual(inv.args.slice(-2), ['--registry', 'https://registry.npmjs.org/'], joined);
      assert.strictEqual(inv.args.filter(a => a === '--registry').length, 1, joined);
      assert.strictEqual(inv.options.env.npm_config_registry, 'https://registry.npmjs.org/');
      assert.strictEqual(inv.options.env.npm_config_userconfig, path.join(os.homedir(), '.npmrc'));
      assert.strictEqual(inv.options.env.npm_config_globalconfig, '/dev/null');
      assert.ok(!('NPM_CONFIG_GLOBALCONFIG' in inv.options.env) && !('npm_config__authtoken' in inv.options.env));
      assert.ok(!Object.values(inv.options.env).some(v => String(v).includes('evil') || v === '/tmp/x' || v === 'leak'));
      assert.strictEqual(inv.options.cwd, cwd);
    }
  });

  test('local commands are not given a registry; inherited config is still dropped', () => {
    const inv = N.npmInvocation(['run', 'build'], { cwd: tmp('npm-guard-run-'), env: polluted() });
    assert.deepStrictEqual(inv.args, ['run', 'build']);
    assert.strictEqual(inv.options.env.npm_config_userconfig, path.join(os.homedir(), '.npmrc'));
  });

  test('inside iCloud: refused, except npm run', () => {
    const dir = path.join(tmp('npm-guard-icloud-'), 'Mobile Documents', 'repo');
    fs.mkdirSync(dir, { recursive: true });
    assert.throws(() => N.npmInvocation(['pack'], { cwd: dir }), /npm pack refused: .*inside iCloud/);
    assert.throws(() => N.npmInvocation(['ci'], { cwd: dir }), /inside iCloud/);
    assert.doesNotThrow(() => N.npmInvocation(['run', 'build'], { cwd: dir }));
  });
});

describe('the shell helper ignores an injected registry and userconfig', () => {
  const fakeNpmDir = () => {
    const bin = tmp('npm-guard-bin-');
    fs.writeFileSync(path.join(bin, 'npm'),
      '#!/bin/sh\nfor a in "$@"; do printf \'ARG %s\\n\' "$a"; done\nenv | grep -i \'^npm_config_\' | sort | sed \'s/^/ENV /\'\n',
      { mode: 0o755 });
    return bin;
  };
  const runHelper = (cwd, npmArgs) => spawnSync('/bin/bash', ['-c',
    `set -euo pipefail; source "$HELPER"; cd "$DIR"; npm_clean ${npmArgs}`], {
    encoding: 'utf8',
    env: {
      PATH: `${fakeNpmDir()}:/usr/bin:/bin`, HOME: os.homedir(),
      HELPER: path.join(ROOT, 'scripts', 'lib', 'npm-clean.sh'), DIR: cwd,
      npm_config_registry: EVIL, npm_config_userconfig: '/tmp/x', NPM_CONFIG_GLOBALCONFIG: '/tmp/evil-global',
    },
  });

  test('registry command: inherited config dropped, --registry pinned, caller --registry replaced', () => {
    const r = runHelper(tmp('npm-guard-sh-'), `publish x.tgz --registry ${EVIL}`);
    assert.strictEqual(r.status, 0, r.stderr);
    const args = r.stdout.split('\n').filter(l => l.startsWith('ARG ')).map(l => l.slice(4));
    const env = r.stdout.split('\n').filter(l => l.startsWith('ENV ')).map(l => l.slice(4));
    assert.deepStrictEqual(args, ['publish', 'x.tgz', '--registry', 'https://registry.npmjs.org/']);
    assert.ok(env.includes('npm_config_registry=https://registry.npmjs.org/'), env.join('\n'));
    assert.ok(env.includes(`npm_config_userconfig=${path.join(os.homedir(), '.npmrc')}`), env.join('\n'));
    assert.ok(env.includes('npm_config_globalconfig=/dev/null'), env.join('\n'));
    assert.ok(!env.some(l => /evil|=\/tmp\/x$|NPM_CONFIG_GLOBALCONFIG/.test(l)), env.join('\n'));
  });

  test('inside iCloud: refused before npm runs, except npm run', () => {
    const dir = path.join(tmp('npm-guard-sh-icloud-'), 'Mobile Documents', 'repo');
    fs.mkdirSync(dir, { recursive: true });
    const r = runHelper(dir, 'pack');
    assert.notStrictEqual(r.status, 0);
    assert.match(r.stderr, /npm pack refused: .*inside iCloud/);
    assert.ok(!r.stdout.includes('ARG '), 'npm must not have been run');
    assert.strictEqual(runHelper(dir, 'run build').status, 0);
  });
});

describe('call sites use the helper (round 3 item 1: the inspection build)', () => {
  test('buildArtefacts: npm ci / run build / pack via the helper, vsce with the sanitised env', () => {
    const root = tmp('npm-guard-build-');
    fs.mkdirSync(path.join(root, 'build'), { recursive: true });
    fs.writeFileSync(path.join(root, 'build', 'x-1.0.0.vsix'), 'z');
    const npmCalls = [];
    const shCalls = [];
    process.env.npm_config_registry = EVIL;
    try {
      buildArtefacts(root,
        (cmd, args, opts) => { shCalls.push({ cmd, args, opts }); return ''; },
        (args, opts) => { npmCalls.push(N.npmInvocation(args, opts)); return 'e-1.0.0.tgz\n'; });
    } finally {
      delete process.env.npm_config_registry;
    }
    assert.deepStrictEqual(npmCalls.map(c => c.args[0]), ['ci', 'run', 'pack']);
    for (const c of npmCalls.filter(c => c.args[0] !== 'run')) {
      assert.deepStrictEqual(c.args.slice(-2), ['--registry', 'https://registry.npmjs.org/']);
    }
    for (const c of npmCalls) assert.strictEqual(c.options.env.npm_config_registry, 'https://registry.npmjs.org/');
    assert.strictEqual(shCalls.length, 1);
    assert.match(shCalls[0].cmd, /vsce$/);
    assert.strictEqual(shCalls[0].opts.env.npm_config_registry, 'https://registry.npmjs.org/');
  });
});

describe('round 3 LOW items', () => {
  test('check-pack: a files literal with ".." is refused ("dist/../docs")', () => {
    const dir = tmp('npm-guard-files-');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0', files: ['dist/../docs', './dist/'] }));
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({ include: ['src/**/*.ts'], compilerOptions: { outDir: 'dist' } }));
    const { problems } = checkPack.expectedFiles(dir);
    assert.ok(problems.some(p => p.includes('files entry "dist/../docs" is not modelled')), problems.join('\n'));
    assert.ok(!problems.some(p => p.includes('"./dist/"')), problems.join('\n'));
  });

  test('check-pack with no argument targets packages/validator, whatever the working directory', () => {
    const cwd = tmp('npm-guard-cwd-');
    fs.writeFileSync(path.join(cwd, 'tsconfig.json'), JSON.stringify({ exclude: ['x'] })); // would fail if read
    const r = spawnSync(process.execPath, [path.join(ROOT, 'packages', 'validator', 'scripts', 'check-pack.js')],
      { cwd, encoding: 'utf8' });
    const out = r.stdout + r.stderr;
    assert.doesNotMatch(out, /tsconfig "exclude" is not modelled/);
    // Built tree outside iCloud: an exact PASS. Inside an iCloud checkout the helper
    // refuses to pack — naming packages/validator, which is the point of this test.
    assert.ok((r.status === 0 && /PASS — npm pack --dry-run: 25 files/.test(out)) ||
      /packages\/validator is inside iCloud/.test(out), out);
  });

  test('publish-engine.sh --help writes no temporary file (no heredoc) and exits 0', () => {
    const text = fs.readFileSync(path.join(ROOT, 'scripts', 'publish-engine.sh'), 'utf8');
    assert.doesNotMatch(text.replace(/'[^']*'/g, "''"), /<</, 'a heredoc makes bash write a temporary file');
    const tmpdir = tmp('npm-guard-help-tmp-');
    const cwd = tmp('npm-guard-help-cwd-');
    const r = spawnSync('/bin/bash', [path.join(ROOT, 'scripts', 'publish-engine.sh'), '--help'],
      { cwd, encoding: 'utf8', env: { PATH: '/nonexistent', TMPDIR: tmpdir } });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /Release sequence: merge -> git fetch/);
    assert.deepStrictEqual([fs.readdirSync(tmpdir), fs.readdirSync(cwd)], [[], []]);
  });
});
