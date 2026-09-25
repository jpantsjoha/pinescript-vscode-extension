/**
 * Quick fixes (issue #49): every action is applied to the source and the result
 * RE-VALIDATED through all three diagnostic sources, exactly as the golden corpus
 * gate does. A fix passes only when the diagnostic it answers is gone AND no
 * diagnostic appears that was not there before.
 *
 * Each positive case also runs with CRLF line endings, and the wrapped cases are
 * indented with tabs, so an off-by-one on '\r' or a tab shows up as a failure.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');
const { runDocumentChecks } = require('../dist/src/parser/documentChecks.js');
const {
  runSemanticChecks,
  extractSuppressions,
  applySuppressions,
} = require('../packages/validator/dist/index.js');
const { computeQuickFixes, applyEdits, suggestMember } = require('../dist/src/quickFixData.js');

/** All three sources, shaped as the extension shapes them (0-based ranges, checkId in `code`). */
function diagnostics(source) {
  const raw = [
    ...new AccurateValidator().validate(source),
    ...runDocumentChecks(source),
    ...applySuppressions(runSemanticChecks(source), extractSuppressions(source)),
  ];
  return raw.map(e => ({
    range: {
      start: { line: e.line - 1, character: e.column },
      end: { line: e.line - 1, character: e.column + (e.length || 1) },
    },
    message: e.message,
    code: e.checkId,
  }));
}

const key = d => `${d.code || ''}|${d.message}`;

/** Actions offered for the whole document, as the lightbulb would see them. */
function fixesFor(source) {
  const diags = diagnostics(source);
  return { diags, fixes: computeQuickFixes(source, diags) };
}

/**
 * Apply the action titled `title` for the diagnostic matching `target`; assert the
 * diagnostic is gone, nothing new appeared, and (optionally) the exact output.
 */
function assertFix(source, target, title, expected) {
  for (const eol of ['\n', '\r\n']) {
    const src = source.replace(/\n/g, eol);
    const { diags, fixes } = fixesFor(src);
    const targetDiag = diags.find(target);
    assert.ok(targetDiag, `[${JSON.stringify(eol)}] the diagnostic under test is reported`);
    const fix = fixes.find(f => f.title === title && diags[f.diagnosticIndex] === targetDiag);
    assert.ok(fix, `[${JSON.stringify(eol)}] action "${title}" offered; got: ${fixes.map(f => f.title).join(' | ')}`);

    const out = applyEdits(src, fix.edits);
    if (expected !== undefined) assert.strictEqual(out, expected.replace(/\n/g, eol));
    if (eol === '\r\n') assert.ok(!/[^\r]\n/.test(out), 'CRLF preserved: no bare LF introduced');

    const after = diagnostics(out);
    assert.ok(!after.some(d => key(d) === key(targetDiag)),
      `[${JSON.stringify(eol)}] diagnostic gone after the fix; still: ${key(targetDiag)}`);
    const before = new Set(diags.map(key));
    const fresh = after.filter(d => !before.has(key(d)));
    assert.deepStrictEqual(fresh.map(key), [], `[${JSON.stringify(eol)}] no new diagnostic after the fix`);
  }
}

const titles = source => fixesFor(source).fixes.map(f => f.title);
const HEAD = '//@version=6\nindicator("qf", overlay=true)\n';
const byMessage = re => d => re.test(d.message);
const byCheck = id => d => d.code === id;

//──────────────────────────────────────────────────────────
// 1. Misspelled constant
//──────────────────────────────────────────────────────────

test('misspelled constant: color.purplee -> color.purple', () => {
  assertFix(`${HEAD}plot(close, color=color.purplee)\n`,
    byMessage(/Unknown color constant or function 'purplee'/), 'Change to color.purple',
    `${HEAD}plot(close, color=color.purple)\n`);
});

test('misspelled constant: plot.style_lnie inside a tab-indented wrapped call', () => {
  assertFix(`${HEAD}plot(close,\n\t style=plot.style_lnie)\n`,
    byMessage(/Unknown plot constant or function 'style_lnie'/), 'Change to plot.style_line',
    `${HEAD}plot(close,\n\t style=plot.style_line)\n`);
});

test('misspelled constant: no action when nothing is close (color.xyzzy)', () => {
  const src = `${HEAD}plot(close, color=color.xyzzy)\n`;
  assert.ok(diagnostics(src).some(byMessage(/'xyzzy'/)), 'diagnostic present');
  assert.deepStrictEqual(titles(src), []);
});

test('misspelled constant: no action when two members are equally plausible (color.gren: green, red)', () => {
  const src = `${HEAD}plot(close, color=color.gren)\n`;
  assert.ok(diagnostics(src).some(byMessage(/'gren'/)), 'diagnostic present');
  assert.strictEqual(suggestMember('color', 'gren'), undefined);
  assert.deepStrictEqual(titles(src), []);
});

