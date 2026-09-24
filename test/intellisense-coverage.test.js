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
