/**
 * Named-parameter completion ITEMS (issue #13, PR #51 review findings 7–8).
 *
 * test/named-parameter-completions.test.js covers the vscode-free data layer;
 * this file covers the vscode item shape built by src/completions.ts —
 * sortText ranking, preselect, filterText and the replacement range. A
 * minimal vscode API stand-in is injected via Module._load so the compiled
 * provider module can be required under plain `node --test`.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const Module = require('module');

class CompletionItem {
  constructor(label, kind) {
    this.label = label;
    this.kind = kind;
  }
}
class SnippetString {
  constructor(value) { this.value = value; }
}
class MarkdownString {
  constructor() { this.value = ''; }
  appendCodeblock() { return this; }
  appendMarkdown() { return this; }
}
class Range {
  constructor(startLine, startCharacter, endLine, endCharacter) {
    this.start = { line: startLine, character: startCharacter };
    this.end = { line: endLine, character: endCharacter };
  }
}

const vscodeMock = {
  CompletionItem,
  SnippetString,
  MarkdownString,
  Range,
  CompletionItemKind: { Function: 1, Variable: 2, Keyword: 3, Module: 4, Color: 5, Constant: 6, Field: 7 },
  CompletionTriggerKind: { Invoke: 0, TriggerCharacter: 1, TriggerForIncompleteCompletions: 2 },
  workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }) },
};

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'vscode') return vscodeMock;
  return originalLoad.call(this, request, ...rest);
};
const {
  getNamedArgumentValueItems,
  getTriggerCharacterCompletionItems,
} = require('../dist/src/completions.js');
Module._load = originalLoad;

// Finding 7: constant value completions must rank FIRST. VS Code sorts by
// sortText || label, so unpinned items (`abs`, `alert`, `array.*`, `close`)
// bury `shape.*`; value items need a priority sortText that precedes every
// global label, and the first item must be preselected.
test('finding 7: value items after name= carry priority sortText in declaration order', () => {
  const line = 'plotshape(close, style=';
  const items = getNamedArgumentValueItems(line, line.length, 0);
  assert.ok(items.length > 0, 'expected shape.* value items');
  items.forEach((item, index) => {
    assert.strictEqual(item.sortText, `0_${String(index).padStart(3, '0')}`, `item ${index} (${item.label}) sortText`);
    // '0_...' sorts ahead of every plain label ('abs', 'close', ...).
    assert.ok(item.sortText < 'a', `sortText ${item.sortText} must precede alphabetical global items`);
  });
});

test('finding 7: the first value item is preselected', () => {
  const line = 'plotshape(close, style=';
  const items = getNamedArgumentValueItems(line, line.length, 0);
  assert.strictEqual(items[0].preselect, true, 'first value item preselected');
  assert.ok(items.slice(1).every(i => !i.preselect), 'only the first item is preselected');
});

// Finding 8: once the user types a prefix (`style=sh`, `style=shape.ci`) the
// constants must still be offered, must filter on the FULL label (so `sh`
// matches `shape.circle`), and must replace exactly the typed prefix after
// `=` — not the parameter name, not beyond the cursor.
test('finding 8: value items survive a typed prefix and filter on the full label', () => {
  const line = 'plotshape(close, style=sh';
  const items = getNamedArgumentValueItems(line, line.length, 0);
  const names = items.map(i => i.label);
  assert.ok(names.includes('shape.circle'), `style=sh⎸ should offer shape.circle, got: ${names.join(', ')}`);
  for (const item of items) {
    assert.strictEqual(item.filterText, item.label, `${item.label}: filterText must be the full label so the typed prefix matches`);
  }
});

test('finding 8: the replacement range covers exactly the typed prefix after =', () => {
  const line = 'plotshape(close, style=sh';
  const items = getNamedArgumentValueItems(line, line.length, 7);
  const circle = items.find(i => i.label === 'shape.circle');
  assert.ok(circle, 'shape.circle offered');
  assert.deepStrictEqual(
    { start: circle.range.start, end: circle.range.end },
    { start: { line: 7, character: line.length - 2 }, end: { line: 7, character: line.length } },
    'range replaces `sh` on the cursor line only',
  );
});

test('finding 8: a dotted prefix (shape.ci) still offers shape.circle with the full prefix range', () => {
  const line = 'plotshape(close, style=shape.ci';
  const items = getNamedArgumentValueItems(line, line.length, 0);
  const names = items.map(i => i.label);
  assert.ok(names.includes('shape.circle'), `style=shape.ci⎸ should offer shape.circle, got: ${names.join(', ')}`);
  const circle = items.find(i => i.label === 'shape.circle');
  assert.deepStrictEqual(
    { start: circle.range.start, end: circle.range.end },
    { start: { line: 0, character: line.length - 'shape.ci'.length }, end: { line: 0, character: line.length } },
    'range replaces the whole `shape.ci` prefix',
  );
});

test('finding 8: with no typed prefix the range is an empty insert at the cursor', () => {
  const line = 'plotshape(close, style=';
  const items = getNamedArgumentValueItems(line, line.length, 3);
  assert.ok(items.length > 0);
  assert.deepStrictEqual(
    { start: items[0].range.start, end: items[0].range.end },
    { start: { line: 3, character: line.length }, end: { line: 3, character: line.length } },
    'zero-width range at the cursor',
  );
});

// The '(' / ',' trigger path returns the same value items, so the ranking and
// range guarantees hold there too.
test('findings 7+8: trigger-character value items carry the same sortText/preselect', () => {
  const line = 'plotshape(close, style=';
  const items = getTriggerCharacterCompletionItems(line, line.length, 0);
  assert.ok(items.length > 0, 'value items on trigger');
  assert.strictEqual(items[0].sortText, '0_000');
  assert.strictEqual(items[0].preselect, true);
});

// 0.6.5 release audit: '(' that groups an expression is not a call.
test('trigger "(" after a call name offers that call\'s parameters', () => {
  const line = 'plot(';
  const items = getTriggerCharacterCompletionItems(line, line.length, 0, undefined, '(');
  assert.ok(items.some(i => /^title=?$/.test(String(i.label && i.label.label || i.label))), 'plot( should offer title=');
});

test('trigger "(" that groups an expression offers nothing', () => {
  const line = 'plot((';
  const items = getTriggerCharacterCompletionItems(line, line.length, 0, undefined, '(');
  assert.deepStrictEqual(items, [], 'a grouping paren must not pop up plot parameters');
});

// Multi-line context: the provider passes the wrapped statement, and the
// replacement range must still use the cursor column on the cursor's line.
test('wrapped call: range uses the real cursor column, not the context length', () => {
  const { statementContext } = require('../dist/src/intellisenseData.js');
  const lines = ['plot(close,', '     ti'];
  const ctx = statementContext(lines, 1, 7);
  const items = getTriggerCharacterCompletionItems(ctx, ctx.length, 1, 7, ',');
  for (const item of items) {
    if (!item.range) continue;
    const r = item.range.replace || item.range;
    assert.strictEqual(r.end.line, 1);
    assert.strictEqual(r.end.character, 7);
  }
});
