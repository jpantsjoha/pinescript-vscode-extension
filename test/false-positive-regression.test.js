/**
 * False-positive regression suite.
 *
 * Each case is a snippet of LEGAL Pine v6 that a past validator version wrongly
 * flagged. Fixtures are inline (not files) so the suite is self-contained and
 * cannot be silently disabled by a .gitignore change.
 *
 * Paired with each "must not flag" case is a "must still flag" case, because the
 * cheap way to kill a false positive is to delete the check — and that trades a
 * visible bug for an invisible one.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');

/** Severity-0 (Error) diagnostics only; warnings are advisory. */
function errorsFor(source) {
  return new AccurateValidator().validate(source).filter(e => e.severity === 0);
}

function assertClean(source, description) {
  const errors = errorsFor(source);
  const detail = errors.map(e => `  L${e.line}  ${e.message}`).join('\n');
  assert.strictEqual(errors.length, 0, `${description}\nUnexpected error(s):\n${detail}`);
}

function assertFlags(source, expectedFragment, description) {
  const errors = errorsFor(source);
  assert.ok(
    errors.some(e => e.message.includes(expectedFragment)),
    `${description}\nExpected an error containing "${expectedFragment}", got: ` +
    (errors.map(e => e.message).join(' | ') || '(no errors at all)')
  );
}

const HEADER = '//@version=6\nindicator("t", overlay=true)\n';

//──────────────────────────────────────────────────────────
// Overloaded drawing constructors
//
// v6 gives line/label/box two call forms: a chart.point form and an independent
// coordinate form. The generated scrape captured only the first, so the coordinate
// form — by far the more common — reported "No parameter named 'x1'" and friends.
//──────────────────────────────────────────────────────────

test('FP: line.new coordinate overload (x1/y1/x2/y2) is valid', () => {
  assertClean(
    HEADER + 'l = line.new(x1=bar_index[1], y1=low[1], x2=bar_index, y2=high, color=color.red, width=2)\n',
    'line.new(x1, y1, x2, y2, ...) is an official v6 overload'
  );
});

test('FP: line.new chart.point overload is valid', () => {
  assertClean(
    HEADER + 'p1 = chart.point.now(high)\np2 = chart.point.now(low)\nl = line.new(first_point=p1, second_point=p2)\n',
    'line.new(first_point, second_point, ...) is the other official overload'
  );
});

test('FP: label.new coordinate overload (x/y/text) is valid', () => {
  assertClean(
    HEADER + 'lb = label.new(x=bar_index, y=high, text="hi", style=label.style_label_down)\n',
    'label.new(x, y, text, ...) is an official v6 overload'
  );
});

test('FP: box.new coordinate overload (left/top/right/bottom) is valid', () => {
  assertClean(
    HEADER + 'b = box.new(left=bar_index[5], top=high, right=bar_index, bottom=low, bgcolor=color.orange)\n',
    'box.new(left, top, right, bottom, ...) is an official v6 overload'
  );
});

test('Still flags: a genuinely wrong parameter name on a drawing constructor', () => {
  assertFlags(
    HEADER + 'lb = label.new(x=bar_index, y=high, text_halign=text.align_left)\n',
    "No parameter named 'text_halign'",
    'text_halign belongs to box.new/table.cell, not label.new'
  );
});

test('Still flags: misspelled colour/color on line.new', () => {
  assertFlags(
    HEADER + 'l = line.new(x1=1, y1=2, x2=3, y2=4, colour=color.red)\n',
    "No parameter named 'colour'",
    'British spelling is not a Pine parameter'
  );
});

test('Still flags: textalign is not a box.new parameter', () => {
  assertFlags(
    HEADER + 'b = box.new(left=1, top=2, right=3, bottom=4, textalign=text.align_left)\n',
    "No parameter named 'textalign'",
    'box.new uses text_halign/text_valign; textalign belongs to label.new'
  );
});

//──────────────────────────────────────────────────────────
// Multi-line statement continuation
//
// TradingView REMOVED indentation restrictions for wrapped lines in Dec 2025, and
// comments/blank lines have always been legal between arguments.
//──────────────────────────────────────────────────────────

test('FP: a comment inside a wrapped call is legal', () => {
  assertClean(
    HEADER + 'plot(close,\n    // the series title\n    "Close")\n',
    'Pine allows comments between arguments of a wrapped call'
  );
});

