/**
 * Named-parameter completions (issue #13).
 *
 * Inside a call's argument list the completion list must offer the function's
 * parameter names as `name=` items, drawn from the full reference
 * (PINE_FUNCTIONS_MERGED, union across overloads), excluding parameters already
 * supplied by name in the current call. After `name=`, parameters whose values
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

test('plot(close, <cursor> offers title=, color=, linewidth=, style=', () => {
  const line = 'plot(close, ';
  const items = getNamedParameterCompletions(line, line.length);
  const names = labels(items);
  for (const p of ['series=', 'title=', 'color=', 'linewidth=', 'style=']) {
    assert.ok(names.includes(p), `plot(close, ⎸ should offer ${p}, got: ${names.join(', ')}`);
  }
  // declaration order: series first, title before color before linewidth
  assert.ok(names.indexOf('series=') < names.indexOf('title='), 'declaration order: series before title');
  assert.ok(names.indexOf('title=') < names.indexOf('color='), 'declaration order: title before color');
  assert.ok(names.indexOf('color=') < names.indexOf('linewidth='), 'declaration order: color before linewidth');
  // parameter items are fields/properties
  assert.ok(items.every(d => d.kind === 'field'), 'parameter items are kind field');
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

test('nested call: plot(ta.sma(close, <cursor> offers ta.sma parameters, not plot', () => {
  const line = 'plot(ta.sma(close, ';
  const names = labels(getNamedParameterCompletions(line, line.length));
  assert.ok(names.includes('source='), 'ta.sma source= offered');
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
