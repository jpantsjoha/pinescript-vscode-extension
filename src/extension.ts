import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import {
  getAllCompletions,
  getNamespaceCompletions,
  getHoverInfo,
  createCompletionItem
} from './completions';
import { createSignatureHelpProvider } from './signatureHelp';
import { Parser } from './parser/parser';
import { PineScriptValidator } from './parser/validator';
import { ComprehensiveValidator } from './parser/comprehensiveValidator';
import { AccurateValidator } from './parser/accurateValidator';

// Shared output channel for user-visible logs
let outputChannel: vscode.OutputChannel | undefined;

function stringifyError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function logInfo(message: string): void {
  if (outputChannel) {
    outputChannel.appendLine(message);
  }
}

function logError(message: string): void {
  if (outputChannel) {
    outputChannel.appendLine(message);
    try { outputChannel.show(true); } catch { /* no-op */ }
  }
}

/**
 * Activates the Pine Script v6 VS Code extension.
 * Sets up language features, diagnostics, and commands.
 * Any initialization errors are surfaced to the user and re-thrown to fail activation.
 */
export function activate(context: vscode.ExtensionContext) {
  try {
    // Create Output Channel for user-visible logs
    outputChannel = vscode.window.createOutputChannel('Pine Script v6');
    context.subscriptions.push(outputChannel);

    // Optional: ensure files.associations maps *.pine -> pine
    {
      const cfg = vscode.workspace.getConfiguration();
      const shouldApply = cfg.get<boolean>('pine.applyFileAssociation', true);
      if (shouldApply) {
        const assoc = cfg.get<Record<string, string>>('files.associations', {});
        if (assoc['*.pine'] !== 'pine') {
          const newAssoc = { ...assoc, '*.pine': 'pine' };
          try {
            // VS Code returns a Thenable; wrap ignoring rejection for safety on readonly workspaces
            const t = cfg.update('files.associations', newAssoc, vscode.ConfigurationTarget.Workspace);
            // Avoid unhandled rejections without relying on .catch (not typed on Thenable)
            Promise.resolve(t as unknown as Promise<void>).then(() => undefined, () => undefined);
          } catch {
            // ignore
          }
        }
      }
    }
  // Formatter: trims trailing spaces, normalizes consecutive blank lines (max 1), and ensures final newline
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('pine', {
      provideDocumentFormattingEdits(document) {
        const edits: vscode.TextEdit[] = [];
        let lastWasEmpty = false;
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const trimmed = line.text.replace(/[\t ]+$/g, '');
          let out = trimmed;
          const isEmpty = out.length === 0;
          if (isEmpty && lastWasEmpty) {
            // collapse extra blank lines
            const deleteRange = new vscode.Range(line.range.start, line.rangeIncludingLineBreak.end);
            edits.push(vscode.TextEdit.delete(deleteRange));
            continue;
          }
          if (out !== line.text) {
            edits.push(vscode.TextEdit.replace(line.range, trimmed));
          }
          lastWasEmpty = isEmpty;
        }
        // Ensure final newline
        const lastLine = document.lineAt(document.lineCount - 1);
        if (lastLine.text.length !== 0) {
          edits.push(vscode.TextEdit.insert(lastLine.range.end, '\n'));
        }
        return edits;
      }
    })
  );

  // Completion Provider - Enhanced with comprehensive v6 API
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'pine',
      {
        provideCompletionItems(document, position) {
          const line = document.lineAt(position.line).text;
          const beforeCursor = line.substring(0, position.character);

          // Check if we're completing after a namespace dot
          const namespaceMatch = beforeCursor.match(/([a-z]+)\.\s*$/);
          if (namespaceMatch) {
            const namespace = namespaceMatch[1];
            const nsItems = getNamespaceCompletions(namespace);
            if (nsItems.length > 0) {
              return nsItems;
            }
          }

          // Return all completions (includes built-ins, keywords, and namespace hints)
          const items = getAllCompletions();

          // Optional HTTP suggestions
          const cfg = vscode.workspace.getConfiguration();
          const enabled = cfg.get<boolean>('pine.httpSuggestions.enabled', false);
          const endpoint = cfg.get<string>('pine.httpSuggestions.endpoint', '');
          const timeoutMs = cfg.get<number>('pine.httpSuggestions.timeoutMs', 1200);

          if (!enabled || !endpoint) {
            return items;
          }

          return new Promise<vscode.CompletionItem[]>((resolve) => {
            try {
              const client = /^https:/i.test(endpoint) ? https : http;
              const req = client.request(endpoint, { method: 'POST', timeout: timeoutMs, headers: { 'Content-Type': 'application/json' } }, res => {
                const chunks: Buffer[] = [];
                res.on('data', c => chunks.push(Buffer.from(c)));
                res.on('end', () => {
                  try {
                    const body = Buffer.concat(chunks).toString('utf8');
                    const parsed = JSON.parse(body) as { suggestions?: string[] };
                    const extra = (parsed.suggestions || []).slice(0, 20).map(s => new vscode.CompletionItem(s, vscode.CompletionItemKind.Snippet));
                    resolve([...items, ...extra]);
                  } catch {
                    resolve(items);
                  }
                });
              });
              const wordPrefix = document.getWordRangeAtPosition(position);
              const prefixText = wordPrefix ? document.getText(wordPrefix) : '';
              const payload = JSON.stringify({
                documentText: document.getText(),
                position: { line: position.line, character: position.character },
                prefix: prefixText
              });
              req.on('error', () => resolve(items));
              req.write(payload);
              req.end();
            } catch {
              resolve(items);
            }
          });
        }
      },
      '.' // trigger on dot
    )
  );

  // Hover Provider - Enhanced with rich documentation
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('pine', {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z_.]+/);
        const symbol = range ? document.getText(range) : '';
        if (!symbol) return undefined;

        return getHoverInfo(symbol);
      }
    })
  );

  // Signature Help Provider - Parameter hints
  context.subscriptions.push(
    vscode.languages.registerSignatureHelpProvider(
      'pine',
      createSignatureHelpProvider(),
      '(', ','  // Trigger on opening paren and comma
    )
  );

  // Diagnostics with ENHANCED parameter validation
  const diagCollection = vscode.languages.createDiagnosticCollection('pine');
  context.subscriptions.push(diagCollection);
  const accurateValidator = new AccurateValidator();

  const runDiagnostics = (doc: vscode.TextDocument) => {
    if (doc.languageId !== 'pine') return;
    const text = doc.getText();
    const diags: vscode.Diagnostic[] = [];

    // Accurate validation using official TradingView parameter requirements
    try {
      const errors = accurateValidator.validate(text);

      logInfo(`[Pine Validator] Found ${errors.length} validation errors`);

      for (const error of errors) {
        const pos = new vscode.Position(error.line - 1, error.column);
        const endPos = pos.translate(0, error.length);
        diags.push(new vscode.Diagnostic(
          new vscode.Range(pos, endPos),
          error.message,
          error.severity
        ));
        logInfo(`  - Line ${error.line}: ${error.message}`);
      }
    } catch (e) {
      logError(`[Pine Validator] Validation error: ${stringifyError(e)}`);
    }

    // 1) Version header
    if (!/^\s*\/\/\@version=6/m.test(text)) {
      diags.push(new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), 'Recommend using //@version=6 for Pine v6.', vscode.DiagnosticSeverity.Warning));
    }

    // 2) input.timeframe suggestion
    if (/input\.string\s*\(\s*\"\d+\"\s*,\s*\"HTF/m.test(text) && !/input\.timeframe/m.test(text)) {
      diags.push(createDocDiag(doc, /input\.string\s*\(\s*\"\d+\"\s*,\s*\"HTF/m, 'Use input.timeframe(...) for timeframe inputs in v6.'));
    }

    // 3) time()/session boolean usage
    if (/\btime\(timeframe\.period,\s*\w+\)/m.test(text) && !/not\s+na\(time\(timeframe\.period,/m.test(text)) {
      diags.push(createDocDiag(doc, /time\(timeframe\.period,\s*\w+\)/m, 'Wrap session checks as: not na(time(timeframe.period, session)) to avoid bool-NA pitfalls.'));
    }

    // 4) ta.change in condition hint
    if (/ta\.change\s*\(/m.test(text) && /\?\s*\(|\)\s*and|\)\s*or/.test(text)) {
      diags.push(createDocDiag(doc, /ta\.change\s*\(/m, 'Consider assigning ta.change(...) to a variable before using in conditions for consistent evaluation.'));
    }

    // 5) timenow milliseconds reminder
    if (/timenow\s*-\s*\w+\s*<=\s*\w+\s*\*\s*60(?!\s*\*\s*1000)/m.test(text)) {
      diags.push(createDocDiag(doc, /timenow\s*-\s*\w+\s*<=\s*\w+\s*\*\s*60(?!\s*\*\s*1000)/m, 'timenow is in milliseconds. Multiply seconds by 1000.'));
    }

    // 6) Invalid functions (e.g., math.clamp)
    if (/\bmath\.clamp\b/.test(text)) {
      diags.push(createDocDiag(doc, /math\.clamp/, 'Pine v6: use math.min/math.max pattern; math.clamp is not available.'));
    }

    // 7) plotshape with wrong parameter name (shape= instead of style=)
    const plotshapeShapeMatch = /plotshape\s*\([^)]*\bshape\s*=/g;
    let match;
    while ((match = plotshapeShapeMatch.exec(text)) !== null) {
      const pos = doc.positionAt(match.index + match[0].indexOf('shape='));
      const endPos = pos.translate(0, 6); // length of "shape="
      diags.push(new vscode.Diagnostic(
        new vscode.Range(pos, endPos),
        'Invalid parameter "shape". Did you mean "style"?',
        vscode.DiagnosticSeverity.Error
      ));
    }

    // 8) plotchar with wrong parameter name (shape= instead of char=)
    const plotcharShapeMatch = /plotchar\s*\([^)]*\bshape\s*=/g;
    while ((match = plotcharShapeMatch.exec(text)) !== null) {
      const pos = doc.positionAt(match.index + match[0].indexOf('shape='));
      const endPos = pos.translate(0, 6);
      diags.push(new vscode.Diagnostic(
        new vscode.Range(pos, endPos),
        'Invalid parameter "shape". Did you mean "char"?',
        vscode.DiagnosticSeverity.Error
      ));
    }

    // 9) timeframe_gaps without timeframe parameter in indicator/strategy
    const indicatorMatch = /(indicator|strategy)\s*\([^)]*timeframe_gaps\s*=\s*true[^)]*\)/g;
    while ((match = indicatorMatch.exec(text)) !== null) {
      const fullCall = match[0];
      // Check if "timeframe" parameter is present in the call
      if (!/\btimeframe\s*=/.test(fullCall)) {
        const pos = doc.positionAt(match.index + fullCall.indexOf('timeframe_gaps'));
        const endPos = pos.translate(0, 14); // length of "timeframe_gaps"
        diags.push(new vscode.Diagnostic(
          new vscode.Range(pos, endPos),
          '"timeframe_gaps" has no effect without a "timeframe" argument in indicator/strategy call',
          vscode.DiagnosticSeverity.Warning
        ));
      }
    }

    // 10) alertcondition with too many arguments (should be 3: condition, title, message)
    const alertCondMatch = /alertcondition\s*\(([^)]+)\)/g;
    while ((match = alertCondMatch.exec(text)) !== null) {
      const args = match[1].split(',').map(a => a.trim());
      if (args.length > 3) {
        const pos = doc.positionAt(match.index);
        const endPos = pos.translate(0, 14); // length of "alertcondition"
        diags.push(new vscode.Diagnostic(
          new vscode.Range(pos, endPos),
          `alertcondition() expects 3 parameters (condition, title, message), but got ${args.length}`,
          vscode.DiagnosticSeverity.Error
        ));
      }
    }

    // 11) input.string() without required defval parameter
    const inputStringMatch = /input\.string\s*\(\s*\)/g;
    while ((match = inputStringMatch.exec(text)) !== null) {
      const pos = doc.positionAt(match.index);
      const endPos = pos.translate(0, 12); // length of "input.string"
      diags.push(new vscode.Diagnostic(
        new vscode.Range(pos, endPos),
        'input.string() requires at least one parameter: defval (default value)',
        vscode.DiagnosticSeverity.Error
      ));
    }

    diagCollection.set(doc.uri, diags);
  };

  const createDocDiag = (doc: vscode.TextDocument, re: RegExp, message: string): vscode.Diagnostic => {
    const m = re.exec(doc.getText());
    const pos = m ? doc.positionAt(m.index) : new vscode.Position(0, 0);
    return new vscode.Diagnostic(new vscode.Range(pos, pos.translate(0, 1)), message, vscode.DiagnosticSeverity.Warning);
  };

  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(runDiagnostics));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => runDiagnostics(e.document)));
  if (vscode.window.activeTextEditor) runDiagnostics(vscode.window.activeTextEditor.document);

  // Command: Validate current file
  context.subscriptions.push(
    vscode.commands.registerCommand('pine.validate', async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.document.languageId !== 'pine') {
        vscode.window.showInformationMessage('Open a Pine (.pine) file to validate.');
        return;
      }
      runDiagnostics(ed.document);
      vscode.window.showInformationMessage('Pine v6 validation completed.');
    })
  );

  // Command: Show docs for symbol
  context.subscriptions.push(
    vscode.commands.registerCommand('pine.showDocs', async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.document.languageId !== 'pine') {
        vscode.window.showInformationMessage('Open a Pine (.pine) file to show docs.');
        return;
      }
      const wordRange = ed.document.getWordRangeAtPosition(ed.selection.active, /[A-Za-z_.]+/);
      const word = wordRange ? ed.document.getText(wordRange) : '';
      const hoverInfo = getHoverInfo(word);
      if (!hoverInfo) {
        vscode.window.showInformationMessage(`No docs known for '${word}'.`);
        return;
      }
      const panel = vscode.window.createWebviewPanel('pineDocs', `Pine: ${word}`, vscode.ViewColumn.Beside, { enableScripts: false });
      const esc = (s: string) => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c] as string));
      // Extract markdown content from hover
      const md = hoverInfo.contents[0];
      const docText = typeof md === 'string' ? md : (md as vscode.MarkdownString).value;
      panel.webview.html = `<html><body><h2>${esc(word)}</h2><div style="white-space:pre-wrap;font-family:var(--vscode-editor-font-family)">${esc(docText)}</div></body></html>`;
    })
  );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try { vscode.window.showErrorMessage(`Pine Script v6 extension failed to activate: ${message}`); } catch { /* no-op */ }
    logError(`[Activation Error] ${stringifyError(error)}`);
    throw error;
  }
}

/**
 * Disposes extension resources.
 */
export function deactivate() {
  try { outputChannel?.dispose(); } catch { /* no-op */ }
}


