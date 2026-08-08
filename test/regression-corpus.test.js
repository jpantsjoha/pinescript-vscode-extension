/**
 * The regression corpus, run against the LOCAL BUILD.
 *
 * The same table also runs against the packed-and-installed tarball in
 * test/npm-package.test.js. Two runs, one table: a defect that only appears in the
 * published artefact cannot hide, and the two runs cannot drift apart because there
 * is nothing to drift.
 *
 * Cases live in test/regression-corpus.js. Add them there, not here.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { validatePineScript } = require('../packages/validator/dist/index.js');
const { CASES, SUPPRESSION_CASES } = require('./regression-corpus.js');

/**
 * Run one corpus case and explain any failure in terms of the ORIGINAL defect.
 * A bare "expected S3, got nothing" tells a future maintainer nothing about why
 * the case exists; `why` is the whole value of the corpus.
 */
function runCase(validate, entry) {
  const diagnostics = validate(entry.code);
  const ids = diagnostics.map(d => d.checkId || (d.severity === 0 ? 'error' : 'warn'));

  const context =
    `\n\n  Regression found ${entry.found}` +
    `\n  ${entry.why}` +
    `\n\n  Got: ${ids.join(', ') || '(nothing)'}`;

  if (entry.expect === null) {
    const real = diagnostics.filter(d => d.checkId || d.severity === 0);
    assert.strictEqual(real.length, 0,
      `This code is CORRECT and must produce no findings.` + context +
      `\n  A false positive on working code is worse than a miss — it teaches ` +
      `people to ignore the tool.`);
    return;
  }

  assert.ok(ids.includes(entry.expect),
    `Expected ${entry.expect}.` + context);
}

describe('Regression corpus — local build', () => {
  for (const entry of CASES) {
    test(entry.name, () => runCase(validatePineScript, entry));
  }
});

describe('Regression corpus — suppression contract', () => {
  for (const entry of SUPPRESSION_CASES) {
    test(entry.name, () => runCase(validatePineScript, entry));
  }
});

describe('Regression corpus — integrity of the corpus itself', () => {
  const all = [...CASES, ...SUPPRESSION_CASES];

  test('every case documents when it was found and why it exists', () => {
    for (const entry of all) {
      assert.match(entry.found, /^\d{4}-\d{2}-\d{2}$/,
        `"${entry.name}" needs a real date in \`found\`, not "${entry.found}"`);
      assert.ok(entry.why && entry.why.length > 40,
        `"${entry.name}" needs a \`why\` explaining how the defect escaped. ` +
        `A case nobody understands is a case somebody deletes.`);
    }
  });

  test('the corpus keeps a real proportion of must-not-fire cases', () => {
    // Every check ships with both directions. If negatives ever fall away, the
    // corpus has quietly become a "find more bugs" suite and stopped defending
    // correct code — which is the harder and more valuable half.
    const negatives = all.filter(c => c.expect === null).length;
    assert.ok(negatives >= all.length * 0.3,
      `Only ${negatives}/${all.length} cases assert silence on correct code.`);
  });

  test('case names are unique', () => {
    const names = all.map(c => c.name);
    assert.strictEqual(new Set(names).size, names.length, 'duplicate case name');
  });
});
