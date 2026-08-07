/**
 * Semantic checks — paired tests.
 *
 * Every check gets BOTH directions: one case it must flag, one legitimate case it
 * must stay silent on. A check without a "must not flag" case does not ship —
 * a false positive is worse than a missed error, because it puts a warning on
 * correct code and teaches people to ignore the tool.
 *
 * Requirements: SPEC.md §Requirement: semantic checks
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { validatePineScript, SEMANTIC_CHECKS } = require('../packages/validator/dist/index.js');

const IND = '//@version=6\nindicator("t", overlay=true)\n';
const STR = '//@version=6\nstrategy("t", overlay=true)\n';

/** Semantic findings only — syntactic diagnostics are a separate concern. */
function checks(source) {
  return validatePineScript(source).filter(d => d.checkId);
}

function assertFlags(source, id, why) {
  const found = checks(source).map(d => d.checkId);
  assert.ok(found.includes(id),
    `${why}\nExpected ${id}, got: ${found.join(', ') || '(nothing)'}`);
}

function assertSilent(source, id, why) {
  const found = checks(source).map(d => d.checkId);
  assert.ok(!found.includes(id),
    `${why}\n${id} fired on legitimate code. All findings: ${found.join(', ')}`);
}

//──────────────────────────────────────────────────────────
// S1 — repainting
//──────────────────────────────────────────────────────────

test('S1 flags request.security reading the current, forming bar', () => {
  assertFlags(IND + 'd = request.security(syminfo.tickerid, "D", close)\nplot(d)\n', 'S1',
    'History shows a settled value, live shows a moving one — the backtest measures something the market will not repeat');
});

test('S1 is silent when the expression uses a historical offset', () => {
  assertSilent(IND + 'd = request.security(syminfo.tickerid, "D", close[1])\nplot(d)\n', 'S1',
    'close[1] is the previous, closed bar');
});

test('S1 is silent when lookahead is stated explicitly', () => {
  assertSilent(IND + 'd = request.security(syminfo.tickerid, "D", close, lookahead=barmerge.lookahead_off)\nplot(d)\n', 'S1',
    'Stating the intent is what makes it a decision rather than an oversight');
});

test('S1 is silent when the offset sits on a nested expression', () => {
  assertSilent(IND + 'd = request.security(syminfo.tickerid, "D", ta.sma(close, 14)[1])\nplot(d)\n', 'S1',
    'The offset can be anywhere in the expression');
});

//──────────────────────────────────────────────────────────
// S2 — ta.* inside a conditional
//──────────────────────────────────────────────────────────

test('S2 flags a ta.* call inside a ternary', () => {
  assertFlags(IND + 'v = close > open ? ta.rsi(close, 14) : na\nplot(v)\n', 'S2',
    'ta.rsi only advances when the branch is taken, so its history develops gaps');
});

test('S2 flags a ta.* call inside an if block', () => {
  assertFlags(IND + 'if close > open\n    x = ta.sma(close, 14)\n', 'S2',
    'Same defect, block form');
});

test('S2 is silent when the RESULT of an unconditional call is used in a ternary', () => {
  assertSilent(IND + 'r = ta.rsi(close, 14)\nv = close > open ? r : na\nplot(v)\n', 'S2',
    'This is the correct idiom and by far the more common shape — flagging it would be the worst kind of false positive');
});

test('S2 is silent for a ta.* call at global scope', () => {
  assertSilent(IND + 'x = ta.sma(close, 14)\nplot(x)\n', 'S2', 'Unconditional is correct');
});

//──────────────────────────────────────────────────────────
// S5 / S6 — platform limits
//──────────────────────────────────────────────────────────

test('S5 flags more than 64 plot calls', () => {
  const many = Array.from({ length: 66 }, (_, i) => `plot(close + ${i})`).join('\n');
  assertFlags(IND + many + '\n', 'S5', 'TradingView rejects a script exceeding 64 plots');
});

test('S5 is silent at exactly the limit', () => {
  const exactly = Array.from({ length: 64 }, (_, i) => `plot(close + ${i})`).join('\n');
  assertSilent(IND + exactly + '\n', 'S5', '64 is allowed; 65 is not');
});

test('S6 flags more than 40 request.*() calls', () => {
  const many = Array.from({ length: 42 }, (_, i) =>
    `v${i} = request.security(syminfo.tickerid, "D", close[1])`).join('\n');
  assertFlags(IND + many + '\nplot(v0)\n', 'S6', 'TradingView rejects more than 40 request calls');
});

