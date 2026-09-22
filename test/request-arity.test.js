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

test('the valid forms stay silent: minimal, full positional, named, tuple, wrapped', () => {
  const valid = [
    'x = request.security("FRED:WTREGEN", "W", close)\nplot(x)\n',
    'x = request.security("FRED:WTREGEN", "W", close, barmerge.gaps_off, barmerge.lookahead_off, ignore_invalid_symbol=true)\nplot(x)\n',
    'x = request.security(symbol=syminfo.tickerid, timeframe="D", expression=close)\nplot(x)\n',
    '[a, b] = request.security("COMEX:GC1!", "W", [close, close[12]], barmerge.gaps_off, barmerge.lookahead_off)\nplot(a - b)\n',
    'x = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_off, true, currency.USD, 500)\nplot(x)\n',
    'a = request.security_lower_tf(syminfo.tickerid, "1", close)\nplot(array.size(a))\n',
  ];
  for (const body of valid) {
    const errs = errorsFor(IND + body, 'request.security');
    assert.deepStrictEqual(errs, [], `false positive on: ${body}\n${errs.join(' | ')}`);
  }
});

test('nine arguments is one too many', () => {
  const errs = errorsFor(IND + 'x = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_off, true, currency.USD, 500, 1)\nplot(x)\n', 'request.security');
  assert.strictEqual(errs.length, 1, errs.join(' | '));
  assert.match(errs[0], /[Tt]oo many/);
});
