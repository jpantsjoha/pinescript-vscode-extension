/**
 * Named-parameter completions (issue #13).
 *
 * Inside a call's argument list the completion list must offer the function's
 * parameter names as `name=` items, drawn from the full reference
 * (PINE_FUNCTIONS_MERGED, union across overloads), excluding parameters already
 * supplied by name in the current call and parameters already filled by the
 * positional arguments before the cursor (union of per-overload remainders
 * across the overloads that can still accept that many positional args).
 * After `name=`, parameters whose values
 * come from a constant namespace (style= → shape.*, location= → location.*,
 * xloc= → xloc.*, ...) must offer those constants.
 *
 * The providers import 'vscode', so the logic lives in the vscode-free
 * src/intellisenseData.ts and is tested here against dist output.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const {
  getNamedParameterCompletions,
  getNamedArgumentValueCompletions,
} = require('../dist/src/intellisenseData.js');

function labels(items) {
  return items.map(d => d.label);
}

test('plot(close, <cursor> does not offer series= (filled positionally) but still offers title=, color=', () => {
  const line = 'plot(close, ';
  const items = getNamedParameterCompletions(line, line.length);
  const names = labels(items);
  assert.ok(!names.includes('series='), `series= is filled by the first positional arg: ${names.join(', ')}`);
  for (const p of ['title=', 'color=', 'linewidth=', 'style=']) {
    assert.ok(names.includes(p), `plot(close, ⎸ should offer ${p}, got: ${names.join(', ')}`);
  }
  // declaration order: title before color before linewidth
  assert.ok(names.indexOf('title=') < names.indexOf('color='), 'declaration order: title before color');
  assert.ok(names.indexOf('color=') < names.indexOf('linewidth='), 'declaration order: color before linewidth');
  // parameter items are fields/properties
  assert.ok(items.every(d => d.kind === 'field'), 'parameter items are kind field');
});

test('plot(<cursor> offers series= first', () => {
  const line = 'plot(';
  const names = labels(getNamedParameterCompletions(line, line.length));
  assert.strictEqual(names[0], 'series=', `plot(⎸ should offer series= first, got: ${names.join(', ')}`);
});

// Positional-slot rule: count the top-level positional arguments before the
// cursor; every overload whose signature accepts that many positional args
// still fits, and a name stays offered iff some fitting overload lists it
// beyond the filled slots (union of per-overload remainders).
test('label.new(bar_index, high, "a, b", <cursor> — union of per-overload remainders across overloads accepting 3 positional args excludes x=, y=, text=, point= but keeps xloc=', () => {
  const line = 'label.new(bar_index, high, "a, b", ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  for (const p of ['x=', 'y=', 'text=', 'point=']) {
    assert.ok(!names.includes(p), `${p} sits inside the first 3 slots of every overload that has it: ${names.join(', ')}`);
  }
  // xloc is slot 4 of the coordinate overload, so that remainder keeps it.
  for (const p of ['xloc=', 'yloc=', 'color=']) {
    assert.ok(names.includes(p), `label.new(⎸ with 3 positional args should offer ${p}, got: ${names.join(', ')}`);
  }
});

test('plotshape(cond, style=shape.circle, <cursor> does not offer style= again', () => {
  const line = 'plotshape(cond, style=shape.circle, ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  assert.ok(!names.includes('style='), `style= must not be re-offered: ${names.join(', ')}`);
  assert.ok(names.includes('title='), 'other parameters are still offered');
  assert.ok(names.includes('location='), 'other parameters are still offered');
});

test('line.new(<cursor> offers the union of both overloads (first_point= and x1=)', () => {
  const line = 'line.new(';
  const names = labels(getNamedParameterCompletions(line, line.length));
  for (const p of ['first_point=', 'second_point=', 'x1=', 'y1=', 'x2=', 'y2=', 'xloc=', 'extend=', 'color=', 'style=', 'width=']) {
    assert.ok(names.includes(p), `line.new(⎸ should offer ${p}, got: ${names.join(', ')}`);
  }
});

test('nested call: plot(ta.sma(close, <cursor> offers ta.sma parameters, not plot, and source= is filled positionally', () => {
  const line = 'plot(ta.sma(close, ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  assert.ok(!names.includes('source='), 'ta.sma source= is filled by the positional close');
  assert.ok(names.includes('length='), 'ta.sma length= offered');
  assert.ok(!names.includes('linewidth='), 'plot linewidth= must not leak into the nested call');
  assert.ok(!names.includes('style='), 'plot style= must not leak into the nested call');
});

test('inside a string argument no parameter names are offered', () => {
  const line = 'plotshape(cond, "te';
  assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), []);
});

test('outside a call no parameter names are offered', () => {
  const line = 'x = close + ';
  assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), []);
});

test('after plotshape(cond, style= the shape.* constants are offered', () => {
  const line = 'plotshape(cond, style=';
  const items = getNamedArgumentValueCompletions(line, line.length);
  const names = labels(items);
  for (const c of ['shape.circle', 'shape.triangleup', 'shape.square']) {
    assert.ok(names.includes(c), `style= should offer ${c}, got: ${names.join(', ')}`);
  }
  assert.ok(items.every(d => d.kind === 'constant'), 'constant items are kind constant');
});

test('after plotshape(cond, location= the location.* constants are offered', () => {
  const line = 'plotshape(cond, location=';
  const names = labels(getNamedArgumentValueCompletions(line, line.length));
  assert.ok(names.includes('location.abovebar'), 'location.abovebar offered');
  assert.ok(names.includes('location.belowbar'), 'location.belowbar offered');
});

test('after plot(close, linestyle= the hline/line style_* constants are offered', () => {
  const line = 'plot(close, linestyle=';
  const names = labels(getNamedArgumentValueCompletions(line, line.length));
  assert.ok(names.includes('line.style_solid'), 'line.style_solid offered');
  assert.ok(names.includes('hline.style_dashed'), 'hline.style_dashed offered');
});

test('after line.new(a, b, xloc= the xloc.* constants are offered', () => {
  const line = 'line.new(a, b, xloc=';
  const names = labels(getNamedArgumentValueCompletions(line, line.length));
  assert.ok(names.includes('xloc.bar_index'), 'xloc.bar_index offered');
  assert.ok(names.includes('xloc.bar_time'), 'xloc.bar_time offered');
});

test('after display= the display.* constants are offered', () => {
  const line = 'plot(close, display=';
  const names = labels(getNamedArgumentValueCompletions(line, line.length));
  assert.ok(names.includes('display.all'), 'display.all offered');
  assert.ok(names.includes('display.none'), 'display.none offered');
});

test('a name= that is not a parameter of the open call offers no constants', () => {
  const line = 'plot(close, bogus=';
  assert.deepStrictEqual(getNamedArgumentValueCompletions(line, line.length), []);
});

test('an assignment outside a call offers no constants', () => {
  const line = 'style=';
  assert.deepStrictEqual(getNamedArgumentValueCompletions(line, line.length), []);
});

// ── PR #51 independent review findings ──────────────────────────────
// Each test names the finding it reproduces; every one failed on the
// reviewed head before the fix.

const {
  isNamedArgumentValuePosition,
  getTriggerCharacterCompletions,
} = require('../dist/src/intellisenseData.js');

// Finding 1: a parameter must be offered only if it remains unfilled in at
// least one overload that can still accept the positional count given.
// Overloads disqualified by the positional count must not leak their
// parameters into the list.
test('finding 1: timestamp(2023, 1, 1, ⎸ does not offer dateString= from the disqualified 1-arg overload', () => {
  const line = 'timestamp(2023, 1, 1, ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  assert.ok(!names.includes('dateString='), `dateString= belongs to an overload that takes 1 arg: ${names.join(', ')}`);
  assert.ok(!names.includes('year=') && !names.includes('month=') && !names.includes('timezone='), `timezone/year/month are filled in every fitting overload: ${names.join(', ')}`);
  // day= survives via the timezone overload (slot 4 there), hour= via both.
  assert.ok(names.includes('day=') && names.includes('hour='), `day=/hour= remain unfilled in a fitting overload: ${names.join(', ')}`);
});

test('finding 1: line.new with 9 positional args does not offer first_point=/second_point= from the disqualified 8-param overload', () => {
  const line = 'line.new(1, 2, 3, 4, xloc.bar_index, extend.none, color.red, line.style_solid, 2, ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  for (const p of ['first_point=', 'second_point=', 'x1=', 'y1=', 'x2=', 'y2=', 'xloc=', 'extend=', 'color=', 'style=', 'width=']) {
    assert.ok(!names.includes(p), `${p} is filled in every overload that accepts 9 positional args: ${names.join(', ')}`);
  }
  assert.ok(names.includes('force_overlay='), `force_overlay= is the one remaining slot: ${names.join(', ')}`);
});

// Finding 2: with the cursor directly after `name =` (optional spaces) a
// value goes there — parameter names must not be offered.
test('finding 2: after `name = ` inside a call no parameter names are offered', () => {
  for (const line of ['plot(title = ', 'plot(title=', 'ta.sma(length = ', 'plot(close, color = ']) {
    assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), [], `${line}⎸ must offer no parameter names`);
  }
});

test('finding 2: isNamedArgumentValuePosition is true only after `name =` inside a call', () => {
  for (const line of ['plot(title = ', 'plot(title=', 'plot(close, xloc =']) {
    assert.ok(isNamedArgumentValuePosition(line, line.length), `${line}⎸ is a value position`);
  }
  for (const line of ['x = ', 'var int a = ', 'plot(close == ', 'plot(close, ', '// plot(title = ']) {
    assert.ok(!isNamedArgumentValuePosition(line, line.length), `${line}⎸ is not a value position`);
  }
});

test('finding 2: constants are still offered after `name= ` with trailing spaces', () => {
  const line = 'plotshape(cond, style= ';
  const names = labels(getNamedArgumentValueCompletions(line, line.length));
  assert.ok(names.includes('shape.circle'), `style= with a trailing space should offer shape.circle: ${names.join(', ')}`);
});

// Finding 3: when the suggest widget is triggered by '(' or ',', the provider
// must return ONLY named-parameter or constant-value items — never the global
// list. The vscode-free policy lives in getTriggerCharacterCompletions; the
// extension returns its result (empty or not) on those triggers.
test('finding 3: trigger-character completions are empty outside a call argument list', () => {
  for (const line of ['[a, ', 'arr = [1, ', 'x = (a + b, ', 'var int a = 1, ', 'map<string, ', 'f(x, ', '// plot(close, ', '// Note, ']) {
    assert.deepStrictEqual(getTriggerCharacterCompletions(line, line.length), [], `${line}⎸ on ','/'(' trigger must offer nothing`);
  }
});

test('finding 3: trigger-character completions inside a call offer named parameters', () => {
  const line = 'plot(close, ';
  const names = labels(getTriggerCharacterCompletions(line, line.length));
  assert.ok(names.includes('title=') && !names.includes('series='), `plot(close, ⎸ on ',' trigger: ${names.join(', ')}`);
  const open = 'plot(';
  assert.ok(labels(getTriggerCharacterCompletions(open, open.length)).includes('series='), `plot(⎸ on '(' trigger offers series=`);
});

// Finding 4: an unmatched '[' at depth 0 means the cursor is inside an array
// literal or subscript, not at the call's top-level parameter list.
test('finding 4: inside an array literal or subscript within a call nothing is offered', () => {
  for (const line of ['plot([1, ', 'matrix.get(m, [0, ']) {
    assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), [], `${line}⎸ is inside '[', not the parameter list`);
    assert.deepStrictEqual(getTriggerCharacterCompletions(line, line.length), [], `${line}⎸ trigger must offer nothing`);
  }
  // A closed subscript as an argument is still the call's parameter list.
  const ok = 'plot(a[0], ';
  assert.ok(labels(getNamedParameterCompletions(ok, ok.length)).includes('title='), `${ok}⎸ still offers plot parameters`);
});

// Finding 5: an unquoted '//' starts a comment to end of line; like strings,
// comments must blank everything that follows.
test('finding 5: inside a // comment nothing is offered', () => {
  for (const line of ['// plot(close, ', '// Note, ', '  // plotshape(cond, style=']) {
    assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), [], `${line}⎸ is inside a comment`);
  }
  const commented = '// plotshape(cond, style=';
  assert.deepStrictEqual(getNamedArgumentValueCompletions(commented, commented.length), [], 'constants are not offered inside a comment');
  // '//' inside a string is not a comment.
  const str = 'plot(str.contains(close, "http://"), ';
  assert.ok(labels(getNamedParameterCompletions(str, str.length)).includes('title='), `"//" inside a string is not a comment: ${str}⎸`);
});

// Finding 6: a line that is `name(`, `method name(`, or `export name(` from
// the statement start (no `=` before the paren) is a function/method
// definition head once `=>` exists on the line — its parameter list is not a
// call, so nothing is offered. Without `=>` the line is treated as a call:
// `plot(close,` is indistinguishable from a definition head until the `=>`
// is typed (documented rule).
test('finding 6: function/method definition heads with => on the line offer nothing', () => {
  assert.deepStrictEqual(getNamedParameterCompletions('plot(x, ) => x', 'plot(x, '.length), [], 'definition head plot(x, ⎸) => x');
  assert.deepStrictEqual(getNamedParameterCompletions('method plot(t, ) => t', 'method plot(t, '.length), [], 'method definition head');
  assert.deepStrictEqual(getNamedParameterCompletions('export plot(x, ) => x', 'export plot(x, '.length), [], 'export definition head');
  assert.deepStrictEqual(getNamedArgumentValueCompletions('plot(a = ) => a', 'plot(a = '.length), [], 'no constants in a definition head');
});

test('finding 6: a `name(` line WITHOUT => is treated as a call (documented rule)', () => {
  const line = 'plot(x, ';
  assert.ok(labels(getNamedParameterCompletions(line, line.length)).includes('title='), `${line}⎸ has no => so it is a call`);
  // A call in a definition BODY is still a call.
  const body = 'f(x) => plot(x, ';
  assert.ok(labels(getNamedParameterCompletions(body, body.length)).includes('title='), `${body}⎸ is a call in the body`);
});

// Finding 8: constant value completions must survive a typed prefix. VS Code
// filters the offered items by the word range; the data layer must still
// return the namespace constants once any characters follow `name=`.
test('finding 8: a typed prefix after name= still offers the namespace constants', () => {
  for (const line of ['plotshape(close, style=sh', 'plotshape(close, style=shape.ci']) {
    const names = labels(getNamedArgumentValueCompletions(line, line.length));
    assert.ok(names.includes('shape.circle'), `${line}⎸ should offer shape.circle, got: ${names.join(', ')}`);
    assert.ok(names.includes('shape.triangleup'), `${line}⎸ should offer shape.triangleup, got: ${names.join(', ')}`);
  }
  // A fully typed value still counts (the user may re-trigger suggest).
  const full = 'plotshape(close, style=shape.circle';
  assert.ok(labels(getNamedArgumentValueCompletions(full, full.length)).includes('shape.circle'), 'fully typed value still offers constants');
});

test('finding 8: a typed value prefix is still a value position — no parameter names offered', () => {
  const line = 'plotshape(close, style=sh';
  assert.ok(isNamedArgumentValuePosition(line, line.length), `${line}⎸ is a value position`);
  assert.deepStrictEqual(getNamedParameterCompletions(line, line.length), [], `${line}⎸ must not offer parameter names`);
});

test('finding 8: == / => comparisons are never a value position, even with a prefix', () => {
  for (const line of ['plot(close == sh', 'plot(close, x == 1', 'f(x) => x']) {
    assert.ok(!isNamedArgumentValuePosition(line, line.length), `${line}⎸ is not a name= value position`);
  }
});

// Finding 9: STYLE_CONSTANT_NAMESPACES must only map functions that actually
// take a `style` parameter in the v6 reference. plotchar takes
// char/location/size and plotarrow takes colorup/colordown/minheight/
// maxheight — neither takes style, so neither may map style= to shape.*.
test('finding 9: every style= mapping is backed by a style parameter in the v6 reference', () => {
  const { STYLE_CONSTANT_NAMESPACES, getParameterInfo } = require('../dist/src/intellisenseData.js');
  assert.ok(STYLE_CONSTANT_NAMESPACES, 'STYLE_CONSTANT_NAMESPACES must be exported so the mappings can be audited');
  for (const fn of Object.keys(STYLE_CONSTANT_NAMESPACES)) {
    assert.ok(
      getParameterInfo(fn).some(p => p.name === 'style'),
      `${fn} is mapped for style= but the v6 reference lists no style parameter for it`,
    );
  }
});

test('finding 9: plotchar/plotarrow are not in the style= map (reference has no style parameter for them)', () => {
  const { STYLE_CONSTANT_NAMESPACES, getParameterInfo } = require('../dist/src/intellisenseData.js');
  assert.ok(!getParameterInfo('plotchar').some(p => p.name === 'style'), 'reference check: plotchar has no style parameter');
  assert.ok(!getParameterInfo('plotarrow').some(p => p.name === 'style'), 'reference check: plotarrow has no style parameter');
  assert.ok(STYLE_CONSTANT_NAMESPACES && !('plotchar' in STYLE_CONSTANT_NAMESPACES), 'plotchar must not map style= to shape.*');
  assert.ok(STYLE_CONSTANT_NAMESPACES && !('plotarrow' in STYLE_CONSTANT_NAMESPACES), 'plotarrow must not map style= to shape.*');
});

test('finding 9: plotchar(…, style= and plotarrow(…, style= offer no shape.* constants', () => {
  for (const line of ['plotchar(close, style=', 'plotchar(close, style=sh', 'plotarrow(close, style=', 'plotarrow(close, style=sh']) {
    assert.deepStrictEqual(getNamedArgumentValueCompletions(line, line.length), [], `${line}⎸ must offer nothing — no style parameter`);
  }
});

// Finding 10: REFERENCE is static, so getParameterInfo(functionName) must be
// memoized — repeat calls return the identical array, no re-parsing.
test('finding 10: getParameterInfo is memoized per function name', () => {
  const { getParameterInfo } = require('../dist/src/intellisenseData.js');
  assert.strictEqual(getParameterInfo('plot'), getParameterInfo('plot'), 'repeat calls return the identical (cached) array');
  assert.strictEqual(getParameterInfo('no.such.function'), getParameterInfo('no.such.function'), 'the empty result is cached too');
});

// Finding 10: per-keystroke budget. 1,000 completions on a typical line must
// stay far below a frame; a generous 200 ms bound only trips on a real
// regression (baseline before the regex/memoization fixes: ~10 ms).
test('finding 10: 1,000 getNamedParameterCompletions calls finish well under 200 ms', () => {
  const line = 'plot(close, title="t", ';
  for (let i = 0; i < 100; i++) getNamedParameterCompletions(line, line.length); // warm up
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 1000; i++) getNamedParameterCompletions(line, line.length);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 200, `1,000 calls took ${ms.toFixed(1)} ms (bound: 200 ms)`);
});
