// The three diagnostic sources the editor runs, collected without vscode, so the
// quick-fix module can re-validate the CURRENT text before acting on a diagnostic
// (issue #49). extension.ts runs the same three with the same suppression rule and
// the same range arithmetic; if a source moves (#55), this file moves with it.
import { AccurateValidator } from './parser/accurateValidator';
import { runDocumentChecks } from './parser/documentChecks';
// Same engine the extension loads: dist/engine, copied from the pinned package.
const engine = require('../engine/index.js');

export interface CurrentDiagnostic {
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  message: string;
  code?: string;
}

interface Finding { line: number; column: number; length?: number; message: string; checkId?: string }

const toDiagnostic = (f: Finding): CurrentDiagnostic => ({
  // extension.ts: Position(line - 1, column) and translate(0, length).
  range: {
    start: { line: f.line - 1, character: f.column },
    end: { line: f.line - 1, character: f.column + (f.length ?? 0) },
  },
  message: f.message,
  code: f.checkId,
});

const accurate = new AccurateValidator();

/** Every diagnostic the editor would publish for `text` right now. */
export function currentDiagnostics(text: string): CurrentDiagnostic[] {
  const out: CurrentDiagnostic[] = [];
  try { out.push(...accurate.validate(text).map(toDiagnostic)); } catch { /* the editor logs and skips */ }
  try {
    const suppressions = engine.extractSuppressions(text);
    out.push(...engine.applySuppressions(engine.runSemanticChecks(text), suppressions).map(toDiagnostic));
  } catch { /* as above */ }
  try { out.push(...runDocumentChecks(text).map(toDiagnostic)); } catch { /* as above */ }
  return out;
}
