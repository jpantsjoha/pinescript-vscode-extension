/**
 * IntelliSense coverage gate (issue #36).
 *
 * The completion/signature/hover providers must be backed by the FULL v6
 * reference (v6/parameter-requirements-merged.ts, 475 functions), not the
 * ~205-entry v6-manual hand list. The providers import 'vscode', which does
 * not exist under `node --test`, so the data-building logic lives in the
 * vscode-free src/intellisenseData.ts and is tested here against dist output.
 *
 * If this file fails after a refactor, the editor just lost functions.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const {
  getAllCompletionData,
  getNamespaceCompletionData,
  getSignatureData,
  getHoverData,
  getNamespaces,
} = require('../dist/src/intellisenseData.js');
const { PINE_FUNCTIONS_MERGED } = require('../dist/v6/parameter-requirements-merged.js');

const REF_KEYS = Object.keys(PINE_FUNCTIONS_MERGED);

test('every PINE_FUNCTIONS_MERGED key yields a completion entry', () => {
  const topLevel = new Set(getAllCompletionData().map(d => d.label));
  const missing = [];
  for (const key of REF_KEYS) {
    const dot = key.lastIndexOf('.');
    if (dot < 0) {
      if (!topLevel.has(key)) missing.push(key);
    } else {
      const ns = key.slice(0, dot);
      const member = key.slice(dot + 1);
      const labels = new Set(getNamespaceCompletionData(ns).map(d => d.label));
      if (!labels.has(member)) missing.push(key);
    }
  }
  assert.deepStrictEqual(missing, [], `missing completions for: ${missing.slice(0, 10).join(', ')}`);
});

test('covered reference functions count >= 475', () => {
  // A key counts as covered when a completion entry carries its label: as a
  // top-level item, or as a member of its (possibly nested) namespace.
  // Top-level keys that collide with a v6-manual variable (time, year, ...)
  // are covered by that variable entry — one label, offered once.
  const topLevel = new Set(getAllCompletionData().map(d => d.label));
  let covered = 0;
  for (const key of REF_KEYS) {
    const dot = key.lastIndexOf('.');
    if (dot < 0) {
      if (topLevel.has(key)) covered++;
    } else {
      const labels = new Set(getNamespaceCompletionData(key.slice(0, dot)).map(d => d.label));
      if (labels.has(key.slice(dot + 1))) covered++;
    }
  }
  assert.ok(covered >= 475, `expected >= 475 covered reference functions, got ${covered}`);
  assert.ok(covered >= REF_KEYS.length, `covered ${covered} of ${REF_KEYS.length} reference keys`);
});

test('nested namespaces are offered (chart.point, strategy sub-namespaces)', () => {
  const chartPoint = getNamespaceCompletionData('chart.point').map(d => d.label);
  for (const m of ['new', 'now', 'from_index', 'from_time', 'copy']) {
    assert.ok(chartPoint.includes(m), `chart.point.${m} missing`);
  }
  const strategy = getNamespaceCompletionData('strategy').map(d => d.label);
  for (const sub of ['closedtrades', 'opentrades', 'risk']) {
    assert.ok(strategy.includes(sub), `strategy.${sub} sub-namespace hint missing`);
  }
  const closedtrades = getNamespaceCompletionData('strategy.closedtrades').map(d => d.label);
  assert.ok(closedtrades.includes('profit'), 'strategy.closedtrades.profit missing');
});

test('reference-only functions are offered in their namespaces', () => {
  const cases = [
    ['footprint', 'poc'],
    ['volume_row', 'delta'],
    ['request', 'footprint'],
    ['matrix', 'get'],
  ];
  for (const [ns, member] of cases) {
    const labels = getNamespaceCompletionData(ns).map(d => d.label);
    assert.ok(labels.includes(member), `${ns}.${member} missing from ${ns} completions`);
  }
});

test('overloaded functions yield one signature per overload', () => {
  for (const name of ['timestamp', 'line.new']) {
    const sigs = getSignatureData(name);
    assert.ok(sigs.length > 1, `${name} should have multiple signatures, got ${sigs.length}`);
    for (const sig of sigs) {
      assert.ok(sig.label.includes('('), `signature label should look like a call: ${sig.label}`);
      assert.ok(Array.isArray(sig.parameters), `${name} signature has no parameter array`);
    }
  }
  // timestamp's second overload documents its parameters per-parameter
  const ts = getSignatureData('timestamp');
  assert.strictEqual(ts.length, PINE_FUNCTIONS_MERGED['timestamp'].overloads.length);
});

test('single-overload functions yield exactly one signature with parameter docs', () => {
  const sigs = getSignatureData('ta.sma');
  assert.strictEqual(sigs.length, 1);
  assert.deepStrictEqual(sigs[0].parameters.map(p => p.label), ['source', 'length']);
});

test('v6-manual variables and keywords are still offered', () => {
  const all = getAllCompletionData();
  const variables = new Set(all.filter(d => d.kind === 'variable').map(d => d.label));
  for (const v of ['close', 'bar_index']) {
    assert.ok(variables.has(v), `variable '${v}' missing from top-level completions`);
  }
  const keywords = new Set(all.filter(d => d.kind === 'keyword').map(d => d.label));
  for (const k of ['if', 'for', 'switch']) {
    assert.ok(keywords.has(k), `keyword '${k}' missing from top-level completions`);
  }
});

test('no duplicate labels within any namespace', () => {
  for (const ns of getNamespaces()) {
    const labels = getNamespaceCompletionData(ns).map(d => d.label);
    const dupes = labels.filter((l, i) => labels.indexOf(l) !== i);
    assert.deepStrictEqual([...new Set(dupes)], [], `duplicate labels in namespace '${ns}'`);
  }
});

test('no duplicate top-level labels', () => {
  const labels = getAllCompletionData().map(d => d.label);
  const dupes = labels.filter((l, i) => labels.indexOf(l) !== i);
  assert.deepStrictEqual([...new Set(dupes)], [], 'duplicate top-level completion labels');
});

test('hover falls back to the reference for functions v6-manual does not know', () => {
  for (const symbol of ['footprint.poc', 'volume_row.delta', 'matrix.get']) {
    const hover = getHoverData(symbol);
    assert.ok(hover, `no hover data for '${symbol}'`);
    assert.ok(hover.syntax || hover.description, `hover for '${symbol}' carries neither syntax nor description`);
  }
  // v6-manual entries keep their hand-written docs
  assert.strictEqual(getHoverData('close').type, 'series float');
});

test('signature help finds the open call past a closed nested call and ignores commas in strings', () => {
  const d = require('../dist/src/intellisenseData.js');
  const line = 'x = str.format("{0}, {1}", a, ta.sma(close, 14), ';
  assert.strictEqual(d.findFunctionCallName(line, line.length), 'str.format');
  assert.strictEqual(d.calculateActiveParameter(line), 3);
  const inner = 'y = ta.sma(close, ';
  assert.strictEqual(d.findFunctionCallName(inner, inner.length), 'ta.sma');
  assert.strictEqual(d.calculateActiveParameter(inner), 1);
  const outside = 'z = ta.sma(close, 14) + ';
  assert.strictEqual(d.findFunctionCallName(outside, outside.length), null);
});

test('review findings: generic constructors, grouping parens and three-segment hover', () => {
  const d = require('../dist/src/intellisenseData.js');
  const gen = 'var a = array.new<float>(';
  assert.strictEqual(d.findFunctionCallName(gen, gen.length), 'array.new');
  const gen2 = 'm = map.new<string, float>(';
  assert.strictEqual(d.findFunctionCallName(gen2, gen2.length), 'map.new');
  const grp = 'x = ta.sma((close + open';
  assert.strictEqual(d.findFunctionCallName(grp, grp.length), 'ta.sma');
  assert.strictEqual(d.calculateActiveParameter(grp), 0);
  const grp2 = 'x = ta.sma((close + open) / 2, ';
  assert.strictEqual(d.findFunctionCallName(grp2, grp2.length), 'ta.sma');
  assert.strictEqual(d.calculateActiveParameter(grp2), 1);
  const h = d.getHoverData('strategy.closedtrades.profit');
  assert.ok(h && !/Total closed trades/.test(h.description || ''), JSON.stringify(h));
});

test('a comparison before a paren is not read as a generic call', () => {
  const d = require('../dist/src/intellisenseData.js');
  const cmp = 'x = dayofmonth < 15 ? high > (';
  assert.strictEqual(d.findFunctionCallName(cmp, cmp.length), null);
  const cmp2 = 'x = dayofmonth < high > (';
  assert.strictEqual(d.findFunctionCallName(cmp2, cmp2.length), null);
  const outer = 'y = math.max(dayofmonth < high > (';
  assert.strictEqual(d.findFunctionCallName(outer, outer.length), 'math.max');
  const pt = 'a = array.new<chart.point>(';
  assert.strictEqual(d.findFunctionCallName(pt, pt.length), 'array.new');
  const nested = 'm = map.new<string, array<float>>(';
  assert.strictEqual(d.findFunctionCallName(nested, nested.length), 'map.new');
});

// ── Issue #45: constants and built-in variables after a namespace ──

const { REFERENCE_NAMES } = require('../dist/v6/reference-names.js');

/** Namespaces of every documented constant/variable (everything up to the last dot). */
const CONSTANT_NAMESPACES = [...new Set([...REFERENCE_NAMES].map(fqn => fqn.slice(0, fqn.lastIndexOf('.'))))];

