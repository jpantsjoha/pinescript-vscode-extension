/**
 * Ternary-operator and multi-line statement validation.
 *
 * Replaces the root-level `test-ternary-validation.js` and
 * `test-multiline-validation.js` scripts. Those printed results but asserted
 * nothing, sat outside the `test/*.test.js` glob so `npm test` never ran them, and
 * were gitignored so CI never saw them — three independent reasons they could not
 * catch a regression.
 *
 * One case from the old multi-line script is deliberately NOT carried over: it
 * expected an error when an `input.string()` continuation was indented by four
 * spaces. TradingView removed that restriction in December 2025, so the old
 * expectation now describes a false positive. See `false-positive-regression.test.js`.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');

function errorsFor(source) {
  return new AccurateValidator().validate(source).filter(e => e.severity === 0);
}

function assertFlags(source, expectedFragment, description) {
  const errors = errorsFor(source);
  assert.ok(
    errors.some(e => e.message.includes(expectedFragment)),
    `${description}\nExpected an error containing "${expectedFragment}", got: ` +
    (errors.map(e => e.message).join(' | ') || '(no errors at all)')
  );
}

function assertClean(source, description) {
  const errors = errorsFor(source);
  const detail = errors.map(e => `  L${e.line}  ${e.message}`).join('\n');
  assert.strictEqual(errors.length, 0, `${description}\nUnexpected error(s):\n${detail}`);
}

//──────────────────────────────────────────────────────────
// Ternary operators
//──────────────────────────────────────────────────────────

test('Ternary: semicolon in place of a colon is an error', () => {
  assertFlags(
    '//@version=6\nindicator("t")\n' +
    'bgcolor(close >= 70 ? color.new(color.red, 95) ;\n' +
    '        close >= 40 ? color.new(color.orange, 97) :\n' +
    '        color.new(color.green, 98))\n',
    'olon',
    'A ";" where a ":" belongs is the classic TradingView ternary compile error'
  );
});

test('Ternary: correct multi-line nested ternary validates clean', () => {
  assertClean(
    '//@version=6\nindicator("t")\n' +
    'c = close >= 70 ? color.new(color.red, 95) :\n' +
    '    close >= 40 ? color.new(color.orange, 97) :\n' +
    '    color.new(color.green, 98)\n' +
    'bgcolor(c)\n',
    'Properly colon-separated nested ternaries are valid Pine'
  );
});

test('Ternary: single-line nested ternary validates clean', () => {
  assertClean(
    '//@version=6\nindicator("t")\n' +
    'v = close > open ? 1 : close < open ? -1 : 0\nplot(v)\n',
    'Chained single-line ternaries are valid Pine'
  );
});

//──────────────────────────────────────────────────────────
// Multi-line statements
//──────────────────────────────────────────────────────────

test('Multi-line: unclosed parenthesis at end of file is an error', () => {
  assertFlags(
    '//@version=6\nindicator("t")\nx = ta.sma(close\n',
    'Unclosed parenthesis',
    'The call never closes and nothing follows it'
  );
});

test('Multi-line: trailing comma with nothing following is an error', () => {
  assertFlags(
    '//@version=6\nindicator("t")\nx = ta.sma(close,\n',
    'Trailing comma without continuation',
    'A comma promises another argument that never arrives'
  );
});

test('Multi-line: properly continued function call validates clean', () => {
  assertClean(
    '//@version=6\nindicator("t")\n' +
    'mode = input.string("Balanced", "Strategy Mode",\n' +
    '                    options=["Risk-Averse", "Balanced", "Aggressive"])\n' +
    'plot(close, "Close")\n',
    'A wrapped call whose continuation supplies the remaining arguments is valid'
  );
});

test('Multi-line: wrapped call closing on a later line validates clean', () => {
  assertClean(
    '//@version=6\nindicator("t")\n' +
    'x = ta.sma(\n    close,\n    14\n)\nplot(x)\n',
    'Arguments spread across several lines with a hanging close paren are valid'
  );
});
