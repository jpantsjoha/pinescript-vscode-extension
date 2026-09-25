#!/usr/bin/env node
/**
 * Packaged-VSIX gate: prove the artefact users install, not the source tree.
 *
 *   node scripts/verify-vsix.js <file.vsix>
 *
 * 1. Reads the archive listing BEFORE extracting: rejects absolute, `..`, backslash
 *    and symlink entries; asserts the one engine ships (dist/engine/index.js, every
 *    packages/validator/src module as dist/engine/src/*.js, every data file as
 *    dist/engine/data/*.js); rejects a second engine in any layout
 *    (extension/packages/**, node_modules/pinescript-v6-validator, or any file named
 *    like an engine module outside extension/dist/engine/).
 * 2. Extracts it, executes the packaged entry point's activate() with a stubbed
 *    `vscode` module, and drives the diagnostics through onDidOpenTextDocument:
 *    valid code must be silent, `color.purplee` must be an error.
 *
 * Never skips: a missing or unreadable VSIX is a failure. CI runs it after
 * `npm run package` (.github/workflows/ci.yml, package job).
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const vsix = process.argv[2];
const failures = [];
const fail = msg => failures.push(msg);

if (!vsix || !fs.existsSync(vsix)) {
  console.error(`verify-vsix: no VSIX at ${vsix || '(none given)'}`);
  process.exit(1);
}

// ── 1. Entries (read from the archive listing, BEFORE anything is extracted) ──
const entries = execFileSync('unzip', ['-Z1', vsix], { encoding: 'utf8' })
  .split('\n').filter(line => line.length);
// The long listing carries each entry's Unix mode; same order as -Z1.
const modes = execFileSync('unzip', ['-Z', vsix], { encoding: 'utf8' })
  .split('\n').filter(line => /^[-dlbcps?][-rwxsStT?]{9}\s/.test(line)).map(line => line[0]);
if (modes.length !== entries.length) {
  fail(`archive listing is inconsistent (${entries.length} names, ${modes.length} modes) — refusing to extract`);
}

// Unsafe paths: absolute, drive-letter, backslash, `..` segments, symlinks.
const unsafe = entries.filter((e, i) =>
  e.startsWith('/') || /^[A-Za-z]:/.test(e) || e.includes('\\') ||
  e.split('/').some(seg => seg === '..') || modes[i] === 'l');
for (const e of unsafe) fail(`unsafe archive entry (absolute, traversal, backslash or symlink): ${JSON.stringify(e)}`);

const has = p => entries.includes(`extension/${p}`);
const modules = dir => fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.ts')).map(f => f.replace(/\.ts$/, '.js'));

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const main = manifest.main.replace(/^\.\//, '');
const required = [
  main,
  'dist/engine/index.js',
  ...modules('packages/validator/src').map(f => `dist/engine/src/${f}`),
  ...modules('packages/validator/data').map(f => `dist/engine/data/${f}`),
];
for (const p of required) if (!has(p)) fail(`missing from VSIX: ${p}`);

// A second engine, in any layout: the package tree itself, the npm package, or any
// file named like an engine module (.js or .ts) outside extension/dist/engine/.
const engineBasenames = new Set(
  [...modules('packages/validator/src'), ...modules('packages/validator/data')]
    .flatMap(f => [f, f.replace(/\.js$/, '.ts'), f.replace(/\.js$/, '.d.ts')]));
const duplicates = entries.filter(e =>
  /^extension\/packages\//.test(e) ||
  /(^|\/)node_modules\/pinescript-v6-validator\//.test(e) ||
  (!e.startsWith('extension/dist/engine/') &&
    (engineBasenames.has(path.posix.basename(e)) || /(^|\/)parameter-requirements[^/]*\.js$/.test(e))));
for (const d of duplicates) fail(`second engine copy ships: ${d}`);

if (unsafe.length || modes.length !== entries.length) {
  console.error(`verify-vsix: FAIL\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}

console.log(`verify-vsix: ${entries.length} entries; ${required.length} required runtime files checked`);

// ── 2. Execute the packaged entry point ──────────────────────────────────────
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'verify-vsix-')));
execFileSync('unzip', ['-q', vsix, '-d', dir]);
const extDir = path.join(dir, 'extension');

const handlers = [];
const published = new Map();
const any = () => new Proxy(function () {}, {
  get: (_t, k) => (k === 'then' ? undefined : any()), apply: () => any(), construct: () => any(),
});
class Position {
  constructor(l, c) { this.line = l; this.character = c; }
  translate(dl, dc) { return new Position(this.line + dl, this.character + dc); }
}
class Range { constructor(a, b) { this.start = a; this.end = b; } }
class Diagnostic { constructor(range, message, severity) { Object.assign(this, { range, message, severity }); } }
const withFallback = obj => new Proxy(obj, { get: (t, k) => (k in t ? t[k] : any()) });
const vscode = withFallback({
  Position, Range, Diagnostic,
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  ConfigurationTarget: { Global: 1, Workspace: 2 },
  workspace: withFallback({
    getConfiguration: () => ({ get: (k, d) => (k === 'pine.applyFileAssociation' ? false : d), update: () => Promise.resolve() }),
    onDidOpenTextDocument: fn => { handlers.push(fn); return { dispose() {} }; },
    onDidChangeTextDocument: () => ({ dispose() {} }),
    onDidCloseTextDocument: () => ({ dispose() {} }),
    textDocuments: [],
  }),
  languages: new Proxy({
    createDiagnosticCollection: () => ({ set: (uri, d) => published.set(String(uri), d), delete() {}, clear() {}, dispose() {} }),
  }, { get: (t, k) => (k in t ? t[k] : () => ({ dispose() {} })) }),
});

const originalLoad = Module._load;
Module._load = function (request) {
  return request === 'vscode' ? vscode : originalLoad.apply(this, arguments);
};

try {
  const ext = require(path.join(extDir, main));
  ext.activate({ subscriptions: [], extensionPath: extDir, globalState: { get() {}, update() {} }, workspaceState: { get() {}, update() {} } });
  if (!handlers.length) fail('activate() registered no onDidOpenTextDocument handler');

  // Every module the packaged code loaded must come from inside the extracted VSIX.
  const leaked = Object.keys(require.cache).filter(f => f !== __filename && !f.startsWith(dir + path.sep));
  for (const f of leaked) fail(`packaged code loaded a module from outside the VSIX: ${f}`);

  const diagnose = (name, text) => {
    const uri = { toString: () => `file:///${name}` };
    const log = console.log; console.log = () => {};
    try { for (const h of handlers) h({ languageId: 'pine', uri, version: 1, getText: () => text }); }
    finally { console.log = log; }
    return (published.get(uri.toString()) || []).filter(d => d.severity <= 1);
  };

  const valid = diagnose('valid.pine',
    '//@version=6\nindicator("B1")\nseries array<float> xloc = array.from(close)\nplot(xloc.sum())\n');
  if (valid.length) fail(`valid code produced diagnostics: ${valid.map(d => d.message).join(' | ')}`);

  const typo = diagnose('typo.pine', '//@version=6\nindicator("typo")\nplot(close, color=color.purplee)\n');
  if (!typo.some(d => d.severity === 0 && /purplee/.test(d.message))) {
    fail(`color.purplee was not reported as an error (got: ${typo.map(d => d.message).join(' | ') || 'nothing'})`);
  }
  console.log(`verify-vsix: activate() ok; valid → ${valid.length} diagnostics; color.purplee → ${typo.length} error(s)`);
} catch (e) {
  fail(`packaged extension failed to load or activate: ${e.stack || e.message}`);
} finally {
  Module._load = originalLoad;
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`verify-vsix: FAIL\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log('verify-vsix: PASS');
