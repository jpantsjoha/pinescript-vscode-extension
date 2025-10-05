import * as vscode from 'vscode';
import { V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../v6/v6-manual';

interface ParsedParameter {
  label: string;
  documentation?: string;
}

// Parse function syntax to extract parameters
function parseParameters(syntax: string): ParsedParameter[] {
  try {
    // Extract content between parentheses
    const match = syntax.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return [];

    const paramsString = match[1].trim();
    const params: ParsedParameter[] = [];

    // Split by comma, handling nested structures
    let current = '';
    let depth = 0;
    for (const char of paramsString) {
      if (char === '(' || char === '[' || char === '<') depth++;
      else if (char === ')' || char === ']' || char === '>') depth--;
      else if (char === ',' && depth === 0) {
        if (current.trim()) {
          params.push(parseParameter(current.trim()));
        }
        current = '';
        continue;
      }
      current += char;
    }
    if (current.trim()) {
      params.push(parseParameter(current.trim()));
    }

    return params;
  } catch {
    return [];
  }
}

// Parse individual parameter
function parseParameter(param: string): ParsedParameter {
  // Remove default values and type annotations for display
  const cleanParam = param.split('=')[0].trim();
  const paramName = cleanParam.split(':')[0].trim();

  return {
    label: param,
    documentation: undefined  // Could be enhanced with per-parameter docs
  };
}

// Calculate which parameter is active based on cursor position
function calculateActiveParameter(text: string): number {
  let depth = 0;
  let paramIndex = 0;

  for (const char of text) {
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (char === ',' && depth === 1) paramIndex++;
  }

  return paramIndex;
}

// Find function name before cursor
function findFunctionName(line: string, character: number): string | null {
  const beforeCursor = line.substring(0, character);

  // Match function call pattern: functionName( or namespace.functionName(
  const match = beforeCursor.match(/([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?)\s*\([^)]*$/i);
  if (!match) return null;

  return match[1];
}

export function createSignatureHelpProvider(): vscode.SignatureHelpProvider {
  return {
    provideSignatureHelp(document, position, token, context) {
      const line = document.lineAt(position.line).text;
      const functionName = findFunctionName(line, position.character);

      if (!functionName) return undefined;

      // Look up function in our v6 data
      let funcItem: PineItem | undefined = V6_FUNCTIONS[functionName];

      // Check namespaced functions
      if (!funcItem && functionName.includes('.')) {
        const [ns, fname] = functionName.split('.');
        const nsData = V6_NAMESPACES[ns];
        if (nsData?.functions) {
          funcItem = nsData.functions[fname];
        }
      }

      if (!funcItem || !funcItem.syntax) return undefined;

      // Parse parameters from syntax
      const params = parseParameters(funcItem.syntax);
      if (params.length === 0) return undefined;

      // Create signature information
      const sigInfo = new vscode.SignatureInformation(funcItem.syntax);

      // Add function documentation
      if (funcItem.description) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(funcItem.description);
        if (funcItem.returns) {
          md.appendMarkdown(`\n\n**Returns:** \`${funcItem.returns}\``);
        }
        sigInfo.documentation = md;
      }

      // Add parameters
      params.forEach(param => {
        const paramInfo = new vscode.ParameterInformation(
          param.label,
          param.documentation
        );
        sigInfo.parameters.push(paramInfo);
      });

      // Calculate active parameter
      const beforeCursor = line.substring(0, position.character);
      const activeParam = calculateActiveParameter(beforeCursor);

      const sigHelp = new vscode.SignatureHelp();
      sigHelp.signatures = [sigInfo];
      sigHelp.activeSignature = 0;
      sigHelp.activeParameter = Math.min(activeParam, params.length - 1);

      return sigHelp;
    }
  };
}