test('S6 is silent for a handful of request calls', () => {
  assertSilent(IND + 'a = request.security(syminfo.tickerid, "D", close[1])\nplot(a)\n', 'S6',
    'Two calls is not forty');
});

//──────────────────────────────────────────────────────────
// S7 / S8 — global scope only
//──────────────────────────────────────────────────────────

test('S7 flags plot() inside an if block', () => {
  assertFlags(IND + 'if close > open\n    plot(close)\n', 'S7',
    'plot() must be called at global scope');
});

test('S7 flags bgcolor() inside an if block', () => {
  // Verified against the v6 reference: bgcolor throws a scope error in a local
  // scope. This check found exactly this bug in examples/indicator.2.3.pine.
  assertFlags(IND + 'if close > open\n    bgcolor(color.new(color.blue, 90))\n', 'S7',
    'bgcolor is subject to the same global-scope rule as plot');
});

test('S7 is silent for the conditional-via-na idiom', () => {
  assertSilent(IND + 'plot(close > open ? close : na)\n', 'S7',
    'This is how you plot conditionally — flagging it would break the correct pattern');
});

test('S7 is silent for a wrapped plot() with indented continuation lines', () => {
  assertSilent(IND + 'plot(close,\n    "Close",\n    color=color.blue)\n', 'S7',
    'Continuation indentation is formatting, not scope');
});

test('S8 flags a function defined inside a block', () => {
  assertFlags(IND + 'if close > open\n    f(x) =>\n        x * 2\n', 'S8',
    'Pine has no nested functions');
});

test('S8 is silent for a function at root indentation', () => {
  assertSilent(IND + 'f(x) =>\n    x * 2\nplot(f(close))\n', 'S8', 'Root scope is correct');
});

test('S8 is silent for an indented function CALL', () => {
  assertSilent(IND + 'if close > open\n    y = math.max(1, 2)\n    plot(na)\n', 'S8',
    'A call is not a definition — the => arrow is what distinguishes them');
});

//──────────────────────────────────────────────────────────
// S9 — entry without exit
//──────────────────────────────────────────────────────────

test('S9 flags a strategy that opens positions but never closes them', () => {
  assertFlags(STR + 'if close > open\n    strategy.entry("L", strategy.long)\n', 'S9',
    'An entry with no exit is unbounded risk');
});

test('S9 is silent when strategy.exit is present', () => {
  assertSilent(STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
    'if close < open\n    strategy.exit("X", from_entry="L", stop=1.0)\n', 'S9', 'Exit exists');
});

test('S9 is silent when strategy.close is present', () => {
  assertSilent(STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
    'if close < open\n    strategy.close("L")\n', 'S9', 'close is a valid exit mechanism');
});

test('S9 is silent for an indicator with no strategy calls', () => {
  assertSilent(IND + 'plot(close)\n', 'S9', 'No entries, nothing to close');
});

//──────────────────────────────────────────────────────────
// Cross-cutting
//──────────────────────────────────────────────────────────

test('every implemented check has a registry entry', () => {
  const emitted = new Set([
    ...checks(IND + 'd = request.security(syminfo.tickerid, "D", close)\nplot(d)\n'),
    ...checks(IND + 'if close > open\n    plot(close)\n'),
    ...checks(STR + 'if close > open\n    strategy.entry("L", strategy.long)\n'),
  ].map(d => d.checkId));

  for (const id of emitted) {
    assert.ok(SEMANTIC_CHECKS[id], `${id} was emitted but is not in the registry`);
  }
});

test('semantic findings carry the registry severity', () => {
  const [finding] = checks(IND + 'if close > open\n    plot(close)\n').filter(d => d.checkId === 'S7');
  assert.strictEqual(finding.severity, SEMANTIC_CHECKS.S7.severity,
    'severity must come from the registry, not be hardcoded at the call site');
});

test('a semantic finding is suppressible; a syntactic one is not', () => {
  const source = IND + 'd = request.security(syminfo.tickerid, "D", close)  // pine-ignore: S1\nplot(d)\n';
  assert.strictEqual(checks(source).filter(d => d.checkId === 'S1').length, 0,
    'S1 should be suppressed');

  const syntactic = IND + 'l = line.new(x1=1, y1=2, x2=3, y2=4, colour=color.red)  // pine-ignore\n';
  assert.ok(validatePineScript(syntactic).some(d => !d.checkId && d.severity === 0),
    'a compile error must survive any suppression directive');
});