test('documented constants are offered after their namespace (#45)', () => {
  const cases = [
    ['xloc', 'bar_index', 'constant'],
    ['shape', 'circle', 'constant'],
    ['plot', 'style_line', 'constant'],
    ['location', 'abovebar', 'constant'],
    ['size', 'small', 'constant'],
    ['display', 'all', 'constant'],
    ['session', 'ismarket', 'variable'],
  ];
  for (const [ns, member, kind] of cases) {
    const item = getNamespaceCompletionData(ns).find(d => d.label === member);
    assert.ok(item, `${ns}.${member} missing from ${ns} completions`);
    assert.strictEqual(item.kind, kind, `${ns}.${member} should be kind '${kind}'`);
  }
});

test('nested constant namespaces resolve (strategy.commission.percent)', () => {
  const strategy = getNamespaceCompletionData('strategy').map(d => d.label);
  assert.ok(strategy.includes('commission'), 'strategy. should hint the commission sub-namespace');
  const commission = getNamespaceCompletionData('strategy.commission');
  const percent = commission.find(d => d.label === 'percent');
  assert.ok(percent, 'strategy.commission.percent missing');
  assert.strictEqual(percent.kind, 'constant');
});

test('every REFERENCE_NAMES entry is offered in its namespace (#45 sweep)', () => {
  const missing = [];
  for (const fqn of REFERENCE_NAMES) {
    const dot = fqn.lastIndexOf('.');
    const labels = new Set(getNamespaceCompletionData(fqn.slice(0, dot)).map(d => d.label));
    if (!labels.has(fqn.slice(dot + 1))) missing.push(fqn);
  }
  assert.deepStrictEqual(missing, [], `missing completions for: ${missing.slice(0, 10).join(', ')}`);
});

