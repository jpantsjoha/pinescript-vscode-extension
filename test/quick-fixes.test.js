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
    source: 'pine', // what extension.ts stamps on every diagnostic it publishes
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

test('plotshape shape=color.red: no rename (the value is not a style; color= was probably meant)', () => {
  for (const value of ['color.red', 'myShape', 'shape.nonesuch']) {
    const src = `${HEAD}myShape = shape.circle\nplotshape(true, shape=${value})\n`;
    assert.ok(diagnostics(src).some(byMessage(/Invalid parameter "shape"/)), `${value}: diagnostic present`);
    assert.deepStrictEqual(titles(src).filter(t => /Rename/.test(t)), [], value);
  }
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

test('S10: a stale diagnostic gets no add when the flag is already supplied positionally or by name', () => {
  const flagged = `${HEAD}d = request.security("FRED:X", "D", close[1], barmerge.gaps_off, barmerge.lookahead_on)\nplot(d)\n`;
  const s10 = diagnostics(flagged).find(byCheck('S10'));
  assert.ok(s10, 'S10 present before the flag is added');
  const variants = {
    'security, positional slot 5': `${HEAD}d = request.security("FRED:X", "D", close[1], barmerge.gaps_off, barmerge.lookahead_on, true)\nplot(d)\n`,
    'security, by name': `${HEAD}d = request.security("FRED:X", "D", close[1], barmerge.gaps_off, barmerge.lookahead_on, ignore_invalid_symbol=false)\nplot(d)\n`,
  };
  for (const [name, src] of Object.entries(variants)) {
    assert.ok(!diagnostics(src).some(byCheck('S10')), `${name}: the engine agrees the flag is supplied`);
    assert.deepStrictEqual(computeQuickFixes(src, [s10]).filter(f => /ignore_invalid/.test(f.title)), [], name);
  }
  // security_lower_tf: slot 3.
  const lowFlagged = `${HEAD}v = request.security_lower_tf("BINANCE:BTCUSDT", "1", close)\nplot(array.size(v))\n`;
  const lowS10 = diagnostics(lowFlagged).find(byCheck('S10'));
  const lowPositional = `${HEAD}v = request.security_lower_tf("BINANCE:BTCUSDT", "1", close, true)\nplot(array.size(v))\n`;
  assert.deepStrictEqual(computeQuickFixes(lowPositional, [lowS10]).filter(f => /ignore_invalid/.test(f.title)), []);
});

test('isPreferred only on the unambiguous fixes (single misspelling candidate, version insert)', () => {
  const preferred = src => fixesFor(src).fixes.map(f => [f.title, f.isPreferred]);
  assert.deepStrictEqual(preferred(`${HEAD}plot(close, color=color.purplee)\n`), [['Change to color.purple', true]]);
  assert.deepStrictEqual(preferred('indicator("qf")\nplot(close)\n'), [['Insert //@version=6', true]]);
  assert.deepStrictEqual(preferred(`${HEAD}plotshape(close > open, shape=shape.circle)\n`), [['Rename parameter to style', false]]);
  assert.deepStrictEqual(preferred(`${HEAD}m = request.security("FRED:X", "D", close[1], lookahead=barmerge.lookahead_on)\nplot(m)\n`),
    [['Add ignore_invalid_symbol=true', false], ['Ignore S10 on this line', false]]);
});

test('S10: no action once ignore_invalid_symbol is present (diagnostic absent)', () => {
  const src = `${HEAD}m2 = request.security("FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on, ignore_invalid_symbol=false)\nplot(m2)\n`;
  assert.ok(!diagnostics(src).some(byCheck('S10')));
  assert.deepStrictEqual(titles(src), []);
});

//──────────────────────────────────────────────────────────
// 4. S1 repainting
//──────────────────────────────────────────────────────────

// S1 gets ONLY the ignore action. `expr[1]` + lookahead_on is right for a higher
// timeframe and a live expression, and neither can be proven from the text.
test('S1: only "Ignore S1", never a rewrite, never preferred (review blockers on #58)', () => {
  const cases = {
    'higher timeframe': `${HEAD}d = request.security(syminfo.tickerid, "D", close)\nplot(d)\n`,
    'same timeframe': `${HEAD}same = request.security(syminfo.tickerid, timeframe.period, close)\nplot(same)\n`,
    'lower timeframe': `${HEAD}low = request.security(syminfo.tickerid, "1", close)\nplot(low)\n`,
    'pre-offset alias': `${HEAD}settled = close[1]\ndaily = request.security(syminfo.tickerid, "D", settled)\nplot(daily)\n`,
    '3-arg ta.vwap tuple': `${HEAD}[v, upper, lower] = request.security(\n\t syminfo.tickerid, "D",\n\t ta.vwap(close, timeframe.change("D"), 2.0))\nplot(v)\n`,
    'lower_tf': `${HEAD}arr = request.security_lower_tf(syminfo.tickerid, "1", close)\nplot(array.size(arr))\n`,
  };
  for (const [name, src] of Object.entries(cases)) {
    const { diags, fixes } = fixesFor(src);
    const s1 = diags.findIndex(byCheck('S1'));
    assert.ok(s1 >= 0, `${name}: S1 present`);
    const forS1 = fixes.filter(f => f.diagnosticIndex === s1);
    assert.deepStrictEqual(forS1.map(f => f.title), ['Ignore S1 on this line'], name);
    assert.strictEqual(forS1[0].isPreferred, false, `${name}: ignore is never preferred`);
  }
});

test('S1: the ignore action silences it and adds nothing', () => {
  assertFix(`${HEAD}d = request.security(syminfo.tickerid, "D", close)\nplot(d)\n`,
    byCheck('S1'), 'Ignore S1 on this line',
    `${HEAD}d = request.security(syminfo.tickerid, "D", close) // pine-ignore: S1\nplot(d)\n`);
});

//──────────────────────────────────────────────────────────
// Stale and foreign diagnostics
//──────────────────────────────────────────────────────────

test('foreign-source diagnostic: no action even with our exact message', () => {
  const src = `${HEAD}plot(close, color=color.purplee)\n`;
  const ours = diagnostics(src).find(byMessage(/'purplee'/));
  assert.ok(computeQuickFixes(src, [ours]).length === 1, 'our own diagnostic gets the fix');
  assert.deepStrictEqual(computeQuickFixes(src, [{ ...ours, source: 'other-linter' }]), []);
  assert.deepStrictEqual(computeQuickFixes(src, [{ ...ours, source: undefined }]), []);
});

test('stale range beyond the line end: no action (never spills into the next line)', () => {
  // The diagnostic was on a longer line 2; the user shortened it. Character 40 of
  // "x = 1" must not resolve into line 3's request.security call.
  const src = `${HEAD}x = 1\nm = request.security("FRED:M2SL", "D", close[1], lookahead=barmerge.lookahead_on)\nplot(m + x)\n`;
  const s10 = diagnostics(src).find(byCheck('S10'));
  assert.ok(s10, 'S10 present on line 3');
  const stale = { ...s10, range: { start: { line: 2, character: 40 }, end: { line: 2, character: 51 } } };
  assert.deepStrictEqual(computeQuickFixes(src, [stale]).filter(f => /ignore_invalid/.test(f.title)), []);
  const staleMisspell = { range: { start: { line: 2, character: 20 }, end: { line: 2, character: 27 } },
    message: "Unknown color constant or function 'purplee'", source: 'pine' };
  assert.deepStrictEqual(computeQuickFixes(src, [staleMisspell]), []);
});

test('range whose token no longer matches: no action', () => {
  // Diagnostic says 'purplee'; the text there now reads 'purple2' / a shape= that moved.
  const src = `${HEAD}plot(close, color=color.purple2)\nplotshape(close > open, style=shape.circle)\nm = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)\nplot(m)\n`;
  const at = (line, ch, len) => ({ start: { line, character: ch }, end: { line, character: ch + len } });
  const stale = [
    { range: at(2, 24, 7), message: "Unknown color constant or function 'purplee'", source: 'pine' },
    { range: at(3, 24, 5), message: 'Invalid parameter "shape". Did you mean "style"?', source: 'pine' },
    { range: at(4, 21, 11), message: '[S10] feed', code: 'S10', source: 'pine' },
  ];
  assert.deepStrictEqual(computeQuickFixes(src, stale).filter(f => !/^Ignore/.test(f.title)).map(f => f.title), []);
});

test('ignore: a code without our [S<n>] message prefix gets no action', () => {
  const src = `${HEAD}plot(close)\n`;
  const d = { range: { start: { line: 2, character: 0 }, end: { line: 2, character: 4 } }, message: 'something else', code: 'S1', source: 'pine' };
  assert.deepStrictEqual(computeQuickFixes(src, [d]), []);
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
  const fake = [{ range: { start: { line: 2, character: 0 }, end: { line: 2, character: 4 } }, message: '[S7] x', code: 'S7', source: 'pine' }];
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
