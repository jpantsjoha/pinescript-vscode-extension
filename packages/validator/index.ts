/**
 * pinescript-v6-validator — the validation engine behind the Pine Script v6 IDE
 * Tools VS Code extension.
 *
 * Deliberately free of any `vscode` dependency, so the same engine runs in the
 * editor, in CI, in a headless CLI, and inside an MCP server. A second copy would
 * drift, and a drifted copy tells the user their script is broken while their
 * editor says it is fine.
 */

export { AccurateValidator, Severity } from './src/accurateValidator';
export type { ValidationError, DiagnosticSeverity } from './src/accurateValidator';
export { runDocumentChecks, blankStrings, blankComments } from './src/documentChecks';
export { PINE_FUNCTIONS_MERGED } from './data/parameter-requirements-merged';

import { AccurateValidator } from './src/accurateValidator';
import { runDocumentChecks } from './src/documentChecks';
import type { ValidationError } from './src/accurateValidator';

/**
 * Run every diagnostic source, in document order.
 *
 * Prefer this over calling `AccurateValidator` alone: the extension emits
 * diagnostics from two independent modules, and using only one produced a "clean"
 * verdict on files the editor was covering in squiggles.
 */
export function validatePineScript(source: string): ValidationError[] {
  return [
    ...new AccurateValidator().validate(source),
    ...runDocumentChecks(source),
  ].sort((a, b) => a.line - b.line || a.column - b.column);
}