test('no duplicate labels within any constant namespace', () => {
  for (const ns of CONSTANT_NAMESPACES) {
    const labels = getNamespaceCompletionData(ns).map(d => d.label);
    const dupes = labels.filter((l, i) => labels.indexOf(l) !== i);
    assert.deepStrictEqual([...new Set(dupes)], [], `duplicate labels in namespace '${ns}'`);
  }
});

test('hover on a constant or variable shows its kind (#45)', () => {
  for (const [symbol, kind] of [['xloc.bar_index', 'constant'], ['shape.circle', 'constant'], ['session.ismarket', 'variable'], ['strategy.commission.percent', 'constant']]) {
    const hover = getHoverData(symbol);
    assert.ok(hover, `no hover data for '${symbol}'`);
    assert.strictEqual(hover.type, kind, `hover for '${symbol}' should be a ${kind}`);
  }
});

// ── PR #46 review: shadowing, chart.point kind, hover parity, constant docs ──

const { NAMESPACE_CONSTANTS } = require('../dist/v6/pine-constants-complete.js');
const {
  getDeclaredNames,
} = require('../dist/src/intellisenseData.js');

test('a user-declared name suppresses built-in namespace completions (#46 review)', () => {
  // `xloc = 1` declares a user variable; `xloc.` must not offer bar_index/bar_time.
  const plain = getNamespaceCompletionData('xloc');
  assert.ok(plain.length > 0, 'xloc. should offer built-ins when xloc is not declared');
  const shadowed = getNamespaceCompletionData('xloc', new Set(['xloc']));
  assert.strictEqual(shadowed.length, 0,
    `xloc. with a user variable 'xloc' still offered ${shadowed.length} built-in members: ${shadowed.map(d => d.label).join(', ')}`);
  // A nested chain is decided by its root segment.
  const nested = getNamespaceCompletionData('strategy.closedtrades', new Set(['strategy']));
  assert.strictEqual(nested.length, 0,
    `strategy.closedtrades. with a user variable 'strategy' still offered ${nested.length} built-in members`);
});

