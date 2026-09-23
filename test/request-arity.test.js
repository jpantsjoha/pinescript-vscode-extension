/**
 * Issue #26 — the scraped entry for request.security marked only `symbol` required,
 * so request.security("X") passed arity. A missed error, not a false positive, but
 * the manual override must be proved in both directions like everything else.
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');

const IND = '//@version=6\nindicator("t")\n';
const errorsFor = (code, fn) =>
  new AccurateValidator().validate(code)
    .filter(e => e.severity === 0 && e.message.includes(`'${fn}'`))
    .map(e => e.message);

test('request.security with only a symbol is an arity error', () => {
  const errs = errorsFor(IND + 'x = request.security("FRED:WTREGEN")\nplot(x)\n', 'request.security');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /Missing required parameter\(s\).*timeframe, expression/);
});

test('request.security with symbol and timeframe still lacks the expression', () => {
  const errs = errorsFor(IND + 'x = request.security("FRED:WTREGEN", "W")\nplot(x)\n', 'request.security');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /expression/);
});

test('request.security_lower_tf with one argument is an arity error', () => {
  const errs = errorsFor(IND + 'a = request.security_lower_tf("NASDAQ:AAPL")\nplot(array.size(a))\n', 'request.security_lower_tf');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
});

test('the valid forms stay silent: minimal, full positional, named, tuple, eight positional, lower_tf', () => {
  const valid = [
    ['request.security', 'x = request.security("FRED:WTREGEN", "W", close)\nplot(x)\n'],
    ['request.security', 'x = request.security("FRED:WTREGEN", "W", close, barmerge.gaps_off, barmerge.lookahead_off, ignore_invalid_symbol=true)\nplot(x)\n'],
    ['request.security', 'x = request.security(symbol=syminfo.tickerid, timeframe="D", expression=close)\nplot(x)\n'],
    ['request.security', '[a, b] = request.security("COMEX:GC1!", "W", [close, close[12]], barmerge.gaps_off, barmerge.lookahead_off)\nplot(a - b)\n'],
    ['request.security', 'x = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_off, true, currency.USD, 500)\nplot(x)\n'],
    ['request.security_lower_tf', 'a = request.security_lower_tf(syminfo.tickerid, "1", close)\nplot(array.size(a))\n'],
    ['request.security_lower_tf', 'a = request.security_lower_tf(syminfo.tickerid, "1", close, true, currency.USD, true, 500)\nplot(array.size(a))\n'],
  ];
  for (const [fn, body] of valid) {
    const errs = errorsFor(IND + body, fn);
    assert.deepStrictEqual(errs, [], `false positive on: ${body}\n${errs.join(' | ')}`);
  }
});

// Known limit, not a claim: AccurateValidator skips arity on a call whose parens do
// not close on one line, so a WRAPPED one-argument call is still not caught. Pinned
// here so the gap is visible, not silent.
test('a wrapped one-argument request.security is not caught yet (documented gap)', () => {
  const errs = errorsFor(IND + 'x = request.security(\n     "FRED:WTREGEN")\nplot(x)\n', 'request.security');
  assert.deepStrictEqual(errs, []);
});

test('nine arguments is one too many', () => {
  const errs = errorsFor(IND + 'x = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_off, true, currency.USD, 500, 1)\nplot(x)\n', 'request.security');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /[Tt]oo many/);
});

//──────────────────────────────────────────────────────────
// request.footprint — the manual entry guessed (symbol, timeframe, …); the
// reference says (ticks_per_row, va_percent?, imbalance_percent?), chart symbol only.
//──────────────────────────────────────────────────────────

test('request.footprint valid forms are silent: one, two, three positional and named', () => {
  const valid = [
    'fp = request.footprint(10)\nplot(na(fp) ? 0 : 1)\n',
    'fp = request.footprint(10, 70)\nplot(na(fp) ? 0 : 1)\n',
    'fp = request.footprint(10, 70, 300)\nplot(na(fp) ? 0 : 1)\n',
    'fp = request.footprint(ticks_per_row=10, va_percent=70, imbalance_percent=300)\nplot(na(fp) ? 0 : 1)\n',
  ];
  for (const body of valid) {
    const errs = errorsFor(IND + body, 'request.footprint');
    assert.deepStrictEqual(errs, [], `false positive on: ${body}\n${errs.join(' | ')}`);
  }
});

test('request.footprint with no arguments is missing ticks_per_row', () => {
  const errs = errorsFor(IND + 'fp = request.footprint()\nplot(na(fp) ? 0 : 1)\n', 'request.footprint');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /ticks_per_row/);
});

test('request.footprint with four arguments is one too many', () => {
  const errs = errorsFor(IND + 'fp = request.footprint(10, 70, 300, 1)\nplot(na(fp) ? 0 : 1)\n', 'request.footprint');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /[Tt]oo many/);
});
