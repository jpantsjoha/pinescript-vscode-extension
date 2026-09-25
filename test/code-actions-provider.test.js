/**
 * Quick fixes through the real extension (issue #49): activate() with a stubbed
 * vscode, prove the code-action provider registers for `pine`, that semantic
 * diagnostics carry their check id in `code`, and that the provider turns those
 * editor diagnostics into QuickFix actions with a WorkspaceEdit.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const Module = require('module');

class Position {
  constructor(line, character) { this.line = line; this.character = character; }
  translate(dl, dc) { return new Position(this.line + (dl || 0), this.character + (dc || 0)); }
}
class Range {
  constructor(a, b, c, d) {
    if (a instanceof Position) { this.start = a; this.end = b; }
    else { this.start = new Position(a, b); this.end = new Position(c, d); }
  }
}
class Diagnostic {
  constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; }
}
class CodeAction {
  constructor(title, kind) { this.title = title; this.kind = kind; }
}
class WorkspaceEdit {
  constructor() { this.edits = []; }
  replace(uri, range, newText) { this.edits.push({ uri, range, newText }); }
}

const captured = { codeActions: [], diagnostics: new Map(), onOpen: null };
const disposable = { dispose() {} };
const noop = () => disposable;

const vscodeMock = {
  Position, Range, Diagnostic, CodeAction, WorkspaceEdit,
  CodeActionKind: { QuickFix: 'quickfix' },
  CompletionItem: class {}, MarkdownString: class { appendCodeblock() { return this; } appendMarkdown() { return this; } },
  CompletionItemKind: {}, CompletionTriggerKind: {}, ConfigurationTarget: { Workspace: 2 },
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  workspace: {
    getConfiguration: () => ({ get: (k, f) => (k === 'files.associations' ? { '*.pine': 'pine' } : f), update: () => Promise.resolve() }),
    onDidOpenTextDocument: fn => { captured.onOpen = fn; return disposable; },
    onDidChangeTextDocument: noop,
    onDidCloseTextDocument: noop,
  },
  languages: {
    registerDocumentFormattingEditProvider: noop,
    registerHoverProvider: noop,
    registerSignatureHelpProvider: noop,
    registerCompletionItemProvider: noop,
    registerCodeActionsProvider: (selector, provider, metadata) => {
      captured.codeActions.push({ selector, provider, metadata });
      return disposable;
    },
    createDiagnosticCollection: () => ({
      set: (uri, diags) => captured.diagnostics.set(uri, diags),
      dispose() {},
    }),
  },
  commands: { registerCommand: noop },
  window: { activeTextEditor: undefined, showInformationMessage() {} },
};

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'vscode') return vscodeMock;
  return originalLoad.call(this, request, ...rest);
};
const { activate } = require('../dist/src/extension.js');
Module._load = originalLoad;

const originalLog = console.log;
console.log = () => {};
activate({ subscriptions: [] });
console.log = originalLog;

function doc(text) {
  return { languageId: 'pine', uri: 'untitled:qf.pine', getText: () => text };
}

test('activate() registers exactly one code-action provider, for pine, offering QuickFix', () => {
  assert.strictEqual(captured.codeActions.length, 1);
  const [{ selector, provider, metadata }] = captured.codeActions;
  assert.strictEqual(selector, 'pine');
  assert.deepStrictEqual(metadata.providedCodeActionKinds, ['quickfix']);
  assert.strictEqual(typeof provider.provideCodeActions, 'function');
});

test('editor diagnostics -> quick fixes end to end (S1 code carried, WorkspaceEdit built)', () => {
  const text = '//@version=6\r\nindicator("qf")\r\nd = request.security(syminfo.tickerid, "D", close)\r\nplot(d, color=color.purplee)\r\n';
  const document = doc(text);
  const quiet = console.log; console.log = () => {};
  captured.onOpen(document);
  console.log = quiet;
  const diags = captured.diagnostics.get(document.uri);
  const s1 = diags.find(d => d.code === 'S1');
  assert.ok(s1, `S1 diagnostic carries code 'S1'; codes: ${diags.map(d => d.code).join(',')}`);

  const { provider } = captured.codeActions[0];
  const actions = provider.provideCodeActions(document, s1.range, { diagnostics: diags });
  const titles = actions.map(a => a.title);
  assert.ok(titles.includes('Change to color.purple'), titles.join(' | '));
  assert.ok(titles.includes('Ignore S1 on this line'), titles.join(' | '));
  const confirmed = actions.find(a => /confirmed bar/.test(a.title));
  assert.ok(confirmed, titles.join(' | '));
  assert.strictEqual(confirmed.kind, 'quickfix');
  assert.deepStrictEqual(confirmed.diagnostics, [s1]);
  assert.deepStrictEqual(confirmed.edit.edits.map(e => e.newText), ['[1], lookahead=barmerge.lookahead_on']);
  assert.strictEqual(confirmed.edit.edits[0].range.start.line, 2);
});

test('no diagnostics in context -> no actions', () => {
  const { provider } = captured.codeActions[0];
  assert.deepStrictEqual(provider.provideCodeActions(doc('plot(close, color=color.purplee)'), new Range(0, 0, 0, 1), { diagnostics: [] }), []);
});
