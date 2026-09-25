/**
 * Issue #12 — declared type vs a direct `input.*()` call (`checkInputDeclarationTypes`).
 *
 * The regression corpus asserts the rule end to end on correct scripts. This file
 * pins the rule's own contract, filtered to its own message so unrelated checks
 * cannot mask or fake a result:
 *   - every hard-coded return type, both directions;
 *   - expressions continued on a deeper-indented next line stay silent (review
 *     blocker on PR #57), with CRLF too, and those fixtures are valid Pine that the
 *     complete validator reports no error on;
 *   - a same-indent next line is a new statement and never hides the error;
 *   - comma-separated segments are judged one by one, and continuation only
 *     silences the LAST segment;
 *   - documented misses (const, `=>` bodies) stay misses, never guesses;
 *   - one exact message / severity / range assertion for the #12 repro.
 * It runs against the single engine the extension ships (dist/engine, #55).
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');

const ENGINE = require('../dist/engine/src/accurateValidator.js').AccurateValidator;
// The complete engine: AccurateValidator + documentChecks + semantic checks.
const { validatePineScript } = require('../dist/engine/index.js');

const H = '//@version=6\nindicator("t")\n';
const RULE = /^Cannot assign "input\./;

function castFindings(Validator, body, eol = '\n') {
  const code = (H + body).replace(/\n/g, eol);
  return new Validator().validate(code).filter(d => RULE.test(d.message));
}

// [function, the type it returns, a declared type it cannot be assigned to]
const RETURNS = [
  ['int', 'int', 'bool'],
  ['float', 'float', 'int'],
  ['bool', 'bool', 'int'],
  ['color', 'color', 'string'],
  ['string', 'string', 'color'],
  ['text_area', 'string', 'bool'],
  ['timeframe', 'string', 'int'],
  ['session', 'string', 'float'],
  ['symbol', 'string', 'color'],
  ['source', 'float', 'int'],
  ['price', 'float', 'int'],
  ['time', 'int', 'string'],
];

const FLAG = [
  ['#12 repro', 'int factor = input.float(0.7, "Factor")\nplot(factor)'],
  ['int from input.price', 'int p = input.price(1.0)\nplot(p)'],
  ['varip', 'varip int x = input.float(1.0)\nplot(x)'],
  ['var', 'var int x = input.float(1.0)\nplot(x)'],
  ['simple qualifier', 'simple int x = input.float(1.0)\nplot(x)'],
  ['named arguments with = inside', 'int x = input.float(defval = 1.0, title = "x")\nplot(x)'],
  ['wrapped call', 'int factor = input.float(0.7,\n     "Factor",\n     minval = 0.1)\nplot(factor)'],
  ['trailing comment', 'int x = input.float(1.0) // note\nplot(x)'],
  ['last line of the file', 'plot(close)\nint x = input.float(1.0)'],
  ['next line at the same indent', 'if barstate.islast\n    int x = input.float(1.0)\n    plot(x)'],
  ['first comma segment', 'int x = input.float(1), int y = 2\nplot(x)'],
  ['second comma segment', 'int y = 2, int x = input.float(1)\nplot(x)'],
  // Delta review of be96ffb: a next line at the SAME indent is a new statement,
  // whatever token it starts with, so it cannot hide the error.
  ['a global tuple declaration follows at column 0',
    'int factor = input.float(0.7)\n[a, b] = [1, 2]\nplot(factor + a + b)'],
  ['a same-indent `-y` return follows in a function body',
    'f(y) =>\n    int factor = input.float(0.7)\n    -y\nplot(f(1))'],
  ['a same-indent `(` statement follows', 'int factor = input.float(0.7)\n(close > open) ? 1 : 0\nplot(factor)'],
];

const SILENT = [
  ['float from input.time (int casts to float)', 'float t = input.time(0)\nplot(t)'],
  ['float from input.int', 'float f = input.int(1)\nplot(f)'],
  ['series float from input.source', 'series float s = input.source(close)\nplot(s)'],
  ['untyped', 'x = input.float(1)\nplot(x)'],
  [':= reassignment', 'float x = 0.0\nx := input.float(1)\nplot(x)'],
  ['generic declared type', 'array<int> a = input.int(1)\nplot(close)'],
  ['UDT declared type', 'type T\n    int v\nT t = input.int(1)\nplot(close)'],
  ['default parameter', 'f(int n = 1) => n\nint x = f(input.int(1))\nplot(x)'],
  ['default parameter with an input call', 'f(int n = input.float(1)) => n\nplot(f())'],
  ['one-line function body (documented miss)', 'f() => int x = input.float(1), x\nplot(f())'],
  ['const declaration (documented miss)', 'const int x = input.float(1)\nplot(x)'],
  ['`input` is not a writable qualifier', 'input int x = input.float(1)\nplot(x)'],
  ['comma segment with a valid cast', 'float a = input.int(1), int b = 2\nplot(a)'],
  ['bare input()', 'int x = input(5)\nplot(x)'],
  ['input.enum', 'enum E\n    a\n    b\nint x = input.enum(E.a)\nplot(close)'],
  ['wrapped in math.round', 'int n = math.round(input.float(1.5))\nplot(n)'],
  ['operator on the same line', 'float x = input.string("1") == "1" ? 1.0 : 0.0\nplot(x)'],
  ['field in a type block', 'type Cfg\n    int x = input.float(1)\nplot(close)'],
  ['in a comment', '// int x = input.float(1)\nplot(close)'],
  ['in a string', 's = "int x = input.float(1)"\nplot(close)'],
];

// Review blocker on PR #57: the call closes its brackets, yet the expression
// continues on the next line. Continuation is decided by indentation alone
// (script-structure#line-wrapping). Every fixture here is VALID Pine: the complete
// validator (AccurateValidator + documentChecks + semantic checks) must report no
// error at all, not merely no #12 finding.
const CONTINUED = [
  ['continued with ==', 'bool enabled = input.string("On")\n  == "On"\nplot(enabled ? close : na)'],
  ['continued with a ternary', 'int n = input.bool(true)\n  ? 1 : 0\nplot(n)'],
  ['continued with ? then :', 'int n = input.bool(true)\n  ? 1\n  : 0\nplot(n)'],
  ['continued with : on the wrapped line', 'int n = input.bool(true) ? 1\n  : 0\nplot(n)'],
  ['continued with a method call',
    'method asString(float self) => str.tostring(self)\nstring s = input.float(1.5)\n  .asString()\nplot(close)'],
  ['continued with == and and', 'bool b = input.string("x")\n  == "x" and close > open\nplot(b ? 1 : 0)'],
  ['continued with a comparison and ternary', 'string s = input.int(1)\n  > 0 ? "a" : "b"\nplot(close)'],
  ['continued with a history reference', 'bool b = input.int(1)\n  [1] > 0\nplot(b ? 1 : 0)'],
  ['continued after a trailing comment', 'bool b = input.string("x") // why\n  == "x"\nplot(b ? 1 : 0)'],
  ['continued at a 5-space indent', 'string s = input.int(1)\n     > 0 ? "a" : "b"\nplot(close)'],
  ['last segment continued, earlier segment valid',
    'float a = input.int(1), bool enabled = input.string("On")\n  == "On"\nplot(enabled ? a : na)'],
];

for (const [label, Validator] of [['engine', ENGINE]]) {
  describe(`#12 cast rule — ${label}`, () => {
    for (const [fn, returns, wrong] of RETURNS) {
      test(`${returns} ${fn} ← input.${fn}() is silent`, () => {
        assert.deepStrictEqual(castFindings(Validator, `${returns} v = input.${fn}(na)\nplot(close)`), []);
      });
      test(`${wrong} ← input.${fn}() (${returns}) is flagged`, () => {
        const found = castFindings(Validator, `${wrong} v = input.${fn}(na)\nplot(close)`);
        assert.strictEqual(found.length, 1);
        assert.ok(found[0].message.includes(`"input.${fn}" (${returns})`), found[0].message);
        assert.ok(found[0].message.includes(`declared "${wrong}"`), found[0].message);
      });
    }

    for (const eol of ['\n', '\r\n']) {
      const tag = eol === '\n' ? 'LF' : 'CRLF';
      for (const [name, body] of FLAG) {
        test(`flags (${tag}): ${name}`, () => {
          assert.strictEqual(castFindings(Validator, body, eol).length, 1);
        });
      }
      for (const [name, body] of SILENT) {
        test(`silent (${tag}): ${name}`, () => {
          assert.deepStrictEqual(castFindings(Validator, body, eol), []);
        });
      }
      for (const [name, body] of CONTINUED) {
        test(`silent, no error from the full validator (${tag}): ${name}`, () => {
          assert.deepStrictEqual(castFindings(Validator, body, eol), []);
          const code = (H + body).replace(/\n/g, eol);
          const errors = [
            ...new Validator().validate(code),
            ...validatePineScript(code),
          ].filter(d => d.severity === 0);
          assert.deepStrictEqual(errors, []);
        });
      }
      test(`segment-local (${tag}): a continued LAST segment does not hide an earlier one`, () => {
        const found = castFindings(Validator,
          'int x = input.float(1), bool enabled = input.string("On")\n  == "On"\nplot(enabled ? x : na)', eol);
        assert.strictEqual(found.length, 1);
        assert.strictEqual(found[0].line, 3);
        assert.strictEqual(found[0].column, 'int x = '.length);
        assert.ok(found[0].message.includes('"input.float" (float)'), found[0].message);
      });
    }

    test('the #12 repro: exact message, severity and range on the input.float token', () => {
      const found = castFindings(Validator, 'int factor = input.float(0.7, "Factor")\nplot(factor)');
      assert.deepStrictEqual(found, [{
        line: 3,
        column: 13,
        length: 'input.float'.length,
        severity: 0,
        message:
          'Cannot assign "input.float" (float) to a variable declared "int". ' +
          'Pine never casts float to int automatically: declare it "float", use input.int(), ' +
          'or wrap the call in int() or math.round().',
      }]);
    });

    test('a later comma segment reports its own column', () => {
      const found = castFindings(Validator, 'int y = 2, int x = input.float(1)\nplot(x)');
      assert.strictEqual(found[0].line, 3);
      assert.strictEqual(found[0].column, 'int y = 2, int x = '.length);
    });
  });
}
