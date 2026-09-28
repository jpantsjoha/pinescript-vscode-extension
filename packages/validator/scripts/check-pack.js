#!/usr/bin/env node
/**
 * Exact packed-file guard for pinescript-v6-validator (issue #67).
 *
 * The package intentionally contains only compiled JavaScript/declarations plus
 * package.json, README.md and LICENSE. The expected compiled files are derived
 * from index.ts and every TypeScript source under src/ and data/.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CONFLICT_COPY = / \d+\./;

const posix = value => value.split(path.sep).join('/');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walkTypeScript(base, relativeDir) {
  const directory = path.join(base, relativeDir);
  if (!fs.existsSync(directory)) return [];

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = posix(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) files.push(...walkTypeScript(base, relative));
    if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(relative);
    }
  }
  return files;
}

/** Return the exact package contents derived from source files and tsconfig. */
function expectedFiles(packageDir) {
  const tsconfig = readJson(path.join(packageDir, 'tsconfig.json'));
  const options = tsconfig.compilerOptions || {};
  const problems = [];

  if (posix(options.rootDir || '.') !== '.') {
    problems.push(`compilerOptions.rootDir must be "." (found ${JSON.stringify(options.rootDir)})`);
  }
  if (posix(options.outDir || '') !== 'dist') {
    problems.push(`compilerOptions.outDir must be "dist" (found ${JSON.stringify(options.outDir)})`);
  }
  if (options.declaration !== true) {
    problems.push('compilerOptions.declaration must remain true');
  }
  for (const option of ['outFile', 'declarationDir', 'emitDeclarationOnly', 'noEmit']) {
    if (options[option]) problems.push(`compilerOptions.${option} is not supported by the package guard`);
  }

  const sources = [
    ...(fs.existsSync(path.join(packageDir, 'index.ts')) ? ['index.ts'] : []),
    ...walkTypeScript(packageDir, 'src'),
    ...walkTypeScript(packageDir, 'data'),
  ].sort();

  if (!sources.includes('index.ts')) problems.push('index.ts is missing');
  for (const source of sources) {
    if (CONFLICT_COPY.test(source)) problems.push(`source looks like a sync-conflict copy: ${source}`);
  }

  const compiled = [];
  for (const source of sources) {
    const stem = `dist/${source.replace(/\.ts$/, '')}`;
    compiled.push(`${stem}.js`, `${stem}.d.ts`);
    if (options.sourceMap) compiled.push(`${stem}.js.map`);
    if (options.declarationMap) compiled.push(`${stem}.d.ts.map`);
  }

  const expected = [
    ...compiled,
    'package.json',
    'README.md',
    'LICENSE',
  ].sort();

  if (new Set(expected).size !== expected.length) {
    problems.push('the derived expected set contains duplicate paths');
  }

  return { expected, problems };
}

function parsePackJson(text) {
  const start = text.indexOf('[');
  if (start < 0) throw new Error('npm pack JSON output did not contain an array');
  const result = JSON.parse(text.slice(start));
  if (!Array.isArray(result) || !result[0] || !Array.isArray(result[0].files)) {
    throw new Error('npm pack JSON output did not contain files');
  }
  return result[0].files.map(file => file.path).sort();
}

