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
 * The corpus is deliberately split.
 *
 * `test/fixtures/corpus/` holds SYNTHETIC fixtures, committed to the public repo.
 * They carry no trading logic and exist to exercise the exact constructs that have
 * produced false positives. These are the CI gate.
 *
 * `examples/` is gitignored, so nothing NEW can be added there and reach the public
 * repository. Eleven generic example files were committed before that rule existed
 * and remain tracked — .gitignore does not untrack what is already committed. They
 * are ordinary samples, not strategies, and are validated as an extended corpus.
 *
 * The author's actual strategies were removed from this branch's history and are
 * excluded going forward. Never add a file from examples/ to the committed list.
 */
const FIXTURE_FILES = [
  'test/fixtures/corpus/drawing-objects.pine',
  'test/fixtures/corpus/syntax-surface.pine',
  'test/fixtures/corpus/modern-api-strategy.pine',
  'test/fixtures/corpus/comments-and-columns.pine',
];

/** Validated when present; absent in CI by design. */
const LOCAL_ONLY_FILES = [
  'examples/demo/deltaflow-volume-profile.pine',
  'examples/demo/mft-state-of-delivery.pine',
  'examples/demo/multi-tf-fvg.pine',
  'examples/global-liquidity.v6.pine',
  'examples/mysample.v6.pine',
  'examples/indicator.2.3.pine',
  'examples/test-v6-features.pine',
];

const GOLDEN_FILES = [...FIXTURE_FILES, ...LOCAL_ONLY_FILES];

/**
 * Guards against the corpus silently disappearing (a bad .gitignore once hid
 * `examples/` from CI entirely). A shrinking corpus must fail loudly rather than
 * turn into a vacuously passing test.
 */
test('Golden corpus: every committed fixture is present', () => {
  const missing = FIXTURE_FILES.filter(f => !fs.existsSync(path.join(REPO_ROOT, f)));
  assert.strictEqual(
    missing.length, 0,
    `Committed corpus fixtures are missing: ${missing.join(', ')}. ` +
    `These are the CI gate and must never be gitignored.`
  );
});

test('Golden corpus: no proprietary file has crept into the committed list', () => {
  const leaked = FIXTURE_FILES.filter(f => f.startsWith('examples/'));
  assert.strictEqual(
    leaked.length, 0,
    `examples/ is gitignored and holds private strategies. Committed fixtures must ` +
    `live under test/fixtures/corpus/. Leaked: ${leaked.join(', ')}`
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
  const largest = path.join(REPO_ROOT, 'test/fixtures/corpus/syntax-surface.pine');
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

//──────────────────────────────────────────────────────────
// Semantic-check gate (W1)
//
// Corpus files compile on TradingView, so ANY semantic finding against them is a
// false positive by definition. This gate is what makes it safe to add checks
// S1-S9 incrementally: each one must arrive silent on known-good code.
//──────────────────────────────────────────────────────────

const {
  SEMANTIC_CHECKS,
  extractSuppressions,
  validatePineScript
} = require('../packages/validator/dist/index.js');

// The original premise here was wrong: "these compile on TradingView, so any
// finding is a false positive". That holds for semantic ERRORS (S5-S8 describe
// compile failures) but NOT for warnings — a script can compile perfectly and
// still repaint. Warnings on real-world files are true positives.
//
// So the gate splits. Committed fixtures are exemplars and must be spotless;
// real-world examples are only held to the compile-failure bar.
test('Semantic gate: no check fires on any committed fixture', () => {
  const offenders = [];

  for (const relativePath of FIXTURE_FILES) {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) continue;

    const source = fs.readFileSync(absolutePath, 'utf8');
    // MUST go through the package's validatePineScript, not the extension's
    // validator directly. Semantic checks live in the package; calling the
    // extension's modules bypasses them entirely and the gate silently passes
    // whatever it is supposed to be catching.
    const semantic = validatePineScript(source).filter(d => d.checkId);

    for (const finding of semantic) {
      offenders.push(`${relativePath}:${finding.line} [${finding.checkId}] ${finding.message}`);
    }
  }

  assert.strictEqual(
    offenders.length, 0,
    'Committed fixtures are teaching material — they must not model the mistakes ' +
    'the checks warn about:\n  ' + offenders.slice(0, 10).join('\n  ')
  );
});

test('Semantic gate: no semantic ERROR on any real-world example', () => {
  // Errors mean TradingView will reject the script. A warning here may well be a
  // true positive — several of these files genuinely repaint.
  const offenders = [];

  for (const relativePath of LOCAL_ONLY_FILES) {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) continue;

    const errors = validatePineScript(fs.readFileSync(absolutePath, 'utf8'))
      .filter(d => d.checkId && d.severity === 0);

    for (const finding of errors) {
      offenders.push(`${relativePath}:${finding.line} [${finding.checkId}] ${finding.message}`);
    }
  }

  assert.strictEqual(
    offenders.length, 0,
    'A semantic ERROR means the script will not compile:\n  ' + offenders.slice(0, 10).join('\n  ')
  );
});

test('Semantic gate: fixtures carry no suppression directives', () => {
  // A check that only passes because the corpus silences it proves nothing. The
  // gate must be earned, not configured away.
  const withDirectives = FIXTURE_FILES.filter(relativePath => {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) return false;
    return extractSuppressions(fs.readFileSync(absolutePath, 'utf8')).size > 0;
  });

  assert.deepStrictEqual(
    withDirectives, [],
    'Corpus fixtures must not use // pine-ignore — suppressing a check there ' +
    'hides exactly the false positive this gate exists to catch'
  );
});

test('Semantic gate: registry ids are unique and well-formed', () => {
  const ids = Object.keys(SEMANTIC_CHECKS);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate check id');
  for (const id of ids) assert.match(id, /^S\d+$/, `malformed id: ${id}`);
});