//──────────────────────────────────────────────────────────
// 2. plotshape/plotchar shape=
//──────────────────────────────────────────────────────────

test('plotshape shape= -> style=', () => {
  assertFix(`${HEAD}plotshape(close > open, shape=shape.circle)\n`,
    byMessage(/Invalid parameter "shape".*"style"/), 'Rename parameter to style',
    `${HEAD}plotshape(close > open, style=shape.circle)\n`);
});

test('plotchar shape="x" -> char="x"', () => {
  assertFix(`${HEAD}plotchar(close > open, shape="x")\n`,
    byMessage(/Invalid parameter "shape".*"char"/), 'Rename parameter to char',
    `${HEAD}plotchar(close > open, char="x")\n`);
});

test('plotchar shape=shape.xcross: no rename (char takes a string)', () => {
  const src = `${HEAD}plotchar(close > open, shape=shape.xcross)\n`;
  assert.ok(diagnostics(src).some(byMessage(/Invalid parameter "shape"/)), 'diagnostic present');
  assert.deepStrictEqual(titles(src), []);
});

test('plotshape with both shape= and style=: no rename (would duplicate)', () => {
  const src = `${HEAD}plotshape(close > open, style=shape.circle, shape=shape.cross)\n`;
  assert.ok(diagnostics(src).some(byMessage(/Invalid parameter "shape"/)), 'diagnostic present');
  assert.deepStrictEqual(titles(src).filter(t => /Rename/.test(t)), []);
});

test('two sources reporting shape= yield one action, not two', () => {
  const src = `${HEAD}plotshape(close > open, shape=shape.circle)\n`;
  assert.strictEqual(titles(src).filter(t => t === 'Rename parameter to style').length, 1);
});

//──────────────────────────────────────────────────────────
// 3. S10 ignore_invalid_symbol
//──────────────────────────────────────────────────────────

test('S10: adds ignore_invalid_symbol=true on one line', () => {
  assertFix(`${HEAD}m2 = request.security("FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on)\nplot(m2)\n`,
    byCheck('S10'), 'Add ignore_invalid_symbol=true',
    `${HEAD}m2 = request.security("FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on, ignore_invalid_symbol=true)\nplot(m2)\n`);
});

test('S10: wrapped call, tab indent, closing paren on its own line, trailing comment', () => {
  assertFix(`${HEAD}m2 = request.security("FRED:M2SL",\n\t "D",\n\t close[1],  // settled bar\n\t lookahead=barmerge.lookahead_on // explicit\n\t )\nplot(m2)\n`,
    byCheck('S10'), 'Add ignore_invalid_symbol=true',
    `${HEAD}m2 = request.security("FRED:M2SL",\n\t "D",\n\t close[1],  // settled bar\n\t lookahead=barmerge.lookahead_on, ignore_invalid_symbol=true // explicit\n\t )\nplot(m2)\n`);
});

test('S10: request.security_lower_tf', () => {
  assertFix(`${HEAD}v = request.security_lower_tf("BINANCE:BTCUSDT", "1", close)\nplot(array.size(v))\n`,
    byCheck('S10'), 'Add ignore_invalid_symbol=true');
});

test('S10: no action once ignore_invalid_symbol is present (diagnostic absent)', () => {
  const src = `${HEAD}m2 = request.security("FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on, ignore_invalid_symbol=false)\nplot(m2)\n`;
  assert.ok(!diagnostics(src).some(byCheck('S10')));
  assert.deepStrictEqual(titles(src), []);
});

//──────────────────────────────────────────────────────────
// 4. S1 repainting
//──────────────────────────────────────────────────────────

test('S1: close -> close[1] with lookahead_on', () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid, "D", close)\nplot(d)\n`,
    byCheck('S1'), 'Read the confirmed bar: close[1] with lookahead=barmerge.lookahead_on',
    `${HEAD}d = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)\nplot(d)\n`);
});

test('S1: wrapped call with gaps and a ta.* expression', () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid,\n\t "W",\n\t ta.sma(close, 20),\n\t barmerge.gaps_off)\nplot(d)\n`,
    byCheck('S1'), 'Read the confirmed bar: ta.sma(close, 20)[1] with lookahead=barmerge.lookahead_on',
    `${HEAD}d = request.security(syminfo.tickerid,\n\t "W",\n\t ta.sma(close, 20)[1],\n\t barmerge.gaps_off, lookahead=barmerge.lookahead_on)\nplot(d)\n`);
});

