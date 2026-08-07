/**
 * Semantic checks — defects that COMPILE and are still wrong.
 *
 * The syntactic validator catches code TradingView will reject. These catch code
 * TradingView accepts and then behaves unexpectedly: a repainting signal, an
 * indicator whose history has gaps, an accumulator that silently resets.
 *
 * Practitioners are blunt about the cost: "one overlooked mistake — like a
 * repainting signal or scope error — can invalidate months of backtesting."
 *
 * All checks are line-based. See ADR-0002: the AST path crashes on valid input, and
 * every check specified here is reachable without one.
 *
 * Requirements: SPEC.md §Requirement: semantic checks (jpantsjoha/pinescript-plugin)
 */

import { ValidationError } from './accurateValidator';
import { SEMANTIC_CHECKS, SemanticCheckId } from './checkRegistry';
import { blankStrings, blankComments } from './documentChecks';

/** TradingView platform limits. Exceeding either is a hard compile failure. */
const MAX_PLOTS = 64;
const MAX_REQUESTS = 40;

/** Calls that count toward the plot budget. `hline` counts; `fill` does not. */
const PLOT_FUNCTIONS = ['plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar', 'hline'];

function makeFinding(
  id: SemanticCheckId,
  line: number,
  column: number,
  length: number,
  detail: string
): ValidationError {
  const check = SEMANTIC_CHECKS[id];
  return {
    line,
    column,
    length,
    message: `[${id}] ${check.title}. ${detail}`,
    severity: check.severity,
    checkId: id,
  };
}

/**
 * Lines that begin a statement, i.e. where parenthesis depth is zero.
 *
 * A wrapped call's continuation lines are indented, but that is formatting, not
 * scope. Treating them as statements would flag every multi-line `plot(` as a
 * scope violation — the exact false-positive class this project exists to avoid.
 */
function statementLines(lines: string[]): Array<{ index: number; text: string; indent: number }> {
  const out: Array<{ index: number; text: string; indent: number }> = [];
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const trimmed = text.trim();

    if (depth === 0 && trimmed) {
      const indent = text.search(/\S/);
      out.push({ index: i, text, indent: indent < 0 ? 0 : indent });
    }

    for (const char of text) {
      if (char === '(' || char === '[') depth++;
      else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
    }
  }

  return out;
}

//──────────────────────────────────────────────────────────
// S5 / S6 — platform limits
//──────────────────────────────────────────────────────────

function checkPlotLimit(lines: string[]): ValidationError[] {
  const occurrences: Array<{ line: number; column: number }> = [];

  lines.forEach((text, i) => {
    for (const fn of PLOT_FUNCTIONS) {
      const pattern = new RegExp(`(?<![a-zA-Z0-9_.])${fn}\\s*\\(`, 'g');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        occurrences.push({ line: i + 1, column: match.index });
      }
    }
  });

  if (occurrences.length <= MAX_PLOTS) return [];

  // Report on the call that breaches the cap, not on line 1 — the author needs to
  // know where the budget ran out.
  const breach = occurrences[MAX_PLOTS];
  return [makeFinding('S5', breach.line, breach.column, 4,
    `Found ${occurrences.length} plot calls; the limit is ${MAX_PLOTS}.`)];
}

function checkRequestLimit(lines: string[]): ValidationError[] {
  const occurrences: Array<{ line: number; column: number }> = [];
  const pattern = /(?<![a-zA-Z0-9_.])request\.[a-z_]+\s*\(/g;

  lines.forEach((text, i) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      occurrences.push({ line: i + 1, column: match.index });
    }
  });

  if (occurrences.length <= MAX_REQUESTS) return [];

  const breach = occurrences[MAX_REQUESTS];
  return [makeFinding('S6', breach.line, breach.column, 7,
    `Found ${occurrences.length} request.*() calls; the limit is ${MAX_REQUESTS}.`)];
}

//──────────────────────────────────────────────────────────
// S7 / S8 — global scope only
//──────────────────────────────────────────────────────────

function checkGlobalScopeOnly(lines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];

  for (const { index, text, indent } of statementLines(lines)) {
    if (indent === 0) continue; // global scope — nothing to check

    // S7 — plot() and friends must be called at global scope. To plot
    // conditionally, pass `na` as the series rather than wrapping in `if`.
    for (const fn of ['plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar', 'hline', 'bgcolor', 'fill']) {
      const match = new RegExp(`^\\s*${fn}\\s*\\(`).exec(text);
      if (match) {
        findings.push(makeFinding('S7', index + 1, indent, fn.length,
          `'${fn}()' is indented, so it sits inside a block. Move it to global scope and pass 'na' to plot conditionally.`));
        break;
      }
    }

    // S8 — Pine has no nested functions. A definition is `name(args) =>` at the
    // start of a statement; a CALL never has `=>`, so the arrow disambiguates.
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*=>/.test(text)) {
      findings.push(makeFinding('S8', index + 1, indent, 1,
        'Function definitions must be at root indentation, never inside an if, for or another function.'));
    }
  }

  return findings;
}

//──────────────────────────────────────────────────────────
// S1 — repainting request.security()
//──────────────────────────────────────────────────────────

