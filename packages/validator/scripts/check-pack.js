#!/usr/bin/env node
/**
 * Packed-file-list guard for pinescript-v6-validator (issue #67).
 *
 *   node scripts/check-pack.js [package-dir]            # checks `npm pack --dry-run`
 *   node scripts/check-pack.js --tarball <file.tgz>     # checks a built tarball
 *
 * Runs as `prepack`, so `npm pack` and `npm publish` refuse any tarball whose file
 * list is not EXACTLY the expected set. 0.4.2 shipped 47 files instead of 25: `files`
 * says "dist", and a synced folder (iCloud) had left `dist/index 2.js`,
 * `dist/src/accurateValidator 2.js` (a stale validator) and 20 more conflict copies
 * beside the real build. Nothing looked at the list.
 *
 * The expected set is derived, never hand-kept:
 *   - every compiler input matched by tsconfig `include` (src/**, data/**, index.ts),
 *     mapped through rootDir -> outDir to .js, plus .d.ts when `declaration` is set
 *     and .js.map / .d.ts.map when sourceMap / declarationMap are set;
 *   - kept only when a `files` entry covers it;
 *   - plus the files npm always packs: package.json, README*, LICENSE*.
 * Anything extra or missing fails, and both lists are printed.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// A synced folder's conflict copy: "index 2.js", "accurateValidator 2.d.ts".
const CONFLICT_COPY = / \d+(\.[^/]*)?$/;

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch {
    // tsconfig allows comments and trailing commas.
    return JSON.parse(text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:"'])\/\/.*$/gm, '$1')
      .replace(/,(\s*[}\]])/g, '$1'));
  }
}

const posix = p => p.split(path.sep).join('/');

/** Files under `dir` (relative to `base`), recursively. */
function walk(base, dir) {
  const abs = path.join(base, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = posix(path.join(dir, entry.name));
    if (entry.isDirectory()) out.push(...walk(base, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

/** Compiler inputs matched by one tsconfig include pattern (the forms tsc accepts). */
function matchInclude(pkgDir, pattern) {
  const p = pattern.replace(/^\.\//, '');
  if (!/[*?]/.test(p)) return fs.existsSync(path.join(pkgDir, p)) ? [p] : [];
  const firstWild = p.search(/[*?]/);
  const baseDir = p.slice(0, p.lastIndexOf('/', firstWild) + 1).replace(/\/$/, '');
  const re = new RegExp('^' + p
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\u0000/g, '(?:.*/)?') + '$');
  return walk(pkgDir, baseDir || '.').map(f => f.replace(/^\.\//, '')).filter(f => re.test(f));
}

/**
 * The exact tarball contents this package should have, derived from its tsconfig,
 * its sources and its `files` field. Returns { expected, problems }.
 */
function expectedFiles(pkgDir) {
  const manifest = readJson(path.join(pkgDir, 'package.json'));
  const tsconfig = readJson(path.join(pkgDir, 'tsconfig.json'));
  const opts = tsconfig.compilerOptions || {};
  const outDir = posix(path.normalize(opts.outDir || '.')).replace(/\/$/, '');
  const rootDir = posix(path.normalize(opts.rootDir || '.')).replace(/\/$/, '');
  const problems = [];

  // The derivation models only the options this package uses. Anything else changes
  // what tsc emits or npm packs in ways it cannot predict, so it fails loudly rather
  // than guessing (a wrong guess is a false PASS or a false FAIL).
  const unsupportedTs = ['extends', 'files', 'exclude', 'references'].filter(k => k in tsconfig);
  const unsupportedOpts = ['outFile', 'out', 'composite', 'emitDeclarationOnly', 'noEmit', 'declarationDir',
    'rootDirs', 'allowJs', 'checkJs', 'resolveJsonModule', 'tsBuildInfoFile', 'incremental'].filter(k => opts[k]);
  const unsupportedIncludes = (tsconfig.include || []).filter(p =>
    !/\.tsx?$/.test(p) || (/[*?]/.test(p) && !/^([\w.-]+\/)*(\*\*\/)?\*\.tsx?$/.test(p.replace(/^\.\//, ''))));
  const unsupportedFiles = (manifest.files || []).filter(e => /[*?![\]{}]/.test(e));
  for (const k of unsupportedTs) problems.push(`tsconfig "${k}" is not modelled`);
  for (const k of unsupportedOpts) problems.push(`compilerOptions.${k} is not modelled`);
  for (const p of unsupportedIncludes) problems.push(`tsconfig include "${p}" is not modelled (use dir/**/*.ts or a .ts file)`);
  for (const e of unsupportedFiles) problems.push(`package.json files pattern "${e}" is not modelled`);
  if (problems.length) {
    problems.push('update the expected set in packages/validator/scripts/check-pack.js before changing the build');
  }

  const inputs = new Set();
  for (const pattern of tsconfig.include || []) {
    for (const f of matchInclude(pkgDir, pattern)) {
      if (!/\.tsx?$/.test(f) || /\.d\.ts$/.test(f)) continue;
      if (f.startsWith(outDir + '/')) continue;
      inputs.add(f);
    }
  }
  for (const f of inputs) {
    if (CONFLICT_COPY.test(f)) problems.push(`source file looks like a sync-conflict copy: ${f}`);
  }

  const outputs = [];
  for (const f of inputs) {
    const rel = rootDir === '.' ? f : path.posix.relative(rootDir, f);
    const stem = posix(path.posix.join(outDir, rel)).replace(/\.tsx?$/, '');
    outputs.push(`${stem}.js`);
    if (opts.sourceMap) outputs.push(`${stem}.js.map`);
    if (opts.declaration || opts.composite) {
      outputs.push(`${stem}.d.ts`);
      if (opts.declarationMap) outputs.push(`${stem}.d.ts.map`);
    }
  }

  const covers = (entry, file) => {
    const e = entry.replace(/^\.\//, '').replace(/\/$/, '');
    return file === e || file.startsWith(e + '/');
  };
  const listed = manifest.files
    ? outputs.filter(f => manifest.files.some(e => covers(e, f)))
    : outputs;

  // npm packs these whatever `files` says.
  const always = fs.readdirSync(pkgDir).filter(f =>
    f === 'package.json' || /^(readme|license|licence)(\.[^.]+)?$/i.test(f));

  return { expected: [...new Set([...listed, ...always])].sort(), problems };
}

/** File list `npm pack --dry-run` would produce, without running lifecycle scripts. */
function dryRunFiles(pkgDir) {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: pkgDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const json = JSON.parse(out.slice(out.indexOf('[')));
  return json[0].files.map(f => f.path).sort();
}

/**
 * File list inside a built tarball (the `package/` prefix removed). Every entry is
 * kept, duplicates included; an entry outside `package/` keeps its full name, so it
 * can never match the expected set.
 */
function tarballFiles(tarball) {
  return execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .split('\n').filter(l => l && !l.endsWith('/'))
    .map(l => (l.startsWith('package/') ? l.slice('package/'.length) : `(outside package/) ${l}`)).sort();
}

/**
 * Compare as multisets: a path listed twice in the archive is a failure, not a match.
 * Returns { extra, missing, problems } (problems include duplicates and conflict names).
 */
function compare(expected, actual, problems = []) {
  const want = new Set(expected);
  const got = new Set(actual);
  const extra = actual.filter(f => !want.has(f));
  const missing = expected.filter(f => !got.has(f));
  const found = [...problems];
  const seen = new Set();
  for (const f of actual) {
    if (seen.has(f)) found.push(`duplicate entry in the package: ${f}`);
    seen.add(f);
  }
  if (actual.length !== expected.length) found.push(`packed ${actual.length} entries, expected ${expected.length}`);
  for (const f of actual) if (CONFLICT_COPY.test(f)) found.push(`sync-conflict copy in the package: ${f}`);
  return { extra, missing, problems: found };
}

function report(label, expected, actual, result) {
  const ok = !result.extra.length && !result.missing.length && !result.problems.length;
  const lines = [];
  if (!ok) {
    lines.push(`check-pack: FAIL — ${label}`);
    lines.push(`  expected ${expected.length} files:`);
    for (const f of expected) lines.push(`    ${f}`);
    lines.push(`  packed ${actual.length} files:`);
    for (const f of actual) lines.push(`    ${f}`);
    for (const f of result.extra) lines.push(`  EXTRA   ${f}`);
    for (const f of result.missing) lines.push(`  MISSING ${f}`);
    for (const p of result.problems) lines.push(`  PROBLEM ${p}`);
    lines.push('  Rebuild from a clean export (scripts/publish-engine.sh), never the working tree.');
  } else {
    lines.push(`check-pack: PASS — ${label}: ${actual.length} files, exactly the expected set`);
  }
  return { ok, text: lines.join('\n') };
}

function main(argv) {
  const t = argv.indexOf('--tarball');
  const pkgArg = argv.filter((a, i) => !a.startsWith('--') && i !== t + 1)[0];
  const pkgDir = path.resolve(pkgArg || process.cwd());
  const { expected, problems } = expectedFiles(pkgDir);
  let actual;
  let label;
  if (t !== -1) {
    actual = tarballFiles(argv[t + 1]);
    label = path.basename(argv[t + 1]);
  } else {
    actual = dryRunFiles(pkgDir);
    label = 'npm pack --dry-run';
  }
  const { ok, text } = report(label, expected, actual, compare(expected, actual, problems));
  (ok ? console.log : console.error)(text);
  return ok ? 0 : 1;
}

module.exports = { expectedFiles, dryRunFiles, tarballFiles, compare, report, CONFLICT_COPY };

if (require.main === module) process.exit(main(process.argv.slice(2)));
