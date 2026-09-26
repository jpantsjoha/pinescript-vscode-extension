#!/usr/bin/env node
/**
 * Pine v6 validation CLI — single entrypoint for headless / agent use.
 *
 * Runs the same three diagnostic sources the VS Code extension runs, so CLI output
 * matches what the operator sees in-editor: AccurateValidator, the whole-document
 * checks, and the engine's semantic checks (S1-S10).
 *
 * Usage:
 *   node validate-cli.js <file.pine> [more.pine ...]
 *
 * The engine is always the local build in dist/engine (run `npm run build` first).
 * `--local-engine` is accepted for backwards compatibility and changes nothing.
 *
 * Exit code: 0 if no severity-0 errors in any file, 1 if any, 2 on a tooling failure.
 */
'use strict';
const fs = require('fs');

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
};
const paint = (t, col) => `${col}${t}${c.reset}`;

function loadValidators() {
  const out = {};
  // ONE engine for all three diagnostic sources: dist/engine, the local build of
  // packages/validator that the build copies next to dist/src and that ships in the
  // VSIX (issue #55). The CLI therefore prints exactly what the editor shows.
  //
  // It used to take its semantic checks from the PUBLISHED npm package by default,
  // so a fix in packages/validator/src stayed invisible here until a release; the
  // S1 positional-lookahead fix was green in `npm test` while this CLI kept printing
  // the old warnings. `--local-engine` / PINE_ENGINE=local selected the working tree;
  // local is now the only mode and the flag is accepted and ignored.
  let eng;
  try { eng = require('./dist/engine/index.js'); }
  catch (e) { out.accurateErr = e.message; return out; }
  const pkg = require('./packages/validator/package.json');
  out.engineLabel = `engine ${pkg.version} (local build: dist/engine from packages/validator)`;
  out.accurate = new eng.AccurateValidator();
  // The editor emits diagnostics from the validator AND the whole-document
  // heuristics. A CLI that ran only the first reported "0 errors" on files the
  // editor covered in squiggles, so both run here.
  out.documentChecks = { validate: eng.runDocumentChecks };
  // Semantic checks (S1-S10), with the same suppressions the editor applies.
  out.semanticChecks = {
    validate: (code) => eng.applySuppressions(eng.runSemanticChecks(code), eng.extractSuppressions(code))
  };
  return out;
}

function run(validator, code) {
  // Both validators expose .validate(code) -> [{line, column?, message, severity}]
  // Guard: a validator that throws
  // must not abort the whole CLI — surface it as a single synthetic error.
  try {
    const errs = validator.validate(code);
    return Array.isArray(errs) ? errs : [];
  } catch (e) {
    return [{ line: 0, message: `validator crashed: ${e.message}`, severity: 0 }];
  }
}

function printErrors(label, errors) {
  const bySev = { 0: [], 1: [], 2: [] };
  for (const e of errors) (bySev[e.severity] || bySev[2]).push(e);
  const sevName = { 0: paint('ERROR', c.red), 1: paint('WARN', c.yellow), 2: paint('INFO', c.dim) };
  console.log(`  ${paint(label, c.bold)}: ${errors.length} issue(s) ` +
    `(${bySev[0].length} error, ${bySev[1].length} warn, ${bySev[2].length} info)`);
  for (const sev of [0, 1, 2]) {
    for (const e of bySev[sev]) {
      const loc = `L${e.line}${e.column != null ? ':' + e.column : ''}`;
      console.log(`    ${sevName[sev]} ${paint(loc, c.cyan)}  ${e.message}`);
    }
  }
  return bySev[0].length;
}

function main() {
  const args = process.argv.slice(2);
  const files = args.filter(a => !a.startsWith('--'));
  if (files.length === 0) {
    console.error('Usage: node validate-cli.js <file.pine> ...');
    process.exit(2);
  }
  const v = loadValidators();
  if (!v.accurate) { console.error('Engine load failed:', v.accurateErr, '\nRun: npm run build'); process.exit(2); }
  console.log(paint(v.engineLabel, c.dim));

  let totalErrors = 0;
  for (const file of files) {
    let code;
    try { code = fs.readFileSync(file, 'utf8'); }
    catch (e) { console.error(paint(`Cannot read ${file}: ${e.message}`, c.red)); totalErrors++; continue; }
    console.log(`\n${paint('▸ ' + file, c.bold)}  ${paint('(' + code.split('\n').length + ' lines)', c.dim)}`);
    totalErrors += printErrors('AccurateValidator', run(v.accurate, code));
    if (v.documentChecks) totalErrors += printErrors('DocumentChecks', run(v.documentChecks, code));
    if (v.semanticChecks) totalErrors += printErrors('SemanticChecks', run(v.semanticChecks, code));
  }
  console.log('');
  console.log(totalErrors === 0
    ? paint('✅ PASS — no severity-0 errors', c.green)
    : paint(`❌ FAIL — ${totalErrors} severity-0 error(s)`, c.red));
  process.exit(totalErrors === 0 ? 0 : 1);
}

main();
