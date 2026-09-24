import * as vscode from 'vscode';
import { V6_VARIABLES, V6_FUNCTIONS, PineItem } from '../v6/v6-manual';
import {
  V6_KEYWORDS,
  CompletionData,
  getAllCompletionData,
  getNamespaceCompletionData,
  getHoverData
} from './intellisenseData';

// Re-export so existing imports of V6_KEYWORDS from this module keep working.
export { V6_KEYWORDS };

const KIND_MAP: Record<CompletionData['kind'], vscode.CompletionItemKind> = {
  function: vscode.CompletionItemKind.Function,
  variable: vscode.CompletionItemKind.Variable,
  keyword: vscode.CompletionItemKind.Keyword,
  module: vscode.CompletionItemKind.Module,
  color: vscode.CompletionItemKind.Color,
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
export function getNamespaceCompletions(namespace: string): vscode.CompletionItem[] {
  return getNamespaceCompletionData(namespace).map(completionFromData);
}

// Get all completions (no namespace context)
export function getAllCompletions(): vscode.CompletionItem[] {
  return getAllCompletionData().map(completionFromData);
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
