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
export { SEMANTIC_CHECKS, extractSuppressions, applySuppressions } from './src/checkRegistry';
export type { SemanticCheckId, SemanticCheck, SuppressionMap } from './src/checkRegistry';
export { PINE_FUNCTIONS_MERGED } from './data/parameter-requirements-merged';

import { AccurateValidator } from './src/accurateValidator';
import { runDocumentChecks } from './src/documentChecks';
import { extractSuppressions, applySuppressions } from './src/checkRegistry';
import type { ValidationError } from './src/accurateValidator';

/**
 * Run every diagnostic source, in document order.
 *
 * Prefer this over calling `AccurateValidator` alone: the extension emits
 * diagnostics from two independent modules, and using only one produced a "clean"
 * verdict on files the editor was covering in squiggles.
 */
export function validatePineScript(source: string): ValidationError[] {
  // Directives are read from the ORIGINAL text. Every analysis pass below blanks
  // comments first, so a directive read later would already be whitespace.
  const suppressions = extractSuppressions(source);

  const findings = [
    ...new AccurateValidator().validate(source),
    ...runDocumentChecks(source),
  ];

  // Only semantic findings carry a checkId, so syntactic diagnostics pass through
  // untouched — a compile error is a fact, not a judgement, and hiding one would
  // mean shipping a script that cannot run.
  return applySuppressions(findings, suppressions)
    .sort((a, b) => a.line - b.line || a.column - b.column);
}
