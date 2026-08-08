/**
 * W1 — check registry and `// pine-ignore` suppression.
 *
 * The mechanism's characteristic failure is silence: comments are blanked before
 * analysis runs, so a directive read at the wrong moment simply does not exist and
 * suppression never works. Nothing errors. The tests below exist mainly to make
 * that failure loud.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const {
  SEMANTIC_CHECKS,
  extractSuppressions,
  applySuppressions
} = require('../packages/validator/dist/index.js');
const { blankComments } = require('../packages/validator/dist/src/documentChecks.js');

//──────────────────────────────────────────────────────────
// Registry
//──────────────────────────────────────────────────────────

test('registry defines all nine checks from SPEC.md', () => {
  assert.deepStrictEqual(
    Object.keys(SEMANTIC_CHECKS).sort(),
    ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']
  );
});

test('every check carries an id, severity, title and doc anchor', () => {
  for (const [id, check] of Object.entries(SEMANTIC_CHECKS)) {
    assert.strictEqual(check.id, id, `${id}: id must match its key`);
    assert.ok([0, 1, 2, 3].includes(check.severity), `${id}: severity`);
    assert.ok(check.title && check.title.length > 15, `${id}: needs a real title`);
    // Shape only. Whether the anchor RESOLVES is checked where the skills
    // actually live — scripts/check_doc_anchors.js in pinescript-plugin. Asserting
    // `includes('#')` here passed happily while four of the nine anchors pointed at
    // headings that no longer existed, so treat this as a typo guard, not a link check.
    const [skill, anchor] = (check.docAnchor || '').split('#');
    assert.match(skill, /^pinescript-[a-z0-9]+$/, `${id}: docAnchor needs a skill name`);
    assert.ok(anchor && anchor.length > 3, `${id}: docAnchor needs a section`);
  }
});

test('only compile-breaking checks are errors', () => {
  // Severity policy from the HLD: nine new diagnostics at once risks warning
  // fatigue, so an Error is reserved for "TradingView will reject this".
  const errors = Object.values(SEMANTIC_CHECKS).filter(c => c.severity === 0).map(c => c.id);
  assert.deepStrictEqual(errors.sort(), ['S5', 'S6', 'S7', 'S8'],
    'only the platform-limit and global-scope checks describe a compile failure');
});

//──────────────────────────────────────────────────────────
// Directive parsing
//──────────────────────────────────────────────────────────

test('`// pine-ignore: S1` suppresses S1 and nothing else', () => {
  const s = extractSuppressions('x = 1  // pine-ignore: S1\n');
  assert.strictEqual(s.isSuppressed(1, 'S1'), true);
  assert.strictEqual(s.isSuppressed(1, 'S2'), false,
    'a targeted directive must not become a blanket one');
});

test('a comma-separated list suppresses each named check', () => {
  const s = extractSuppressions('x = 1  // pine-ignore: S1,S2\n');
  assert.strictEqual(s.isSuppressed(1, 'S1'), true);
  assert.strictEqual(s.isSuppressed(1, 'S2'), true);
  assert.strictEqual(s.isSuppressed(1, 'S3'), false);
});

test('a bare `// pine-ignore` suppresses every semantic check on that line', () => {
  const s = extractSuppressions('x = 1  // pine-ignore\n');
  for (const id of Object.keys(SEMANTIC_CHECKS)) {
    assert.strictEqual(s.isSuppressed(1, id), true, `${id} should be suppressed`);
  }
});

test('an unknown id suppresses NOTHING rather than everything', () => {
  // Widening a typo into a blanket suppression would silently hide real findings —
  // the opposite of what the author asked for.
  const s = extractSuppressions('x = 1  // pine-ignore: S99\n');
  assert.strictEqual(s.isSuppressed(1, 'S1'), false);
  assert.strictEqual(s.size, 0, 'the directive should be discarded entirely');
});

test('suppression is line-scoped, not file-scoped', () => {
  const s = extractSuppressions('a = 1  // pine-ignore: S1\nb = 2\n');
  assert.strictEqual(s.isSuppressed(1, 'S1'), true);
  assert.strictEqual(s.isSuppressed(2, 'S1'), false, 'line 2 has no directive');
});

test('whitespace and casing variants parse', () => {
  for (const src of [
    'x=1 //pine-ignore:S1',
    'x=1 //   pine-ignore :  s1  ',
    'x=1  // pine-ignore: S1 , S2'
  ]) {
    assert.strictEqual(extractSuppressions(src + '\n').isSuppressed(1, 'S1'), true, src);
  }
});

//──────────────────────────────────────────────────────────
// The ordering constraint — the reason this file exists
//──────────────────────────────────────────────────────────

test('a directive is still found AFTER comment blanking would have destroyed it', () => {
  const source = 'x = request.security(a, "D", close)  // pine-ignore: S1\n';

  // Prove the hazard is real: blanking removes the directive entirely.
  assert.ok(!blankComments(source).includes('pine-ignore'),
    'precondition — blankComments should erase the directive');

  // Extraction reads the RAW text, so it is unaffected.
  const s = extractSuppressions(source);
  assert.strictEqual(s.isSuppressed(1, 'S1'), true,
    'extractSuppressions must run on raw source, before any blanking pass');
});

test('a `// pine-ignore` inside a string literal is not a directive', () => {
  const s = extractSuppressions('msg = "// pine-ignore: S1"\n');
  assert.strictEqual(s.isSuppressed(1, 'S1'), false,
    'text inside a string is data, not an instruction to the validator');
});

//──────────────────────────────────────────────────────────
// Applying suppressions
//──────────────────────────────────────────────────────────

test('a suppressed semantic finding is removed', () => {
  const s = extractSuppressions('x = 1 // pine-ignore: S1\n');
  const kept = applySuppressions([{ line: 1, checkId: 'S1', message: 'repaints' }], s);
  assert.strictEqual(kept.length, 0);
});

test('an unsuppressed semantic finding survives', () => {
  const s = extractSuppressions('x = 1 // pine-ignore: S2\n');
  const kept = applySuppressions([{ line: 1, checkId: 'S1', message: 'repaints' }], s);
  assert.strictEqual(kept.length, 1);
});

test('a SYNTACTIC finding can never be suppressed', () => {
  // Syntactic diagnostics are compile errors — facts, not judgements. Hiding one
  // would mean shipping a script that cannot run.
  const s = extractSuppressions('x = 1 // pine-ignore\n');
  const kept = applySuppressions([{ line: 1, message: "No parameter named 'colour'" }], s);
  assert.strictEqual(kept.length, 1,
    'a finding with no checkId is syntactic and must pass through');
});