test('FP: a blank line inside a wrapped call is legal', () => {
  assertClean(
    HEADER + 'x = ta.sma(close,\n\n    14)\nplot(x)\n',
    'Pine allows blank lines inside a wrapped call'
  );
});

test('FP: continuation indented by exactly four spaces is legal', () => {
  assertClean(
    HEADER + 'mode = input.string("Balanced", "Mode",\n    options=["Risk-Averse", "Balanced", "Aggressive"])\n',
    'Dec 2025 release explicitly permits multiples of four spaces inside enclosed expressions'
  );
});

test('FP: continuation not indented beyond the opening line is legal', () => {
  assertClean(
    HEADER + 'e = ta.ema(close,\n14)\nplot(e)\n',
    'Dec 2025 release removed indentation restrictions for wrapped lines'
  );
});

test('Still flags: a call left genuinely unterminated at end of file', () => {
  assertFlags(
    HEADER + 'x = ta.sma(close,\n',
    'Unclosed parenthesis',
    'Nothing follows the trailing comma, so the call really is truncated'
  );
});

test('Still flags: unterminated call followed only by a comment', () => {
  assertFlags(
    HEADER + 'y = plot(close,\n    // only a comment, then EOF\n',
    'Unclosed parenthesis',
    'A comment is not a continuation when no code follows it'
  );
});

//──────────────────────────────────────────────────────────
// Multiline strings (Pine v6, April 2026)
//──────────────────────────────────────────────────────────

test('FP: triple-quoted multiline string does not desynchronise parsing', () => {
  assertClean(
    HEADER + 'msg = """line one\nline two with plot( and unbalanced parens\nline three"""\nplot(close, "ok")\n',
    'Multiline string contents are text, not code'
  );
});

test('FP: triple-apostrophe multiline string is handled', () => {
  assertClean(
    HEADER + "msg = '''alpha\nbeta\ngamma'''\nplot(close, \"ok\")\n",
    "''' is the other multiline delimiter"
  );
});

test('Multiline strings preserve line numbers for later diagnostics', () => {
  const source = HEADER + 'msg = """a\nb\nc"""\nz = math.nonexistent(1)\n';
  const errors = errorsFor(source);
  assert.ok(errors.length > 0, 'the bad call after the string should still be reported');
  assert.strictEqual(
    errors[0].line,
    6,
    'blanking a multiline string must not shift subsequent line numbers'
  );
});

//──────────────────────────────────────────────────────────
// for...in loop iterators
//──────────────────────────────────────────────────────────

test('FP: for...in loop iterator is a declared variable', () => {
  assertClean(
    HEADER + 'var boxes = array.new<box>()\nif barstate.islast\n    for b in boxes\n        b.delete()\n',
    'for <element> in <collection> binds the iterator without an "="'
  );
});

test('FP: for...in tuple form binds both index and element', () => {
  assertClean(
    HEADER + 'var boxes = array.new<box>()\nif barstate.islast\n    for [i, item] in boxes\n        item.delete()\n        plot(i)\n',
    'for [index, element] in <collection> binds both names'
  );
});

//──────────────────────────────────────────────────────────
// Balanced-paren argument extraction
//──────────────────────────────────────────────────────────

test('FP: nested parentheses in an argument are not truncated', () => {
  assertClean(
    HEADER + 'a = 1.0\nb = 2.0\nv = ta.ema(a / (a + b) * 100, 3)\nplot(v)\n',
    'A naive [^)]* match stopped at the first inner ")" and under-counted arguments'
  );
});

test('Still flags: too many arguments even with nested parens present', () => {
  assertFlags(
    HEADER + 'v = ta.ema(close, 3, (1 + 2), 9, 9)\n',
    'Too many arguments',
    'Balanced extraction must still count correctly'
  );
});

//──────────────────────────────────────────────────────────
// User-defined types and enums
//──────────────────────────────────────────────────────────

test('FP: user-defined type used as a constructor namespace', () => {
  assertClean(
    '//@version=6\nindicator("t")\ntype Point\n    float x\n    float y\np = Point.new(1.0, 2.0)\nplot(p.x)\n',
    'A `type` declaration introduces a namespace for .new() and field access'
  );
});

