#!/usr/bin/env node
/**
 * Pine v6 validation CLI — single entrypoint for headless / agent use.
 *
 * Uses AccurateValidator by default (the SAME validator the VS Code extension
 * runs, so CLI output matches what the operator sees in-editor). Pass
 * --comprehensive to run ComprehensiveValidator instead (the MCP-server path),
 * or --both to diff the two.
 *
 * Usage:
 *   node validate-cli.js <file.pine> [more.pine ...]
 *   node validate-cli.js --comprehensive <file.pine>
 *   node validate-cli.js --both <file.pine>
 *
 * Exit code: 0 if no severity-0 errors in any file, else 1. (Built for CI / agents.)
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
  try { out.accurate = new (require('./dist/src/parser/accurateValidator').AccurateValidator)(); }
  catch (e) { out.accurateErr = e.message; }
  try { out.comprehensive = new (require('./dist/src/parser/comprehensiveValidator').ComprehensiveValidator)(); }
  catch (e) { out.comprehensiveErr = e.message; }
  // The editor emits diagnostics from TWO sources: AccurateValidator plus the
  // whole-document heuristics. A CLI that ran only the first reported "0 errors"
  // on files the editor covered in squiggles, so both run here by default.
  try { out.documentChecks = { validate: require('./dist/src/parser/documentChecks').runDocumentChecks }; }
  catch (e) { out.documentChecksErr = e.message; }
  // Semantic checks — the third diagnostic source, from the published engine.
  // ADR-0001: written once, consumed here and by the extension.
  try {
    const eng = require('pinescript-v6-validator');
    out.semanticChecks = {
      validate: (code) => eng.applySuppressions(eng.runSemanticChecks(code), eng.extractSuppressions(code))
    };
  } catch (e) { out.semanticChecksErr = e.message; }
  return out;
}

function run(validator, code) {
  // Both validators expose .validate(code) -> [{line, column?, message, severity}]
  // Guard: a validator that throws (e.g. comprehensiveValidator on some ASTs)
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
  const mode = args.includes('--comprehensive') ? 'comprehensive'
    : args.includes('--both') ? 'both' : 'accurate';
  const files = args.filter(a => !a.startsWith('--'));
  if (files.length === 0) {
    console.error('Usage: node validate-cli.js [--comprehensive|--both] <file.pine> ...');
    process.exit(2);
  }
  const v = loadValidators();
  if (mode !== 'comprehensive' && !v.accurate) { console.error('AccurateValidator load failed:', v.accurateErr, '\nRun: npm run build'); process.exit(2); }
  if (mode !== 'accurate' && !v.comprehensive) { console.error('ComprehensiveValidator load failed:', v.comprehensiveErr, '\nRun: npm run build'); process.exit(2); }

  let totalErrors = 0;
  for (const file of files) {
    let code;
    try { code = fs.readFileSync(file, 'utf8'); }
    catch (e) { console.error(paint(`Cannot read ${file}: ${e.message}`, c.red)); totalErrors++; continue; }
    console.log(`\n${paint('▸ ' + file, c.bold)}  ${paint('(' + code.split('\n').length + ' lines)', c.dim)}`);
    if (mode === 'accurate' || mode === 'both') totalErrors += printErrors('AccurateValidator', run(v.accurate, code));
    if ((mode === 'accurate' || mode === 'both') && v.documentChecks) totalErrors += printErrors('DocumentChecks', run(v.documentChecks, code));
    if ((mode === 'accurate' || mode === 'both') && v.semanticChecks) totalErrors += printErrors('SemanticChecks', run(v.semanticChecks, code));
    if (mode === 'comprehensive' || mode === 'both') totalErrors += printErrors('ComprehensiveValidator', run(v.comprehensive, code));
  }
  console.log('');
  console.log(totalErrors === 0
    ? paint('✅ PASS — no severity-0 errors', c.green)
    : paint(`❌ FAIL — ${totalErrors} severity-0 error(s)`, c.red));
  process.exit(totalErrors === 0 ? 0 : 1);
}

main();
