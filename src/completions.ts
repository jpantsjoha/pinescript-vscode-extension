import * as vscode from 'vscode';
import { V6_VARIABLES, V6_FUNCTIONS, PineItem } from '../v6/v6-manual';
import {
  V6_KEYWORDS,
  CompletionData,
  DeclaredNames,
  getAllCompletionData,
  getNamespaceCompletionData,
  getHoverData,
  getNamedParameterCompletions,
  getNamedArgumentValueCompletions,
  getNamedArgumentValuePrefix, isCallParenBeforeCursor } from './intellisenseData';

// Re-export so existing imports of V6_KEYWORDS from this module keep working.
export { V6_KEYWORDS };

const KIND_MAP: Record<CompletionData['kind'], vscode.CompletionItemKind> = {
  function: vscode.CompletionItemKind.Function,
  variable: vscode.CompletionItemKind.Variable,
  keyword: vscode.CompletionItemKind.Keyword,
  module: vscode.CompletionItemKind.Module,
  color: vscode.CompletionItemKind.Color,
  constant: vscode.CompletionItemKind.Constant,
  field: vscode.CompletionItemKind.Field,
};

// Build the rich markdown documentation shared by completions and hover.
function buildMarkdown(doc: {
  syntax?: string;
  description?: string;
  returns?: string;
  type?: string;
  example?: string;
  category?: string;
}): vscode.MarkdownString {
  const md = new vscode.MarkdownString();

  if (doc.syntax) {
    md.appendCodeblock(doc.syntax, 'pine');
    md.appendMarkdown('\n\n');
  }
  if (doc.description) {
    md.appendMarkdown(doc.description);
  }
  if (doc.returns) {
    md.appendMarkdown(`\n\n**Returns:** \`${doc.returns}\``);
  }
  if (doc.type) {
    md.appendMarkdown(`\n\n**Type:** \`${doc.type}\``);
  }
  if (doc.example) {
    md.appendMarkdown('\n\n**Example:**');
    md.appendCodeblock(doc.example, 'pine');
  }
  if (doc.category) {
    md.appendMarkdown(`\n\n_Category: ${doc.category}_`);
  }

  return md;
}

// Convert function syntax to VS Code snippet
function createSnippetFromSyntax(syntax: string, functionName: string): string | null {
  try {
    const match = syntax.match(/\(([^)]*)\)/);
    if (!match) return null;

    const paramsString = match[1].trim();
    if (!paramsString) {
      return `${functionName}()`;
    }

    const params = paramsString.split(',').map(p => p.trim());
    const snippetParams = params.map((param, index) => {
      const paramName = param.split(/[=:]/)[0].trim();
      return `\${${index + 1}:${paramName}}`;
    });

    return `${functionName}(${snippetParams.join(', ')})`;
  } catch {
    return null;
  }
}

// Convert one data-layer entry to a vscode CompletionItem.
function completionFromData(data: CompletionData): vscode.CompletionItem {
  const completion = new vscode.CompletionItem(data.label, KIND_MAP[data.kind]);

  if (data.detail) {
    completion.detail = data.detail;
  }

  const hasDocs = data.syntax || data.description || data.returns || data.type || data.example || data.category;
  if (hasDocs) {
    completion.documentation = buildMarkdown(data);
  }

  if (data.kind === 'function' && data.syntax) {
    const snippet = createSnippetFromSyntax(data.syntax, data.label);
    if (snippet) {
      completion.insertText = new vscode.SnippetString(snippet);
    }
  }

  if (data.kind === 'module') {
    completion.insertText = new vscode.SnippetString(`${data.label}.$1`);
    completion.command = {
      command: 'editor.action.triggerSuggest',
      title: 'Trigger suggest'
    };
  }

  return completion;
}

// Helper to create completion item with rich documentation (legacy API).
export function createCompletionItem(
  label: string,
  kind: vscode.CompletionItemKind,
  item?: PineItem
): vscode.CompletionItem {
  const completion = new vscode.CompletionItem(label, kind);

  if (item) {
    completion.documentation = buildMarkdown(item);

    if (kind === vscode.CompletionItemKind.Function && item.syntax) {
      const snippet = createSnippetFromSyntax(item.syntax, label);
      if (snippet) {
        completion.insertText = new vscode.SnippetString(snippet);
      }
    }

    if (item.returns) {
      completion.detail = `→ ${item.returns}`;
    } else if (item.type) {
      completion.detail = item.type;
    }
  }

  return completion;
}

// Get completions for a specific namespace
export function getNamespaceCompletions(namespace: string, declaredNames?: DeclaredNames, cursorLine?: number): vscode.CompletionItem[] {
  return getNamespaceCompletionData(namespace, declaredNames, cursorLine).map(completionFromData);
}

