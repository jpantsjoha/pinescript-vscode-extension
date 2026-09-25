// Quick fixes (issue #49): a thin vscode wrapper over quickFixData.ts, which holds
// every edit computation and is tested without vscode.
import * as vscode from 'vscode';
import { computeQuickFixes, DiagnosticInput } from './quickFixData';

export class PineQuickFixProvider implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const diagnostics = context.diagnostics;
    if (diagnostics.length === 0) return [];
    const inputs: DiagnosticInput[] = diagnostics.map(d => ({
      range: {
        start: { line: d.range.start.line, character: d.range.start.character },
        end: { line: d.range.end.line, character: d.range.end.character },
      },
      message: d.message,
      code: typeof d.code === 'object' ? d.code.value : d.code,
    }));
    return computeQuickFixes(document.getText(), inputs).map(fix => {
      const action = new vscode.CodeAction(fix.title, vscode.CodeActionKind.QuickFix);
      action.diagnostics = [diagnostics[fix.diagnosticIndex]];
      action.isPreferred = fix.isPreferred;
      const edit = new vscode.WorkspaceEdit();
      for (const e of fix.edits) {
        edit.replace(
          document.uri,
          new vscode.Range(e.range.start.line, e.range.start.character, e.range.end.line, e.range.end.character),
          e.newText
        );
      }
      action.edit = edit;
      return action;
    });
  }
}