test('FP: user-defined enum used as a namespace', () => {
  assertClean(
    '//@version=6\nindicator("t")\nenum Trend\n    up\n    down\nt = Trend.up\nplot(close)\n',
    'An `enum` declaration introduces a namespace for its members'
  );
});

//──────────────────────────────────────────────────────────
// Pine v6 API added after the 2025-10-03 reference scrape
//──────────────────────────────────────────────────────────

test('FP: v6 API added after the reference scrape is accepted', () => {
  assertClean(
    '//@version=6\n' +
    'strategy("s", overlay=true, calc_on_every_history_tick=true)\n' +
    'len = input.int(14, "Length", active=true)\n' +
    't = time(timeframe.period, timeframe_bars_back=1)\n' +
    'var arr = array.new<float>()\n' +
    'array.sort(arr, order.ascending)\n' +
    'b = box.new(left=bar_index, top=high, right=bar_index, bottom=low)\n' +
    'box.set_xloc(b, bar_index, bar_index, xloc.bar_index)\n' +
    'plot(len)\n',
    'Release notes Oct 2025 - Jul 2026 added these; the scraped dataset predates them'
  );
});

//──────────────────────────────────────────────────────────
// Whole-document heuristics (src/parser/documentChecks.ts)
//
// These ran inline in extension.ts, invisible to the CLI and to every test, and
// produced 28 false `alertcondition` errors across the TradingView-verified
// corpus — on files this suite simultaneously certified as clean.
//──────────────────────────────────────────────────────────

const { runDocumentChecks } = require('../dist/src/parser/documentChecks.js');

function docErrors(source) {
  return runDocumentChecks(source).filter(e => e.severity === 0);
}

test('FP: alertcondition message containing a comma is not an extra argument', () => {
  const errors = docErrors(
    HEADER + 'c = close > open\n' +
    'alertcondition(c, title="MED Conf Long", message="MEDIUM CONFIDENCE: Conditions met, reduce size or tighten stops")\n'
  );
  assert.strictEqual(errors.length, 0,
    'A comma inside a string literal is not an argument separator. Got: ' +
    errors.map(e => e.message).join(' | '));
});

test('FP: alertcondition with a nested call in an argument is not truncated', () => {
  const errors = docErrors(
    HEADER + 'c = close > open\n' +
    'alertcondition(c and not na(close[1]), title="T", message="M")\n'
  );
  assert.strictEqual(errors.length, 0,
    'Matching with [^)]+ stopped at the first inner ")". Got: ' +
    errors.map(e => e.message).join(' | '));
});

test('Still flags: alertcondition genuinely given four arguments', () => {
  const errors = docErrors(HEADER + 'c = close > open\nalertcondition(c, "T", "M", "extra")\n');
  assert.ok(
    errors.some(e => e.message.includes('expects 3 parameters')),
    'Four real arguments must still be reported'
  );
});

test('Still flags: plotshape called with shape= instead of style=', () => {
  const errors = docErrors(HEADER + 'plotshape(close > open, shape=shape.triangleup)\n');
  assert.ok(errors.some(e => e.message.includes('Did you mean "style"')), 'shape= is wrong on plotshape');
});

test('FP: plotshape with a nested call before style= is still checked correctly', () => {
  const errors = docErrors(HEADER + 'plotshape(close > open, style=shape.triangleup, color=color.new(color.green, 0))\n');
  assert.strictEqual(errors.length, 0, 'Correct usage must be silent: ' + errors.map(e => e.message).join(' | '));
});

test('FP: time() with the v6 timeframe_bars_back named argument is not a session check', () => {
  const warnings = runDocumentChecks(HEADER + 't = time(timeframe.period, timeframe_bars_back=1)\n');
  assert.ok(
    !warnings.some(w => w.message.includes('bool-NA')),
    'timeframe_bars_back is a named argument added in October 2025, not a session argument'
  );
});

test('FP: the removed ta.change heuristic no longer fires on valid code', () => {
  const warnings = runDocumentChecks(
    HEADER + 'ch = ta.change(close)\nsig = (ch > 0) and (close > open)\nplot(sig ? 1 : 0)\n'
  );
  assert.ok(
    !warnings.some(w => w.message.includes('ta.change')),
    'An unlocalisable style hint that fired on 3 of 11 verified files was removed'
  );
});
