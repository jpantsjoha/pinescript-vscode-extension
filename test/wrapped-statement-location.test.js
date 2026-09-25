/**
 * Focused pins for the #43 review findings that the corpus format cannot express.
 *
 * The regression corpus (`test/regression-corpus.js`) asserts only WHICH checkId
 * fires, and its null cases tolerate bare warnings — so two review findings need
 * a stronger assertion than the table can hold:
 *
 *   f3 — a wrapped `indicator(..., timeframe_gaps=true,\n timeframe="D")` must
 *        produce NO diagnostic at all, not even a warning. The false positive
 *        was a Warning, which a corpus null case would not catch.
 *   f5 — "No parameter named '...'" must land on the physical line and column
 *        of the bad argument, not on the call's first line.
 *   d1 — the per-call special cases (plotshape/plotchar shape=, indicator
 *        timeframe_gaps) must inspect only the call's OWN top-level argument
 *        names: a nested call's argument named `shape` or `timeframe_gaps`
 *        must produce NO diagnostic at all (delta review, 2026-09-25), and
 *        the named-argument squiggle must start at the bad NAME.
 *   round-2 #1 — the squiggle starts at the bad NAME even when the argument
 *        carries leading whitespace/padding, in both the multi-line
 *        (`plot(\n    close,\n    bogus=1\n)` → line 5, column 4) and the
 *        single-line (`plot(close,   bogus=1)` → column 14) shapes.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { validatePineScript } = require('../packages/validator/dist/index.js');

describe('#43: wrapped statements — argument-level location and silence', () => {
  test('f3: a wrapped indicator with timeframe on the next line is fully silent', () => {
    const code =
      '//@version=6\n' +
      'indicator("Wrapped", timeframe_gaps=true,\n' +
      '    timeframe="D")\n' +
      'plot(close)\n';
    const diagnostics = validatePineScript(code);
    assert.deepStrictEqual(
      diagnostics.map(d => `${d.severity}:${d.message}`),
      [],
      'timeframe= sits on a continuation line; the joined statement must reach ' +
      'validateSpecialCases so timeframe_gaps does not warn.'
    );
  });

  test('f3: timeframe_gaps WITHOUT any timeframe still warns', () => {
    const code =
      '//@version=6\n' +
      'indicator("Wrapped",\n' +
      '    timeframe_gaps=true)\n' +
      'plot(close)\n';
    const diagnostics = validatePineScript(code);
    const warnings = diagnostics.filter(d =>
      d.message === '"timeframe_gaps" has no effect without "timeframe" parameter');
    assert.strictEqual(warnings.length, 1,
      'Passing the joined statement must not silence the real case.');
  });

  test('f5: a bad named argument is reported on ITS line and column', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'lbl = label.new(\n' +
      '    x=bar_index,\n' +
      '    y=close,\n' +
      '    text="Test",\n' +
      '    invalid_named_param=123\n' +
      ')\n';
    const diagnostics = validatePineScript(code);
    const bad = diagnostics.filter(d =>
      d.message.includes("No parameter named 'invalid_named_param'"));
    assert.strictEqual(bad.length, 1, `expected exactly one named-parameter error, got ${JSON.stringify(diagnostics)}`);
    // Line 7 is `    invalid_named_param=123`; the name starts at column 4.
    assert.strictEqual(bad[0].line, 7,
      'the error belongs on the argument\'s physical line, not the call\'s first line (3)');
    assert.strictEqual(bad[0].column, 4,
      'the squiggle belongs under the argument name, not the call');
  });

  test('f5: a bad named argument on the call line keeps its own column', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'lbl = label.new(x=bar_index, y=close, text="Test", invalid_named_param=123)\n';
    const diagnostics = validatePineScript(code);
    const bad = diagnostics.filter(d =>
      d.message.includes("No parameter named 'invalid_named_param'"));
    assert.strictEqual(bad.length, 1);
    assert.strictEqual(bad[0].line, 3);
    assert.strictEqual(bad[0].column,
      'lbl = label.new(x=bar_index, y=close, text="Test", '.length,
      'single-line calls point at the argument too, not at label.new');
  });

  test('d1: the squiggle starts at the bad NAME, not the argument\'s leading whitespace', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'lbl = label.new(\n' +
      '    x=bar_index, bogus_name=1\n' +
      ')\n';
    const diagnostics = validatePineScript(code);
    const bad = diagnostics.filter(d =>
      d.message.includes("No parameter named 'bogus_name'"));
    assert.strictEqual(bad.length, 1, `expected exactly one named-parameter error, got ${JSON.stringify(diagnostics)}`);
    // Line 4 is `    x=bar_index, bogus_name=1`; the name starts after `    x=bar_index, `.
    assert.strictEqual(bad[0].line, 4);
    assert.strictEqual(bad[0].column, '    x=bar_index, '.length,
      'the underline begins at the first character of the bad name');
  });

  test('round-2 #1: a wrapped named argument skips its leading whitespace', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'plot(\n' +
      '    close,\n' +
      '    bogus=1\n' +
      ')\n';
    const diagnostics = validatePineScript(code);
    const bad = diagnostics.filter(d =>
      d.message.includes("No parameter named 'bogus'"));
    assert.strictEqual(bad.length, 1, `expected exactly one named-parameter error, got ${JSON.stringify(diagnostics)}`);
    // Line 5 is `    bogus=1`; the name starts at column 4.
    assert.strictEqual(bad[0].line, 5,
      'the error belongs on the argument\'s physical line');
    assert.strictEqual(bad[0].column, 4,
      'the squiggle starts at the b in bogus, not at the argument\'s indentation');
  });

  test('round-2 #1: a single-line named argument skips padding after the comma', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'plot(close,   bogus=1)\n';
    const diagnostics = validatePineScript(code);
    const bad = diagnostics.filter(d =>
      d.message.includes("No parameter named 'bogus'"));
    assert.strictEqual(bad.length, 1, `expected exactly one named-parameter error, got ${JSON.stringify(diagnostics)}`);
    assert.strictEqual(bad[0].line, 3);
    assert.strictEqual(bad[0].column, 14,
      'the squiggle starts at the b in bogus (after `plot(close,   `), not at the padding');
  });

  test('d1: a nested argument named shape inside a wrapped plotshape is fully silent', () => {
    const code =
      '//@version=6\n' +
      'indicator("t")\n' +
      'passthrough(float shape) => shape\n' +
      'plotshape(\n' +
      '    passthrough(\n' +
      '        shape=close\n' +
      '    ) > 0\n' +
      ')\n';
    const diagnostics = validatePineScript(code);
    assert.deepStrictEqual(
      diagnostics.map(d => `${d.severity}:${d.message}`),
      [],
      'shape= belongs to the NESTED passthrough call; only the call\'s own top-level ' +
      'argument names may feed the plotshape special case.'
    );
  });

  test('d1: a nested timeframe_gaps inside indicator(...) is fully silent', () => {
    const code =
      '//@version=6\n' +
      'f(bool timeframe_gaps) => timeframe_gaps\n' +
      'indicator("t", shorttitle=f(timeframe_gaps=true) ? "x" : "y")\n' +
      'plot(close)\n';
    const diagnostics = validatePineScript(code);
    assert.deepStrictEqual(
      diagnostics.map(d => `${d.severity}:${d.message}`),
      [],
      'timeframe_gaps= belongs to the nested f(); the indicator special case must only ' +
      'see the indicator call\'s own top-level arguments.'
    );
  });
});
