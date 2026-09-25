/**
 * Named-parameter completions through the real extension provider
 * (PR #51 delta review, finding 1 — the regression).
 *
 * test/named-parameter-completions.test.js covers the vscode-free data layer
 * and test/named-parameter-completion-items.test.js covers the item shaping;
 * this file drives src/extension.ts's provideCompletionItems itself with a
 * mocked vscode API, so a `return []` short-circuit in the provider cannot
 * hide behind passing data-layer tests again.
 *
 * Contract: in a value position after `name =` an INVOKED (or typed)
 * completion returns the value items (if any) ranked first PLUS the normal
 * global completions — never parameter names. Only a completion TRIGGERED
 * by '(' or ',' may return an empty list.
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
class Position {
  constructor(line, character) { this.line = line; this.character = character; }
  translate(lineDelta, characterDelta) {
    return new Position(this.line + (lineDelta || 0), this.character + (characterDelta || 0));
  }
}
class TextEdit {
  static delete(range) { return { range }; }
  static replace(range, newText) { return { range, newText }; }
  static insert(position, newText) { return { position, newText }; }
}
class Diagnostic {
  constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; }
}
class Hover {
  constructor(contents) { this.contents = [contents]; }
}
class SignatureHelp {}
class SignatureInformation {
  constructor(label) { this.label = label; this.parameters = []; }
}
class ParameterInformation {
  constructor(label, documentation) { this.label = label; this.documentation = documentation; }
}

const CompletionTriggerKind = { Invoke: 0, TriggerCharacter: 1, TriggerForIncompleteCompletions: 2 };

const captured = { completionProvider: null };
const disposable = { dispose() {} };

const vscodeMock = {
  CompletionItem,
  SnippetString,
  MarkdownString,
  Range,
  Position,
  TextEdit,
  Diagnostic,
  Hover,
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  CompletionItemKind: { Function: 1, Variable: 2, Keyword: 3, Module: 4, Color: 5, Constant: 6, Field: 7 },
  CompletionTriggerKind,
  ConfigurationTarget: { Workspace: 2 },
  ViewColumn: { Beside: 2 },
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  workspace: {
    getConfiguration: () => ({
      // '*.pine' already mapped: activate() takes the no-update path.
      get: (key, fallback) => (key === 'files.associations' ? { '*.pine': 'pine' } : fallback),
      update: () => Promise.resolve(),
    }),
    onDidOpenTextDocument: () => disposable,
    onDidChangeTextDocument: () => disposable,
    onDidCloseTextDocument: () => disposable,
  },
  languages: {
    registerDocumentFormattingEditProvider: () => disposable,
    registerHoverProvider: () => disposable,
    registerSignatureHelpProvider: () => disposable,
    createDiagnosticCollection: () => ({ set() {}, dispose() {} }),
    registerCompletionItemProvider: (_lang, provider) => {
      captured.completionProvider = provider;
      return disposable;
    },
  },
  commands: { registerCommand: () => disposable },
  window: { activeTextEditor: undefined, showInformationMessage() {} },
};

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'vscode') return vscodeMock;
  return originalLoad.call(this, request, ...rest);
};
const { activate } = require('../dist/src/extension.js');
Module._load = originalLoad;

activate({ subscriptions: [] });
const provider = captured.completionProvider;
assert.ok(provider, 'the completion provider was registered');

function documentFor(text) {
  const lines = text.split('\n');
  return {
    languageId: 'pine',
    version: 1,
    uri: { toString: () => 'untitled:provider-test' },
    lineCount: lines.length,
    lineAt: (i) => ({ text: lines[i] }),
    getText: () => text,
    getWordRangeAtPosition: () => undefined,
  };
}

async function complete(line, context) {
  const result = provider.provideCompletionItems(
    documentFor(line),
    { line: 0, character: line.length },
    null,
    context || { triggerKind: CompletionTriggerKind.Invoke },
  );
  const items = await Promise.resolve(result);
  return items || [];
}

const NAME_ITEM_RE = /^[A-Za-z_]\w*=$/;

// Delta finding 1 (regression): invoked completion in a value position whose
// parameter has no constant namespace must return the GLOBAL list (built-ins,
// keywords) — never "No suggestions", never `name=` parameter items.
test('delta finding 1: invoked completion at `plot(close, title = ` returns built-ins and no name= items', async () => {
  const line = 'plot(close, title = ';
  const items = await complete(line);
  const names = items.map(i => i.label);
  assert.ok(items.length > 50, `expected the global completion list, got ${items.length} items`);
  assert.ok(names.includes('close'), `built-in variables offered: ${names.slice(0, 10).join(', ')}...`);
  assert.ok(names.includes('if'), `keywords offered: ${names.slice(0, 10).join(', ')}...`);
  assert.ok(!names.some(n => NAME_ITEM_RE.test(n)), `no name= parameter items in a value position: ${names.filter(n => NAME_ITEM_RE.test(n)).join(', ')}`);
});

test('delta finding 1: typed identifier after `name = ` (ta.sma(close, length = my_) still offers built-ins', async () => {
  const line = 'ta.sma(close, length = my_';
  const items = await complete(line);
  const names = items.map(i => i.label);
  assert.ok(items.length > 50, `typed value prefix must not empty the list, got ${items.length} items`);
  assert.ok(names.includes('close'), 'built-ins offered after a typed value prefix');
  assert.ok(!names.some(n => NAME_ITEM_RE.test(n)), 'no name= parameter items after a typed value prefix');
});

test('delta finding 1: `plotshape(c, style=` returns shape.* first, then the global completions', async () => {
  const line = 'plotshape(c, style=';
  const items = await complete(line);
  const names = items.map(i => i.label);
  assert.ok(items.length > 50, `value items plus the global list, got ${items.length} items`);
  assert.ok(names[0].startsWith('shape.'), `shape.* constants rank first, got: ${names.slice(0, 5).join(', ')}`);
  assert.ok(names.includes('shape.circle'), 'shape.circle offered');
  assert.ok(names.includes('close'), 'global completions follow the value items');
  assert.ok(!names.some(n => NAME_ITEM_RE.test(n)), 'no name= parameter items in a value position');
});

// Only a '(' or ',' trigger may return nothing in a value position: the
// suggest widget popping on a trigger character must never dump the global
// list there (finding 3 of the original review still stands).
test('delta finding 1: a trigger character in a value position returns nothing (never the global list)', async () => {
  const line = 'plot(close, title = ';
  const items = await complete(line, { triggerKind: CompletionTriggerKind.TriggerCharacter, triggerCharacter: ',' });
  assert.deepStrictEqual(items.map(i => i.label), [], 'triggered completion after `name = ` offers only argument-list items — none here');
});