test('S1: no rewrite for a tuple, a tuple-returning ta.* call, or a user function', () => {
  for (const expr of ['[open, close]', 'ta.macd(close, 12, 26, 9)', 'myCalc()']) {
    const src = `${HEAD}myCalc() => close\nd = request.security(syminfo.tickerid, "D", ${expr})\n`;
    assert.ok(diagnostics(src).some(byCheck('S1')), `${expr}: S1 present`);
    assert.deepStrictEqual(titles(src).filter(t => /confirmed bar/.test(t)), [], expr);
  }
});

test('S1 on request.security_lower_tf: no lookahead rewrite (it has no lookahead parameter)', () => {
  const src = `${HEAD}v = request.security_lower_tf(syminfo.tickerid, "1", close)\nplot(array.size(v))\n`;
  assert.ok(diagnostics(src).some(byCheck('S1')), 'S1 present');
  assert.deepStrictEqual(titles(src).filter(t => /confirmed bar/.test(t)), []);
});

//──────────────────────────────────────────────────────────
// 5. // pine-ignore: S<n>
//──────────────────────────────────────────────────────────

test('ignore: appends a directive to a line with no comment', () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid, "D", close)\nplot(d)\n`,
    byCheck('S1'), 'Ignore S1 on this line',
    `${HEAD}d = request.security(syminfo.tickerid, "D", close) // pine-ignore: S1\nplot(d)\n`);
});

test("ignore: merges ahead of an existing comment, even one with an apostrophe", () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid, "D", close) // don't touch\nplot(d)\n`,
    byCheck('S1'), 'Ignore S1 on this line',
    `${HEAD}d = request.security(syminfo.tickerid, "D", close) // pine-ignore: S1 // don't touch\nplot(d)\n`);
});

test('ignore: adds the id to an existing directive list', () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid, "D", close) // pine-ignore: S2\nplot(d)\n`,
    byCheck('S1'), 'Ignore S1 on this line',
    `${HEAD}d = request.security(syminfo.tickerid, "D", close) // pine-ignore: S1, S2\nplot(d)\n`);
});

test('ignore: a // inside a string is not taken for a comment', () => {
  assertFix(`${HEAD}d = str.contains("a // b", "/") ? request.security(syminfo.tickerid, "D", close) : na\nplot(d)\n`,
    byCheck('S1'), 'Ignore S1 on this line',
    `${HEAD}d = str.contains("a // b", "/") ? request.security(syminfo.tickerid, "D", close) : na // pine-ignore: S1\nplot(d)\n`);
});

test('ignore: S10 in a wrapped call goes on the literal\'s line', () => {
  assertFix(`${HEAD}m2 = request.security(\n\t "FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on)\nplot(m2)\n`,
    byCheck('S10'), 'Ignore S10 on this line',
    `${HEAD}m2 = request.security(\n\t "FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on) // pine-ignore: S10\nplot(m2)\n`);
});

test('ignore: offered for every semantic check id, never for a syntactic diagnostic', () => {
  const src = `${HEAD}plot(close, color=color.xyzzy)\n`;
  assert.deepStrictEqual(titles(src).filter(t => /Ignore/.test(t)), []);
  const fake = [{ range: { start: { line: 2, character: 0 }, end: { line: 2, character: 4 } }, message: 'x', code: 'S7' }];
  assert.deepStrictEqual(computeQuickFixes(src, fake).map(f => f.title), ['Ignore S7 on this line']);
});

//──────────────────────────────────────────────────────────
// 6. //@version=6
//──────────────────────────────────────────────────────────

test('version: inserts //@version=6 when no version annotation exists', () => {
  assertFix('indicator("qf")\nplot(close)\n',
    byMessage(/Recommend using \/\/@version=6/), 'Insert //@version=6',
    '//@version=6\nindicator("qf")\nplot(close)\n');
});

test('version: no action when another version is declared (a migration, not a typo)', () => {
  const src = '//@version=5\nindicator("qf")\nplot(close)\n';
  assert.ok(diagnostics(src).some(byMessage(/Recommend using/)), 'diagnostic present');
  assert.deepStrictEqual(titles(src), []);
});

//──────────────────────────────────────────────────────────
// No diagnostic, no action
//──────────────────────────────────────────────────────────

test('clean script: no diagnostics, no actions', () => {
  const src = `${HEAD}d = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)\nplotshape(close > open, style=shape.circle, color=color.purple)\nplot(d)\n`;
  const { diags, fixes } = fixesFor(src);
  assert.deepStrictEqual(diags.map(key), []);
  assert.deepStrictEqual(fixes, []);
});

test('the same defect text without its diagnostic gets no action', () => {
  // The fixes key on the diagnostic, never on the text alone.
  assert.deepStrictEqual(computeQuickFixes(`${HEAD}plot(close, color=color.purplee)\n`, []), []);
  assert.deepStrictEqual(computeQuickFixes(`${HEAD}d = request.security(syminfo.tickerid, "D", close)\n`, []), []);
});