test('getDeclaredNames collects only global-scope statement declarations (#46 delta review)', () => {
  assert.ok(typeof getDeclaredNames === 'function', 'getDeclaredNames is not exported');
  const names = getDeclaredNames([
    'xloc = 1',                          // plain assignment at indent 0
    'float shape = na',                  // typed
    'var int scale = 0',                 // var
    'varip string position = ""',        // varip
    '[pos, yloc] = f()',                 // global tuple destructuring
    'type location',                     // UDT
    'enum size',                         // enum
    'import user/lib/1 as extend',       // import alias
    'import user/otherlib/2',            // import without alias binds last segment
    'plot(close, color=color.red)',      // named argument is NOT a declaration
    '// text = 1',                       // comment is NOT a declaration
    's = "hline = 3"',                   // string content is NOT a declaration
    'f(math, int display) => 1',         // parameters NEVER shadow
    'for font = 0 to 9',                 // loop variable NEVER shadows
    'for [i, order] in a',               // for-in variables NEVER shadow
    'g() => 1',                          // function name is not an assignment
    'yloc := 2',                         // `:=` reassigns; it cannot declare
    'if close > open',                   // everything below is inside a block:
    '    boxed = 1',                     //   a local NEVER shadows
  ].join('\n'));
  for (const n of ['xloc', 'shape', 'scale', 'position', 'pos', 'yloc',
                   'location', 'size', 'extend', 'otherlib']) {
    assert.ok(names.has(n), `global declaration '${n}' not collected`);
  }
  for (const n of ['color', 'text', 'hline', 'math', 'display', 'font', 'i', 'order', 'g', 'boxed']) {
    assert.ok(!names.has(n), `'${n}' must not be collected (argument / comment / string / parameter / loop / function / local)`);
  }
});

