import * as vscode from 'vscode';
import { V6_VARIABLES, V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../v6/v6-manual';

// Keywords for Pine Script v6
export const V6_KEYWORDS = [
  'if', 'else', 'for', 'while', 'break', 'continue', 'return',
  'var', 'varip', 'const',
  'true', 'false', 'na',
  'export', 'import', 'as',
  'switch', 'case', 'default',
  'and', 'or', 'not',
  'int', 'float', 'bool', 'string', 'color', 'line', 'label', 'box', 'table', 'array', 'matrix', 'map',
  'series', 'simple', 'input', 'const',
];

// Helper to create completion item with rich documentation
export function createCompletionItem(
  label: string,
  kind: vscode.CompletionItemKind,
  item?: PineItem
): vscode.CompletionItem {
  const completion = new vscode.CompletionItem(label, kind);

  if (item) {
    // Create rich markdown documentation
    const md = new vscode.MarkdownString();

    // Add syntax if available
    if (item.syntax) {
      md.appendCodeblock(item.syntax, 'pine');
      md.appendMarkdown('\n\n');
    }

    // Add description
    if (item.description) {
      md.appendMarkdown(item.description);
    }

    // Add returns information
    if (item.returns) {
      md.appendMarkdown(`\n\n**Returns:** \`${item.returns}\``);
    }

    // Add type for variables
    if (item.type) {
      md.appendMarkdown(`\n\n**Type:** \`${item.type}\``);
    }

    // Add example if available
    if (item.example) {
      md.appendMarkdown('\n\n**Example:**');
      md.appendCodeblock(item.example, 'pine');
    }

    // Add category
    if (item.category) {
      md.appendMarkdown(`\n\n_Category: ${item.category}_`);
    }

    completion.documentation = md;

    // Create snippet for functions with syntax
    if (kind === vscode.CompletionItemKind.Function && item.syntax) {
      const snippet = createSnippetFromSyntax(item.syntax, label);
      if (snippet) {
        completion.insertText = new vscode.SnippetString(snippet);
      }
    }

    // Add detail (shows in completion list)
    if (item.returns) {
      completion.detail = `→ ${item.returns}`;
    } else if (item.type) {
      completion.detail = item.type;
    }
  }

  return completion;
}

// Convert function syntax to VS Code snippet
function createSnippetFromSyntax(syntax: string, functionName: string): string | null {
  try {
    // Extract parameters from syntax
    const match = syntax.match(/\(([^)]*)\)/);
    if (!match) return null;

    const paramsString = match[1].trim();
    if (!paramsString) {
      return `${functionName}()`;
    }

    // Split parameters and create placeholders
    const params = paramsString.split(',').map(p => p.trim());
    const snippetParams = params.map((param, index) => {
      // Extract parameter name (before any type annotation or default)
      const paramName = param.split(/[=:]/)[0].trim();
      return `\${${index + 1}:${paramName}}`;
    });

    return `${functionName}(${snippetParams.join(', ')})`;
  } catch {
    return null;
  }
}

// Get completions for a specific namespace
export function getNamespaceCompletions(namespace: string): vscode.CompletionItem[] {
  const items: vscode.CompletionItem[] = [];
  const nsData = V6_NAMESPACES[namespace];

  if (!nsData) return items;

  // Add functions from namespace
  if (nsData.functions) {
    Object.entries(nsData.functions).forEach(([name, item]) => {
      items.push(createCompletionItem(name, vscode.CompletionItemKind.Function, item as PineItem));
    });
  }

  // Add variables from namespace
  if (nsData.variables) {
    Object.entries(nsData.variables).forEach(([name, item]) => {
      items.push(createCompletionItem(name, vscode.CompletionItemKind.Variable, item as PineItem));
    });
  }

  // Add color constants for color namespace
  if (namespace === 'color' && nsData.constants) {
    Object.keys(nsData.constants).forEach(name => {
      const item = createCompletionItem(name, vscode.CompletionItemKind.Color);
      item.detail = nsData.constants[name];
      items.push(item);
    });
  }

  return items;
}

// Get all completions (no namespace context)
export function getAllCompletions(): vscode.CompletionItem[] {
  const items: vscode.CompletionItem[] = [];

  // Add variables
  Object.entries(V6_VARIABLES).forEach(([name, item]) => {
    items.push(createCompletionItem(name, vscode.CompletionItemKind.Variable, item));
  });

  // Add functions
  Object.entries(V6_FUNCTIONS).forEach(([name, item]) => {
    items.push(createCompletionItem(name, vscode.CompletionItemKind.Function, item));
  });

  // Add keywords
  V6_KEYWORDS.forEach(keyword => {
    items.push(createCompletionItem(keyword, vscode.CompletionItemKind.Keyword));
  });

  // Add namespace prefixes (for discoverability)
  Object.keys(V6_NAMESPACES).forEach(ns => {
    const item = new vscode.CompletionItem(ns, vscode.CompletionItemKind.Module);
    item.detail = V6_NAMESPACES[ns].description || `${ns} namespace`;
    item.insertText = new vscode.SnippetString(`${ns}.$1`);
    item.command = {
      command: 'editor.action.triggerSuggest',
      title: 'Trigger suggest'
    };
    items.push(item);
  });

  return items;
}

// Get hover information for a symbol
export function getHoverInfo(symbol: string): vscode.Hover | undefined {
  const cfg = vscode.workspace.getConfiguration('pine');
  const mode = cfg.get<'full' | 'summary'>('docsMode', 'full');

  // Check variables
  let item: PineItem | undefined = V6_VARIABLES[symbol];

  // Check functions
  if (!item) {
    item = V6_FUNCTIONS[symbol];
  }

  // Check namespace items
  if (!item && symbol.includes('.')) {
    const [ns, name] = symbol.split('.');
    const nsData = V6_NAMESPACES[ns];
    if (nsData) {
      item = nsData.functions?.[name] || nsData.variables?.[name];
    }
  }

  if (!item) return undefined;

  const md = new vscode.MarkdownString();

  // Add header with symbol name
  md.appendMarkdown(`### ${symbol}\n\n`);

  // Add syntax
  if (item.syntax) {
    md.appendCodeblock(item.syntax, 'pine');
    md.appendMarkdown('\n\n');
  }

  // Add description (full or summary based on settings)
  if (item.description) {
    const desc = mode === 'summary'
      ? item.description.split('.')[0] + '.'
      : item.description;
    md.appendMarkdown(desc);
  }

  // Add return type/type
  if (item.returns) {
    md.appendMarkdown(`\n\n**Returns:** \`${item.returns}\``);
  } else if (item.type) {
    md.appendMarkdown(`\n\n**Type:** \`${item.type}\``);
  }

  // Add example in full mode
  if (mode === 'full' && item.example) {
    md.appendMarkdown('\n\n**Example:**\n\n');
    md.appendCodeblock(item.example, 'pine');
  }

  // Add category
  if (item.category) {
    md.appendMarkdown(`\n\n_Category: ${item.category}_`);
  }

  md.isTrusted = true;
  md.supportHtml = true;

  return new vscode.Hover(md);
}

// Legacy exports for compatibility
export const BUILTIN_VARS = V6_VARIABLES;
export const BUILTIN_FUNCTIONS = V6_FUNCTIONS;
export const KEYWORDS = V6_KEYWORDS;