// Get all completions (no namespace context)
export function getAllCompletions(): vscode.CompletionItem[] {
  return getAllCompletionData().map(completionFromData);
}

// `name=` parameter completions for the argument list the cursor is in
// (issue #13). Declaration order is pinned via sortText, and accepting an
// item re-triggers suggest so `style=` immediately offers its constants.
export function getNamedParameterCompletionItems(line: string, character: number): vscode.CompletionItem[] {
  return getNamedParameterCompletions(line, character).map((data, index) => {
    const item = completionFromData(data);
    item.sortText = `0_${String(index).padStart(3, '0')}`;
    item.command = { command: 'editor.action.triggerSuggest', title: 'Trigger suggest' };
    return item;
  });
}

// Constant completions for the value position after `name=` (issue #13).
// They must rank FIRST: VS Code sorts by sortText || label, so unpinned items
// (`abs`, `alert`, `array.*`, `close`) bury `shape.*` hundreds of entries
// down — pin declaration order with a sortText that precedes every plain
// label and preselect the first item (PR #51 review, finding 7). And they
// must survive a typed prefix (`style=sh`, `style=shape.ci`): filterText is
// the full label and the range replaces exactly the typed prefix after `=`,
// so the editor's filtering lets `sh` match `shape.circle` (finding 8).
export function getNamedArgumentValueItems(line: string, character: number, lineNumber = 0, rangeCharacter?: number): vscode.CompletionItem[] {
  const values = getNamedArgumentValueCompletions(line, character);
  if (values.length === 0) return [];
  const prefix = getNamedArgumentValuePrefix(line, character);
  return values.map((data, index) => {
    const item = completionFromData(data);
    item.sortText = `0_${String(index).padStart(3, '0')}`;
    item.preselect = index === 0;
    item.filterText = data.label;
    // `line` may hold earlier context lines; the replaced range is always on
    // the cursor's line, measured from the cursor's own column.
    const col = rangeCharacter ?? character;
    item.range = new vscode.Range(lineNumber, col - prefix.length, lineNumber, col);
    return item;
  });
}

// The ONLY items a '(' or ',' trigger may return (PR #51 review): constant
// values after `name=`, else the call's `name=` parameters (with their
// declaration-order pinning and re-trigger command). Empty anywhere else, so
// typing a comma in a tuple/array/declaration/comment never pops the global
// completion list.
export function getTriggerCharacterCompletionItems(line: string, character: number, lineNumber = 0, rangeCharacter?: number, triggerCharacter?: string): vscode.CompletionItem[] {
  // A grouping '(' — `plot((close + open` — is not a call: offer nothing.
  if (triggerCharacter === '(' && !isCallParenBeforeCursor(line.slice(0, character))) return [];
  const values = getNamedArgumentValueItems(line, character, lineNumber, rangeCharacter);
  if (values.length > 0) return values;
  return getNamedParameterCompletionItems(line, character);
}

// Get hover information for a symbol
export function getHoverInfo(symbol: string): vscode.Hover | undefined {
  const cfg = vscode.workspace.getConfiguration('pine');
  const mode = cfg.get<'full' | 'summary'>('docsMode', 'full');

  const data = getHoverData(symbol);
  if (!data) return undefined;

  const md = new vscode.MarkdownString();

  // Add header with symbol name
  md.appendMarkdown(`### ${symbol}\n\n`);

  if (data.syntax) {
    md.appendCodeblock(data.syntax, 'pine');
    md.appendMarkdown('\n\n');
  }

  // Add description (full or summary based on settings)
  if (data.description) {
    const desc = mode === 'summary'
      ? data.description.split('.')[0] + '.'
      : data.description;
    md.appendMarkdown(desc);
  }

  if (data.returns) {
    md.appendMarkdown(`\n\n**Returns:** \`${data.returns}\``);
  } else if (data.type) {
    md.appendMarkdown(`\n\n**Type:** \`${data.type}\``);
  }

  // Add example in full mode
  if (mode === 'full' && data.example) {
    md.appendMarkdown('\n\n**Example:**\n\n');
    md.appendCodeblock(data.example, 'pine');
  }

  if (data.category) {
    md.appendMarkdown(`\n\n_Category: ${data.category}_`);
  }

  md.isTrusted = true;
  md.supportHtml = true;

  return new vscode.Hover(md);
}

// Legacy exports for compatibility
export const BUILTIN_VARS = V6_VARIABLES;
export const BUILTIN_FUNCTIONS = V6_FUNCTIONS;
export const KEYWORDS = V6_KEYWORDS;
