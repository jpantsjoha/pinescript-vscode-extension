/**
 * Every namespaced name the v6 reference documents must be accepted.
 *
 * Issue #37 turned the namespace-member check on for plain assignments and made an
 * unknown member an error. A systematic sweep then found 22 documented names the
 * 2025 hand lists did not know (session.ismarket, label.all, earnings.future_eps,
 * strategy.openprofit_percent, ...), each a new false positive. This test walks the
 * whole reference so a stale list can never ship that class of error again.
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { AccurateValidator } = require('../dist/engine/src/accurateValidator.js');
const { REFERENCE_NAMES } = require('../dist/engine/data/reference-names.js');
const { PINE_FUNCTIONS_MERGED } = require('../dist/engine/data/parameter-requirements-merged.js');

const IND = '//@version=6\nindicator("t")\n';
const memberErrors = code => new AccurateValidator().validate(code)
  .filter(e => e.severity === 0 && /Unknown .* constant or function|Undefined namespace/.test(e.message))
  .map(e => e.message);

test('the reference name list is populated', () => {
  assert.ok(REFERENCE_NAMES.size >= 300, `only ${REFERENCE_NAMES.size} names`);
  for (const n of ['session.ismarket', 'label.all', 'strategy.openprofit_percent', 'earnings.future_eps', 'xloc.bar_index']) {
    assert.ok(REFERENCE_NAMES.has(n), `${n} missing`);
  }
});

test('every documented constant and variable validates without a member error', () => {
  const bad = [];
  for (const name of REFERENCE_NAMES) {
    const errs = memberErrors(IND + `x = ${name}\nplot(close)\n`);
    if (errs.length) bad.push(`${name}: ${errs[0]}`);
  }
  assert.deepStrictEqual(bad, [], `${bad.length} documented names flagged:\n${bad.join('\n')}`);
});

test('every documented namespaced function name is accepted as a member', () => {
  const bad = [];
  for (const name of Object.keys(PINE_FUNCTIONS_MERGED)) {
    if (!name.includes('.')) continue;
    const errs = memberErrors(IND + `f = ${name}\nplot(close)\n`);
    if (errs.length) bad.push(`${name}: ${errs[0]}`);
  }
  assert.deepStrictEqual(bad, [], `${bad.length} documented functions flagged:\n${bad.join('\n')}`);
});

test('a misspelled member of a documented namespace is still flagged', () => {
  for (const name of ['session.ismarkett', 'label.alll', 'xloc.bar_indexx', 'color.purplee']) {
    assert.strictEqual(memberErrors(IND + `x = ${name}\nplot(close)\n`).length, 1, `${name} not flagged`);
  }
});

test('an unknown namespaced CALL is reported once, not twice', () => {
  const all = new AccurateValidator().validate(IND + 'x = math.nonexistent(10)\nplot(close)\n').filter(e => e.severity === 0);
  assert.strictEqual(all.length, 1, all.map(e => e.message).join(' | '));
  assert.match(all[0].message, /Undefined function 'math.nonexistent'/);
});
