import * as vscode from 'vscode';
import {
  getSignatureData,
  findFunctionCallName,
  calculateActiveParameter
} from './intellisenseData';

export function createSignatureHelpProvider(): vscode.SignatureHelpProvider {
  return {
    provideSignatureHelp(document, position, token, context) {
      const line = document.lineAt(position.line).text;
      const functionName = findFunctionCallName(line, position.character);

      if (!functionName) return undefined;

      // One SignatureData per overload; empty when the function is unknown.
      const signatures = getSignatureData(functionName);
      if (signatures.length === 0) return undefined;

      const sigInfos = signatures.map(sig => {
        const sigInfo = new vscode.SignatureInformation(sig.label);
        if (sig.documentation) {
          const md = new vscode.MarkdownString();
          md.appendMarkdown(sig.documentation);
          sigInfo.documentation = md;
        }
        sig.parameters.forEach(param => {
          sigInfo.parameters.push(new vscode.ParameterInformation(param.label, param.documentation));
        });
        return sigInfo;
      });

      // Calculate active parameter from the cursor position
      const beforeCursor = line.substring(0, position.character);
      const activeParam = calculateActiveParameter(beforeCursor);

      const sigHelp = new vscode.SignatureHelp();
      sigHelp.signatures = sigInfos;
      sigHelp.activeSignature = 0;
      const paramCount = sigInfos[0].parameters.length;
      sigHelp.activeParameter = paramCount > 0 ? Math.min(activeParam, paramCount - 1) : 0;

      return sigHelp;
    }
  };
}