/**
 * Flag a `request.security()` whose expression argument has no historical offset
 * and no explicit `lookahead`.
 *
 * `request.security(t, "D", close)` reads the CURRENT higher-timeframe bar, which
 * is still forming. History shows the settled value; live shows a moving one, so
 * the backtest measures something the market will not repeat. This is the most
 * cited defect in Pine.
 *
 * Silent when the author has shown they considered it — either `close[1]` or an
 * explicit `lookahead=` argument. Stating the intent is what makes it deliberate.
 */
function checkRepainting(lines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];
  const pattern = /(?<![a-zA-Z0-9_.])request\.security(?:_lower_tf)?\s*\(/g;

  lines.forEach((text, i) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const open = match.index + match[0].length - 1;
      const close = matchingParen(text, open);
      if (close === -1) continue;   // multi-line call — assessed on its own line

      const args = text.slice(open + 1, close);

      // An explicit lookahead is a deliberate decision, whichever way it goes.
      if (/\blookahead\s*=/.test(args)) continue;

      // A history offset anywhere in the expression means the author is reading a
      // settled bar: close[1], hlc3[1], ta.sma(close, 14)[1] all qualify.
      if (/\[\s*\d+\s*\]/.test(args)) continue;

      findings.push(makeFinding('S1', i + 1, match.index, 16,
        'Reading the current, still-forming higher-timeframe bar. Use close[1] or pass lookahead=barmerge.lookahead_off explicitly.'));
    }
  });

  return findings;
}

//──────────────────────────────────────────────────────────
// S2 — ta.* inside a conditional
//──────────────────────────────────────────────────────────

/**
 * Flag a `ta.*()` CALL inside a ternary or an indented block.
 *
 * `ta.*` functions carry internal state across bars. Calling one conditionally
 * means it only advances on some bars, so its history develops gaps and every
 * later value is wrong. It compiles perfectly.
 *
 * Deliberately narrow: only a call *inside* a conditional counts. Using the RESULT
 * of an unconditional call in a ternary — `v = ta.rsi(c,14)` then `x = cond ? v : na`
 * — is the correct idiom and by far the more common shape.
 */
function checkTaInConditional(lines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];
  const taCall = /(?<![a-zA-Z0-9_.])ta\.[a-z_]+\s*\(/g;

  const statements = new Set(statementLines(lines).map(s => s.index));

  lines.forEach((text, i) => {
    let match;
    while ((match = taCall.exec(text)) !== null) {
      const before = text.slice(0, match.index);

      // Inside a ternary: a '?' precedes the call on this line, and the call is
      // not itself the condition being tested.
      const inTernary = /\?/.test(before) && !/\?[^:]*$/.test(before) === false;

      // Inside an indented block: this line starts a statement AND is indented.
      const indent = text.search(/\S/);
      const inBlock = statements.has(i) && indent > 0;

      if (inTernary || inBlock) {
        findings.push(makeFinding('S2', i + 1, match.index, match[0].length - 1,
          'Compute it unconditionally on every bar, then select the result. A ta.* call that only runs sometimes has gaps in its history.'));
      }
    }
  });

  return findings;
}

//──────────────────────────────────────────────────────────
// S9 — entry with no exit
//──────────────────────────────────────────────────────────

/**
 * Flag a script that opens positions but never closes them.
 *
 * Script-level rather than per-entry: matching each `strategy.entry` id to its
 * exits needs flow analysis, and a heuristic that guessed would produce false
 * positives on legitimate multi-entry designs. The blunt version — entries exist,
 * no exit mechanism exists anywhere — is unambiguous.
 */
function checkEntryWithoutExit(lines: string[]): ValidationError[] {
  let firstEntry: { line: number; column: number } | null = null;
  let hasExit = false;

  lines.forEach((text, i) => {
    const entry = /(?<![a-zA-Z0-9_.])strategy\.(entry|order)\s*\(/.exec(text);
    if (entry && !firstEntry) firstEntry = { line: i + 1, column: entry.index };
    if (/(?<![a-zA-Z0-9_.])strategy\.(exit|close|close_all|cancel|cancel_all)\s*\(/.test(text)) {
      hasExit = true;
    }
  });

  if (!firstEntry || hasExit) return [];

  return [makeFinding('S9', firstEntry.line, firstEntry.column, 14,
    'This script opens positions but never closes them. Add strategy.exit or strategy.close — an entry without an exit is unbounded risk.')];
}

/** Index of the ')' matching the '(' at `openIndex`, or -1 if it never closes. */
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

//──────────────────────────────────────────────────────────

/**
 * Run every semantic check.
 *
 * Operates on text with strings and comments blanked, length-preserving, so
 * reported columns remain offsets into the original document.
 */
export function runSemanticChecks(source: string): ValidationError[] {
  const scan = blankComments(blankStrings(source));
  const lines = scan.split('\n');

  return [
    ...checkPlotLimit(lines),
    ...checkRequestLimit(lines),
    ...checkGlobalScopeOnly(lines),
    ...checkRepainting(lines),
    ...checkTaInConditional(lines),
    ...checkEntryWithoutExit(lines),
  ].sort((a, b) => a.line - b.line || a.column - b.column);
}
