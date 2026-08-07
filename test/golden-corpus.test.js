/**
 * Golden corpus: known-good Pine v6 files must validate CLEAN.
 *
 * Every file listed here compiles and runs on TradingView. Any error the validator
 * reports against them is by definition a FALSE POSITIVE — the single most damaging
 * defect class for this extension, because it puts red squiggles on correct code.
 *
 * This is the gate that was missing when v1.2.0's named-argument check shipped
 * ten false positives on `line.new` / `label.new` / `box.new`. The existing suite
 * tested the parameter DATA rather than the validator, so nothing caught it.
 *
 * Warnings are counted but not failed on; only severity 0 (Error) fails the build.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');
const { runDocumentChecks } = require('../dist/src/parser/documentChecks.js');

/**
 * The editor emits diagnostics from TWO independent sources. Gating only the
 * first is how 28 false `alertcondition` errors survived a "0 errors" corpus run.
 */
function allDiagnostics(source) {
  return [...new AccurateValidator().validate(source), ...runDocumentChecks(source)];
}

const REPO_ROOT = path.join(__dirname, '..');

/**
 * Files verified to compile on TradingView. Keep this list additive: when a user
 * reports a false positive, add their (reduced) script here before fixing it.
 */
const GOLDEN_FILES = [
  'examples/JP-MMG46.pine',
  'examples/JP-MMG4.pine',
  'examples/JP-MMG-v4.1_1.pine',
  'examples/JP-MmtDirGold-Macro-v3.pine',
  'examples/global-liquidity.v6.pine',
  'examples/mysample.v6.pine',
  'examples/indicator.2.3.pine',
  'examples/test-v6-features.pine',
  'examples/test-plot-parsing.pine',
  'examples/test-named-args.pine',
  'examples/demo/deltaflow-volume-profile.pine',
  'examples/demo/mft-state-of-delivery.pine',
  'examples/demo/multi-tf-fvg.pine',
];

/**
 * Guards against the corpus silently disappearing (a bad .gitignore once hid
 * `examples/` from CI entirely). A shrinking corpus must fail loudly rather than
 * turn into a vacuously passing test.
 */
const MINIMUM_CORPUS_SIZE = 10;

test('Golden corpus: files are present', () => {
  const found = GOLDEN_FILES.filter(f => fs.existsSync(path.join(REPO_ROOT, f)));
  assert.ok(
    found.length >= MINIMUM_CORPUS_SIZE,
    `Golden corpus shrank to ${found.length} file(s); expected at least ${MINIMUM_CORPUS_SIZE}. ` +
    `Missing: ${GOLDEN_FILES.filter(f => !found.includes(f)).join(', ')}`
  );
});

for (const relativePath of GOLDEN_FILES) {
  test(`Golden corpus: ${relativePath} validates with zero errors`, (t) => {
    const absolutePath = path.join(REPO_ROOT, relativePath);

    if (!fs.existsSync(absolutePath)) {
      t.skip(`${relativePath} not present in this checkout`);
      return;
    }

    const source = fs.readFileSync(absolutePath, 'utf8');
    const errors = allDiagnostics(source).filter(e => e.severity === 0);

    const detail = errors
      .slice(0, 10)
      .map(e => `  L${e.line}:${e.column}  ${e.message}`)
      .join('\n');

    assert.strictEqual(
      errors.length,
      0,
      `${relativePath} produced ${errors.length} false positive(s):\n${detail}`
    );
  });
}

test('Golden corpus: validation stays within the 100ms performance budget', () => {
  const largest = path.join(REPO_ROOT, 'examples/JP-MMG46.pine');
  if (!fs.existsSync(largest)) return;

  const source = fs.readFileSync(largest, 'utf8');
  const validator = new AccurateValidator();

  validator.validate(source); // warm up, so we time steady-state not first-call

  const start = process.hrtime.bigint();
  validator.validate(source);
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;

  assert.ok(
    elapsedMs < 100,
    `Validation of ${source.split('\n').length} lines took ${elapsedMs.toFixed(1)}ms, ` +
    `exceeding the 100ms budget. Check for a reintroduced per-line scan over all ` +
    `function signatures.`
  );
});
