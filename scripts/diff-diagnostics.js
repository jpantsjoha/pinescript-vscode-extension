#!/usr/bin/env node
/**
 * Release gate: compare the diagnostics of every .pine file in this checkout
 * (test/ and the gitignored examples/) between a previous release and the
 * current build.
 *
 *   node scripts/diff-diagnostics.js --against v0.6.5
 *
 * The ref is exported with `git archive` into a temp dir, installed with
 * `npm ci` and built. Both layouts are supported: the pre-0.7.0 one
 * (dist/src/parser + the npm engine for semantic checks) and the single
 * engine (dist/engine). The current tree must already be built.
 *
 * Every NEW or GONE diagnostic is printed; the exit code is 1 when there are
 * any, so an intended change (a new rule) is reviewed line by line rather
 * than waved through. Needs network for `npm ci` of the old ref.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const refIndex = process.argv.indexOf('--against');
const ref = refIndex > 0 ? process.argv[refIndex + 1] : null;
if (!ref) {
  console.error('usage: node scripts/diff-diagnostics.js --against <git-ref>');
  process.exit(2);
}

function loadSources(root) {
  // Pre-0.7.0 builds shipped the syntactic validator from dist/src/parser and
  // took only the semantic checks from the bundled npm engine (which also
  // contains an older accurateValidator). Check that layout first, or the
  // baseline would be the npm copy rather than what the editor ran.
  const parser = path.join(root, 'dist/src/parser');
  if (fs.existsSync(path.join(parser, 'accurateValidator.js'))) {
    const { AccurateValidator } = require(path.join(parser, 'accurateValidator.js'));
    const { runDocumentChecks } = require(path.join(parser, 'documentChecks.js'));
    const e = require(path.join(root, 'node_modules/pinescript-v6-validator'));
    return { A: AccurateValidator, D: runDocumentChecks, S: e.validatePineScript };
  }
  const e = require(path.join(root, 'dist/engine/index.js'));
  return { A: e.AccurateValidator, D: e.runDocumentChecks, S: e.validatePineScript };
}

function diagnose(src, s) {
  return [
    ...new s.A().validate(src),
    ...s.D(src),
    ...s.S(src).filter(d => d.checkId),
  ].map(d => `${d.line}:${d.column}|${d.severity}|${d.checkId || ''}|${d.message}`);
}

function pineFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) pineFiles(p, out);
    else if (entry.name.endsWith('.pine')) out.push(p);
  }
  return out;
}

if (!fs.existsSync(path.join(ROOT, 'dist/engine/index.js'))) {
  console.error('Build the current tree first: npm run build');
  process.exit(2);
}

const tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'pine-diff-'));
try {
  const tar = execFileSync('git', ['archive', ref], { cwd: ROOT, maxBuffer: 1 << 30 });
  execFileSync('tar', ['-x', '-C', tmp], { input: tar });
  execFileSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: tmp, stdio: 'ignore' });
  execFileSync('npm', ['run', 'build'], { cwd: tmp, stdio: 'ignore' });

  const before = loadSources(tmp);
  const after = loadSources(ROOT);
  const files = [...pineFiles(path.join(ROOT, 'test')), ...pineFiles(path.join(ROOT, 'examples'))];
  let total = 0, added = 0, gone = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const o = diagnose(src, before), n = diagnose(src, after);
    total += n.length;
    const rel = path.relative(ROOT, file);
    for (const d of n.filter(x => !o.includes(x))) { added++; console.log(`NEW  ${rel} ${d}`); }
    for (const d of o.filter(x => !n.includes(x))) { gone++; console.log(`GONE ${rel} ${d}`); }
  }
  console.log(`diff-diagnostics vs ${ref}: files ${files.length} · diagnostics ${total} · new ${added} · gone ${gone}`);
  process.exitCode = added || gone ? 1 : 0;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
