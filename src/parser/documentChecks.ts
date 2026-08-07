/**
 * Whole-document heuristic checks.
 *
 * These used to live inline in `extension.ts`, coupled to `vscode.TextDocument`,
 * which made them impossible to test or to run from the CLI. The consequence:
 * `validate-cli.js` and the golden corpus both reported "0 errors" on files the
 * editor was covering in squiggles — 28 false `alertcondition` errors across the
 * verified corpus alone, because the check split arguments with a naive
 * `String.split(',')` and truncated the call at the first `)`.
 *
 * Extracted here as a pure function over text so it is testable, CLI-runnable, and
 * covered by the same golden corpus as `AccurateValidator`.
 */

import { ValidationError } from './accurateValidator';

/** vscode.DiagnosticSeverity values, inlined so this module stays dependency-free. */
const SEVERITY_ERROR = 0;
const SEVERITY_WARNING = 1;
const SEVERITY_INFO = 2;

/**
 * Blank the contents of every string literal, preserving length and newlines, so
 * offsets stay valid and punctuation inside strings cannot be mistaken for syntax.
 * Multiline (`"""`/`'''`) literals are handled before single-line ones.
 */
export function blankStrings(text: string): string {
  const blank = (match: string) => match[0] + match.slice(1, -1).replace(/[^\n]/g, ' ') + match[match.length - 1];
  return text
    .replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, blank);
}

/**
 * From the index of an opening '(', return the index of its matching ')', or -1
 * when it never closes. Assumes string literals have already been blanked.
 */