/** File list npm would pack, with lifecycle scripts disabled to avoid prepack recursion. */
function dryRunFiles(packageDir) {
  const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'pine-check-pack-'));
  try {
    const output = execFileSync('npm', [
      'pack', '--dry-run', '--json', '--ignore-scripts', '--cache', cache,
    ], {
      cwd: packageDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return parsePackJson(output);
  } finally {
    fs.rmSync(cache, { recursive: true, force: true });
  }
}

/** File list inside a built tarball, retaining duplicate archive entries. */
function tarballFiles(tarball) {
  return execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .split('\n')
    .filter(entry => entry && !entry.endsWith('/'))
    .map(entry => entry.startsWith('package/')
      ? entry.slice('package/'.length)
      : `(outside package/) ${entry}`)
    .sort();
}

/** Compare expected and actual paths as multisets. */
function compare(expected, actual, initialProblems = []) {
  const expectedCounts = new Map();
  const actualCounts = new Map();
  for (const file of expected) expectedCounts.set(file, (expectedCounts.get(file) || 0) + 1);
  for (const file of actual) actualCounts.set(file, (actualCounts.get(file) || 0) + 1);

  const extra = [];
  const missing = [];
  for (const [file, count] of actualCounts) {
    for (let i = expectedCounts.get(file) || 0; i < count; i++) extra.push(file);
  }
  for (const [file, count] of expectedCounts) {
    for (let i = actualCounts.get(file) || 0; i < count; i++) missing.push(file);
  }

  const problems = [...initialProblems];
  for (const [file, count] of actualCounts) {
    if (count > 1) problems.push(`duplicate package entry (${count} copies): ${file}`);
    if (CONFLICT_COPY.test(file)) problems.push(`sync-conflict copy in package: ${file}`);
  }

  return { extra: extra.sort(), missing: missing.sort(), problems };
}

function report(label, expected, actual, result) {
  const ok = result.extra.length === 0 && result.missing.length === 0 && result.problems.length === 0;
  const lines = [
    `check-pack: ${ok ? 'PASS' : 'FAIL'} — ${label}`,
    `expected ${expected.length} files:`,
    ...expected.map(file => `  ${file}`),
    `packed ${actual.length} files:`,
    ...actual.map(file => `  ${file}`),
  ];
  for (const file of result.extra) lines.push(`EXTRA   ${file}`);
  for (const file of result.missing) lines.push(`MISSING ${file}`);
  for (const problem of result.problems) lines.push(`PROBLEM ${problem}`);
  return { ok, text: lines.join('\n') };
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log('usage: check-pack.js [package-dir] | --tarball <file.tgz> [package-dir] | --pack-json <file> [package-dir]');
    return 0;
  }

  const tarballAt = argv.indexOf('--tarball');
  const jsonAt = argv.indexOf('--pack-json');
  if (tarballAt !== -1 && jsonAt !== -1) {
    console.error('check-pack: choose only one of --tarball or --pack-json');
    return 1;
  }
  if ((tarballAt !== -1 && !argv[tarballAt + 1]) || (jsonAt !== -1 && !argv[jsonAt + 1])) {
    console.error('check-pack: the selected input option requires a file');
    return 1;
  }

  const consumed = new Set();
  if (tarballAt !== -1) consumed.add(tarballAt + 1);
  if (jsonAt !== -1) consumed.add(jsonAt + 1);
  const packageArg = argv.find((arg, index) => !arg.startsWith('--') && !consumed.has(index));
  const packageDir = path.resolve(packageArg || path.join(__dirname, '..'));
  const { expected, problems } = expectedFiles(packageDir);

  let actual = [];
  let label = 'npm pack --dry-run';
  try {
    if (tarballAt !== -1) {
      actual = tarballFiles(path.resolve(argv[tarballAt + 1]));
      label = path.basename(argv[tarballAt + 1]);
    } else if (jsonAt !== -1) {
      actual = parsePackJson(fs.readFileSync(path.resolve(argv[jsonAt + 1]), 'utf8'));
      label = path.basename(argv[jsonAt + 1]);
    } else if (problems.length === 0) {
      actual = dryRunFiles(packageDir);
    }
  } catch (error) {
    problems.push(error.message);
  }

  const result = compare(expected, actual, problems);
  const output = report(label, expected, actual, result);
  (output.ok ? console.log : console.error)(output.text);
  return output.ok ? 0 : 1;
}

module.exports = {
  CONFLICT_COPY,
  expectedFiles,
  parsePackJson,
  dryRunFiles,
  tarballFiles,
  compare,
  report,
};

if (require.main === module) process.exitCode = main(process.argv.slice(2));
