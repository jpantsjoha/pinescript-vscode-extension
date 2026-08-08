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

// Indentation is not conditionality. A user-defined function body is indented for
// SCOPE, and `ta.*` inside one is the normal way to write a reusable helper — it
// runs whenever the function is called. Flagging it fired on real working scripts
// (examples/global-liquidity.v6.pine:41), which is the false-positive class this
// project holds to be worse than a miss.

test('S2 is silent for a ta.* call in a user-defined function body', () => {
  assertSilent(IND + 'f_norm(x, n) =>\n    ma = ta.sma(x, n)\n    na(ma) ? na : x / ma\nplot(f_norm(close, 20))\n',
    'S2', 'A function body is indented for scope, not for branching');
});

test('S2 is silent for a ta.* call in a method body', () => {
  assertSilent(IND + 'method smooth(float x) =>\n    ta.sma(x, 5)\nplot(close.smooth())\n',
    'S2', 'Methods are function definitions too');
});

test('S2 is silent for a ta.* call in an exported function body', () => {
  assertSilent(IND + 'export f(float x) =>\n    ta.rsi(x, 14)\nplot(close)\n',
    'S2', 'export is a modifier on a definition, not a branch');
});

test('S2 still flags a ta.* call inside an if NESTED in a function', () => {
  assertFlags(IND + 'f(x) =>\n    if x > 0\n        ta.sma(x, 5)\nplot(f(close))\n',
    'S2', 'The nearest enclosing block is the if — the function around it is irrelevant');
});

test('S2 flags a ta.* call inside a for body', () => {
  assertFlags(IND + 'var float v = 0.0\nfor i = 0 to 2\n    v := ta.ema(close, 20)\nplot(v)\n',
    'S2', 'Loop iterations are not bars — calling ta.* n times per bar corrupts its state');
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
// S3 — accumulator lifetime
//
// Found in the field on 2026-08-08: every layer of this system read
// examples/test-v6-features.pine and none of them noticed that a `var` total was
// being re-accumulated on every bar. The original S3 spec covered only the opposite
// shape (an accumulator MISSING `var`), which is the cheaper of the two — it
// produces a visibly constant series. This one produces a plausible number that
// drifts, which is the defect that survives a backtest.
//──────────────────────────────────────────────────────────

test('S3 flags a var total re-accumulated by a for loop every bar', () => {
  assertFlags(IND + 'var float sum = 0.0\nfor i = 0 to 9\n    sum := sum + close[i]\nplot(sum)\n',
    'S3', 'var persists across bars, so this adds ten more closes on every bar, forever');
});

test('S3 flags a var counter whose while loop can never run again', () => {
  assertFlags(IND + 'var int counter = 0\nwhile counter < 5\n    counter += 1\nplot(counter)\n',
    'S3', 'On bar 2 counter is already 5 and the loop body is dead');
});

test('S3 is silent when the per-bar total correctly omits var', () => {
  assertSilent(IND + 'float sum = 0.0\nfor i = 0 to 9\n    sum += close[i]\nplot(sum)\n',
    'S3', 'No var means it resets each bar — which is exactly what a per-bar total wants');
});

test('S3 is silent when the accumulator is reset before the loop', () => {
  assertSilent(IND + 'var float sum = 0.0\nsum := 0.0\nfor i = 0 to 9\n    sum += close[i]\nplot(sum)\n',
    'S3', 'A var reused as a buffer is correct provided it is cleared every bar');
});

test('S3 is silent for run-once initialisation on the first bar', () => {
  assertSilent(IND + 'var float seed = 0.0\nif barstate.isfirst\n    for i = 0 to 9\n        seed += close[i]\nplot(seed)\n',
    'S3', 'Building a table on bar one is the legitimate reason to accumulate into a var');
});

test('S3 is silent for a genuine running total outside any loop', () => {
  assertSilent(IND + 'var float total = 0.0\ntotal := total + volume\nplot(total)\n',
    'S3', 'Cumulative volume is the textbook correct use of var — flagging it would be absurd');
});

test('S3 does not fire merely because a var and a loop coexist', () => {
  assertSilent(IND + 'var float sum = 0.0\nfor i = 0 to 9\n    x = close[i]\nplot(sum)\n',
    'S3', 'The loop must actually assign the accumulator to itself');
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

//──────────────────────────────────────────────────────────
// Coverage gaps found by an adversarial review of the shipped 0.2.0 engine.
// Each check "worked" on its happy path and missed a common real-world shape.
//──────────────────────────────────────────────────────────

test('S1 flags a MULTI-LINE request.security', () => {
  // 0.2.0 bailed on any call whose parens did not close on one line, with a
  // comment claiming it was "assessed on its own line". Nothing assessed it.
  // Wrapping is the common formatting for this function, so most real calls
  // escaped the check entirely.
  assertFlags(
    IND + 'd = request.security(syminfo.tickerid,\n     "D",\n     close)\nplot(d)\n',
    'S1', 'A wrapped call repaints exactly as much as a single-line one');
});

test('S1 is silent on a multi-line call that uses an offset', () => {
  assertSilent(
    IND + 'd = request.security(syminfo.tickerid,\n     "D",\n     close[1])\nplot(d)\n',
    'S1', 'Joining lines must not lose the [1]');
});

test('S2 flags a ta.* call in the FALSE branch of a ternary', () => {
  // 0.2.0 required no ':' between the '?' and the call, so only the true branch
  // was checked. Both branches are conditional and both corrupt history.
  assertFlags(IND + 'v = close > open ? na : ta.sma(close, 14)\nplot(v)\n', 'S2',
    'The false branch is just as conditional as the true one');
});

test('S9 does not accept strategy.cancel as an exit', () => {
  // `cancel` withdraws a PENDING ORDER; it does not close an open position.
  // Treating it as an exit let a strategy with genuinely unbounded risk pass.
  assertFlags(
    STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
          'if close < open\n    strategy.cancel("L")\n',
    'S9', 'Cancelling an order is not closing a position');
});

test('S9 still accepts close_all as an exit', () => {
  assertSilent(
    STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
          'if close < open\n    strategy.close_all()\n',
    'S9', 'close_all genuinely flattens the position');
});