function matchingParen(text: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    const char = text[i];
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split an argument list on top-level commas only. Assumes strings are blanked. */
function splitTopLevel(args: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of args) {
    if (char === '(' || char === '[') { depth++; current += char; }
    else if (char === ')' || char === ']') { depth--; current += char; }
    else if (char === ',' && depth === 0) { parts.push(current); current = ''; }
    else current += char;
  }
  if (current.trim()) parts.push(current);
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

function positionOf(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  const column = index - (before.lastIndexOf('\n') + 1);
  return { line, column };
}

export function runDocumentChecks(text: string): ValidationError[] {
  const errors: ValidationError[] = [];
  // All positional scanning happens on the blanked copy so that string contents
  // never influence syntax decisions, while offsets still map to the original.
  const scan = blankStrings(text);

  const add = (index: number, length: number, message: string, severity: number) => {
    const { line, column } = positionOf(text, index);
    errors.push({ line, column, length, message, severity: severity as any });
  };

  // 1) Version header
  if (!/^\s*\/\/@version=6/m.test(scan)) {
    errors.push({ line: 1, column: 0, length: 1, message: 'Recommend using //@version=6 for Pine v6.', severity: SEVERITY_WARNING as any });
  }

  // 2) input.timeframe suggestion
  const htfInput = /input\.string\s*\(\s*"\d+"\s*,\s*"HTF/m.exec(text);
  if (htfInput && !/input\.timeframe/m.test(scan)) {
    add(htfInput.index, 12, 'Use input.timeframe(...) for timeframe inputs in v6.', SEVERITY_WARNING);
  }

  // 3) time()/session boolean usage.
  //    Narrowed to a POSITIONAL second argument: `time(timeframe.period, session)`.
  //    The old pattern also matched named arguments, so the v6 `timeframe_bars_back=`
  //    parameter (added October 2025) tripped it on correct code.
  const sessionCall = /\btime\(timeframe\.period,\s*(?!\w+\s*=)\w+\s*\)/m.exec(scan);
  if (sessionCall && !/not\s+na\(time\(timeframe\.period,/m.test(scan)) {
    add(sessionCall.index, 4, 'Wrap session checks as: not na(time(timeframe.period, session)) to avoid bool-NA pitfalls.', SEVERITY_WARNING);
  }

  // 4) `ta.change` in conditions — REMOVED.
  //    The old check fired whenever a file contained `ta.change(` anywhere AND any
  //    `) and` / `) or` / `? (` anywhere else, with no connection between the two.
  //    It flagged 3 of 11 TradingView-verified files. A style hint that cannot be
  //    localised is noise, and noise on correct code is the failure mode this
  //    project cares most about.

  // 5) timenow milliseconds reminder
  const timenow = /timenow\s*-\s*\w+\s*<=\s*\w+\s*\*\s*60(?!\s*\*\s*1000)/m.exec(scan);
  if (timenow) {
    add(timenow.index, 7, 'timenow is in milliseconds. Multiply seconds by 1000.', SEVERITY_WARNING);
  }

  // 6) Functions that do not exist in v6
  const clamp = /\bmath\.clamp\b/.exec(scan);
  if (clamp) {
    add(clamp.index, 11, 'Pine v6: use math.min/math.max pattern; math.clamp is not available.', SEVERITY_WARNING);
  }

  // 7 & 8) plotshape/plotchar called with the wrong parameter name.
  //    Scans the balanced argument list rather than `[^)]*`, which stopped at the
  //    first nested ')' and missed any call with an expression argument.
  for (const [fn, correct] of [['plotshape', 'style'], ['plotchar', 'char']] as const) {
    const callPattern = new RegExp(`\\b${fn}\\s*\\(`, 'g');
    let call;
    while ((call = callPattern.exec(scan)) !== null) {
      const open = call.index + call[0].length - 1;
      const close = matchingParen(scan, open);
      if (close === -1) continue;
      const argsRegion = scan.slice(open + 1, close);
      const wrong = /\bshape\s*=/.exec(argsRegion);
      if (wrong) {
        add(open + 1 + wrong.index, 5, `Invalid parameter "shape". Did you mean "${correct}"?`, SEVERITY_ERROR);
      }
    }
  }

  // 9) timeframe_gaps without a timeframe argument
  const declPattern = /\b(indicator|strategy)\s*\(/g;
  let decl;
  while ((decl = declPattern.exec(scan)) !== null) {
    const open = decl.index + decl[0].length - 1;
    const close = matchingParen(scan, open);
    if (close === -1) continue;
    const argsRegion = scan.slice(open + 1, close);
    const gaps = /\btimeframe_gaps\s*=\s*true/.exec(argsRegion);
    if (gaps && !/\btimeframe\s*=/.test(argsRegion)) {
      add(open + 1 + gaps.index, 14, '"timeframe_gaps" has no effect without a "timeframe" argument in indicator/strategy call', SEVERITY_WARNING);
    }
  }

  // 10) alertcondition arity.
  //     v6 signature is alertcondition(condition, title, message) — at most three.
  //     The old check used `([^)]+)` (truncating at the first nested paren) and
  //     `split(',')` (blind to commas inside strings), so any message containing a
  //     comma — e.g. "Conditions met, reduce size" — was counted as an extra
  //     argument. That produced 28 false errors across the verified corpus.
  const alertPattern = /\balertcondition\s*\(/g;
  let alert;
  while ((alert = alertPattern.exec(scan)) !== null) {
    const open = alert.index + alert[0].length - 1;
    const close = matchingParen(scan, open);
    if (close === -1) continue; // unbalanced on this call — leave it to the parser
    const args = splitTopLevel(scan.slice(open + 1, close));
    if (args.length > 3) {
      add(alert.index, 14, `alertcondition() expects 3 parameters (condition, title, message), but got ${args.length}`, SEVERITY_ERROR);
    }
  }

  // 11) input.string() with no arguments
  const emptyInput = /\binput\.string\s*\(\s*\)/g;
  let empty;
  while ((empty = emptyInput.exec(scan)) !== null) {
    add(empty.index, 12, 'input.string() requires at least one parameter: defval (default value)', SEVERITY_ERROR);
  }

  return errors;
}

/** Severity constants re-exported for callers that cannot import vscode. */
export const DOCUMENT_CHECK_SEVERITY = {
  ERROR: SEVERITY_ERROR,
  WARNING: SEVERITY_WARNING,
  INFO: SEVERITY_INFO
};
