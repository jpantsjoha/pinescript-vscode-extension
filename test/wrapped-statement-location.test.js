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
});