// The delta-review rule: a name shadows a built-in namespace ONLY when declared
// at global scope (indent 0) by a statement-level declaration. Parameters,
// block locals, loop variables and `:=` reassignments never shadow, and a
// named argument on a continuation line of a wrapped call is not a declaration.
// Each case asserts the `xloc.` completion count (xloc has 2 built-in members).
test('namespace shadowing follows global scope only (#46 delta review)', () => {
  const count = (doc) => getNamespaceCompletionData('xloc', getDeclaredNames(doc)).length;

  // A function parameter named xloc never shadows, even at top level after it.
  assert.strictEqual(count('f(xloc) =>\n    xloc\nxloc.'), 2,
    'parameter xloc suppressed the built-in namespace');

  // A local inside an indented block never shadows.
  assert.strictEqual(count('if close > open\n    xloc = 1\nxloc.'), 2,
    'block-local xloc = 1 suppressed the built-in namespace');

  // A named argument on a continuation line of a wrapped call is not a
  // declaration — bracket depth is tracked across lines.
  const wrapped = 'line.new(\n    first_point = chart.point.now(close),\n    xloc = xloc.bar_time)\nxloc.';
  assert.strictEqual(count(wrapped), 2,
    'wrapped named argument xloc = xloc.bar_time suppressed the built-in namespace');
  // Same with a dedented continuation line (indent 0 but still inside the call).
  const dedented = 'line.new(\nxloc = xloc.bar_time)\nxloc.';
  assert.strictEqual(count(dedented), 2,
    'dedented continuation xloc = xloc.bar_time suppressed the built-in namespace');

  // `:=` cannot introduce a name.
  assert.strictEqual(count('xloc := 1\nxloc.'), 2,
    'reassignment xloc := 1 suppressed the built-in namespace');

  // The clear cases: global statement-level declarations DO shadow.
  assert.strictEqual(count('xloc = 1\nxloc.'), 0,
    'global xloc = 1 did not shadow the built-in namespace');
  assert.strictEqual(count('[xloc, y] = [1, 2]\nxloc.'), 0,
    'global tuple [xloc, y] = [1, 2] did not shadow the built-in namespace');
});

test('declared names suppress completions end to end (#46 review)', () => {
  const doc = 'xloc = 1\nx = xloc.';
  const withDecl = getNamespaceCompletionData('xloc', getDeclaredNames(doc));
  assert.strictEqual(withDecl.length, 0, `shadowed xloc. offered ${withDecl.length} built-ins`);
  const without = getNamespaceCompletionData('xloc', getDeclaredNames('x = xloc.'));
  assert.ok(without.length > 0, 'unshadowed xloc. lost its built-ins');
});

test('chart.point is a module, never a variable (#46 review)', () => {
  const point = getNamespaceCompletionData('chart').find(d => d.label === 'point');
  assert.ok(point, 'chart.point missing from chart. completions');
  assert.strictEqual(point.kind, 'module', `chart.point completion kind should be module, got ${point.kind}`);
  const hover = getHoverData('chart.point');
  assert.ok(hover, 'no hover for chart.point');
  assert.notStrictEqual(hover.type, 'variable', 'chart.point hover must not be a variable');
});

test('every completion member of every namespace has a hover (#46 review)', () => {
  const allNs = new Set([...getNamespaces(), ...CONSTANT_NAMESPACES, ...Object.keys(NAMESPACE_CONSTANTS)]);
  const missing = [];
  let total = 0;
  for (const ns of allNs) {
    for (const item of getNamespaceCompletionData(ns)) {
      total++;
      const fqn = `${ns}.${item.label}`;
      if (!getHoverData(fqn)) missing.push(fqn);
    }
  }
  assert.strictEqual(missing.length, 0,
    `${missing.length} of ${total} completion members have no hover: ${missing.slice(0, 10).join(', ')}`);
});

test('constant hover carries a description and its namespace (#46 review)', () => {
  const hover = getHoverData('xloc.bar_index');
  assert.ok(hover, 'no hover for xloc.bar_index');
  assert.strictEqual(hover.type, 'constant');
  assert.ok(hover.description && hover.description.length > 0, 'constant hover has no description');
  assert.strictEqual(hover.category, 'xloc', 'constant hover should name its namespace');
});
