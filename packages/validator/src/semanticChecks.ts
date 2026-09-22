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
 * explicit lookahead argument, named (`lookahead=barmerge.lookahead_off`) or
 * positional (`barmerge.lookahead_off` as the fifth argument, the form TradingView's
 * own reference examples use). Stating the intent is what makes it deliberate.
 */
/**
 * The outer call's own top-level arguments, with any NESTED request.*() call masked
 * out. Pine allows `request.security(A, "W", request.security(B, "D", close, ...))`;
 * the inner call's `barmerge.lookahead_off` or `close[1]` must not exempt the outer
 * one. The inner call is assessed on its own when the scanner reaches it.
 */
function topLevelArgs(args: string): string[] {
  let masked = '';
  let i = 0;
  while (i < args.length) {
    const m = /^request\.[a-zA-Z_]+\s*\(/.exec(args.slice(i));
    const prev = i > 0 ? args[i - 1] : '';
    if (m && !/[a-zA-Z0-9_.]/.test(prev)) {
      let depth = 0;
      let quote = '';
      let j = i + m[0].length - 1;
      for (; j < args.length; j++) {
        const ch = args[j];
        if (quote) {
          if (ch === '\\') { j++; continue; }
          if (ch === quote) quote = '';
          continue;
        }
        if (ch === '"' || ch === "'") { quote = ch; continue; }
        if (ch === '(' || ch === '[') depth++;
        else if (ch === ')' || ch === ']') { depth--; if (depth === 0) break; }
      }
      masked += '__nested__';
      i = j + 1;
      continue;
    }
    masked += args[i];
    i++;
  }
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let cur = '';
  for (let k = 0; k < masked.length; k++) {
    const ch = masked[k];
    if (quote) {
      cur += ch;
      if (ch === '\\') { cur += masked[++k] ?? ''; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/**
 * From the '(' at `open` on line `i`, the balanced argument text of that call and
 * the line it closes on, joining forward across wrapped lines. Null when the call
 * never closes — a syntax error, not ours.
 */
function balancedArgs(lines: string[], i: number, open: number): { args: string; endLine: number } | null {
  let joined = lines[i].slice(open);
  let depth = 0;
  let endIdx = -1;
  let endLine = i;
  const scan = (chunk: string, offset: number): boolean => {
    for (let k = 0; k < chunk.length; k++) {
      const ch = chunk[k];
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') {
        depth--;
        if (depth === 0) { endIdx = offset + k; return true; }
      }
    }
    return false;
  };
  let closed = scan(joined, 0);
  for (let j = i + 1; j < lines.length && !closed; j++) {
    const offset = joined.length + 1;
    joined += '\n' + lines[j];
    endLine = j;
    closed = scan(lines[j], offset);
  }
  if (!closed) return null;
  return { args: joined.slice(1, endIdx), endLine };
}

//──────────────────────────────────────────────────────────
// S10 — hard-coded external feed without ignore_invalid_symbol
//──────────────────────────────────────────────────────────

/** 0-based slot of `ignore_invalid_symbol` in each request.*() signature. */
const IGNORE_INVALID_SLOT: Record<string, number> = {
  security: 5, security_lower_tf: 3, dividends: 4, earnings: 4, splits: 4, financial: 4, footprint: 3,
};

/**
 * A script that compiles can still halt on the chart. `request.security("FRED:X", …)`
 * is read from the VIEWER's plan at runtime; a feed that plan cannot read raises
 * `Permission denied for symbol` and stops the whole script. TradingView names only
 * the first failing feed, so the author discovers them one at a time — a 26-feed
 * macro dashboard died this way on 2026-09-22. `ignore_invalid_symbol=true` makes the
 * call return na instead.
 *
 * A hint, not a warning: the author may WANT the hard stop. Like S1 this flags a
 * decision that has not been stated, and is silent once `ignore_invalid_symbol`
 * appears, named or positional, whichever value it carries. Only a bare string
 * literal with an exchange prefix counts as external: `syminfo.tickerid`, `""`,
 * `ticker.new(...)`, an input variable or a concatenation are the author's business.
 */
function checkExternalFeed(lines: string[], rawLines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];
  const pattern = /(?<![a-zA-Z0-9_.])request\.(security_lower_tf|security|dividends|earnings|splits|financial|footprint)\s*\(/g;

  lines.forEach((text, i) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fn = match[1];
      const open = match.index + match[0].length - 1;
      const region = balancedArgs(lines, i, open);
      if (region === null) continue;
      const { args, endLine } = region;
      const top = topLevelArgs(args);
      if (top.length === 0) continue;

      // The first argument must be ONE bare string literal. Strings are blanked in
      // `lines`, so the literal reads as quotes around spaces.
      if (!/^(["'])\s*\1$/.test(top[0])) continue;

      // Blanking preserves length, so the same offsets index the raw text.
      let rawJoined = rawLines[i].slice(open);
      for (let j = i + 1; j <= endLine; j++) rawJoined += '\n' + rawLines[j];
      const rawArgs = rawJoined.slice(1, 1 + args.length);
      const q1 = args.search(/["']/);
      const q2 = args.indexOf(args[q1], q1 + 1);
      if (q1 === -1 || q2 === -1) continue;
      const literal = rawArgs.slice(q1 + 1, q2);
      if (!/^[A-Za-z0-9_]+:\S+$/.test(literal)) continue;  // "" or a bare ticker: chart-relative

      if (top.some(a => /^ignore_invalid_symbol\s*=/.test(a))) continue;
      if (top.length > IGNORE_INVALID_SLOT[fn]) continue;    // passed positionally, either value

      findings.push(makeFinding('S10', i + 1, match.index, match[0].length - 1,
        `"${literal}" is read from the viewer's plan at runtime; a feed it cannot read halts the ` +
        `script with "Permission denied for symbol". Pass ignore_invalid_symbol=true to degrade to ` +
        `na, or state the hard stop with // pine-ignore: S10.`));
    }
  });

  return findings;
}

function checkRepainting(lines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];
  const pattern = /(?<![a-zA-Z0-9_.])request\.security(?:_lower_tf)?\s*\(/g;

  lines.forEach((text, i) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const open = match.index + match[0].length - 1;
      let close = matchingParen(text, open);
      let args: string;

      if (close === -1) {
        // The call wraps. Previously this bailed with "assessed on its own line",
        // but nothing ever did — so every wrapped request.security escaped the
        // check, and wrapping is the COMMON formatting for this function.
        // Join forward until the parens balance.
        // Stop at the paren that closes THIS call, not the last one on the closing
        // line: `f(request.security(\n sym,\n "D",\n close), close[1])` used to take
        // `, close[1]` into the arguments and exempt the call (review probe, 2026-09-22).
        let joined = text.slice(open);
        let depth = 0;
        let endIdx = -1;
        const scan = (chunk: string, offset: number): boolean => {
          for (let k = 0; k < chunk.length; k++) {
            const ch = chunk[k];
            if (ch === '(' || ch === '[') depth++;
            else if (ch === ')' || ch === ']') {
              depth--;
              if (depth === 0) { endIdx = offset + k; return true; }
            }
          }
          return false;
        };
        let closed = scan(joined, 0);
        for (let j = i + 1; j < lines.length && !closed; j++) {
          const offset = joined.length + 1;
          joined += '\n' + lines[j];
          closed = scan(lines[j], offset);
        }
        if (!closed) continue;            // never closes — a syntax error, not ours
        args = joined.slice(1, endIdx);
      } else {
        args = text.slice(open + 1, close);
      }

      // Only the outer call's OWN arguments count. A nested request.*() decides for
      // itself; scoring the whole balanced region let an inner call's lookahead_off
      // or close[1] silence an outer call that had decided nothing (review, 2026-09-22).
      const top = topLevelArgs(args);

      // An explicit lookahead is a deliberate decision, whichever way it goes: named
      // anywhere, or positional in the FIFTH slot — the form TradingView's own
      // examples use. The named-only test shipped 26 false warnings on one
      // 1,489-line script whose every call passed it positionally (2026-09-22).
      if (top.some(a => /^lookahead\s*=/.test(a))) continue;
      if (top.length >= 5 && /^barmerge\.lookahead_(?:on|off)$/.test(top[4])) continue;

      // A history offset in the outer call's own arguments means the author is
      // reading a settled bar: close[1], hlc3[1], ta.sma(close, 14)[1] all qualify.
      if (top.some(a => /\[\s*\d+\s*\]/.test(a))) continue;

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
 *
 * INDENTATION ALONE IS NOT CONDITIONALITY. A user-defined function body is indented
 * for scope, not for branching, and `ta.*` inside one is the normal way to write a
 * reusable indicator helper:
 *
 *   f_norm(x, n) =>
 *       ma = ta.sma(x, n)      // runs whenever f_norm is called — not conditional
 *
 * Treating every indented line as a block flagged this, which is the false-positive
 * class the project holds to be worse than a miss. What matters is the nearest
 * ENCLOSING construct: a control-flow block makes the call conditional, a function
 * definition does not.
 */

/** `f(x) =>`, `method f(x) =>`, `export f(x) =>` — a definition, not a branch. */
const FUNCTION_DEF = /^\s*(?:export\s+)?(?:method\s+)?[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*=>/;

/** Constructs whose body genuinely runs only sometimes, or more than once per bar. */
const CONTROL_FLOW = /^\s*(?:if|else|for|while|switch)\b/;

function checkTaInConditional(lines: string[]): ValidationError[] {
  const findings: ValidationError[] = [];
  const taCall = /(?<![a-zA-Z0-9_.])ta\.[a-z_]+\s*\(/g;

  const statements = new Set(statementLines(lines).map(s => s.index));

  /**
   * True when the nearest enclosing block header for `line` is control flow.
   * Walks upward to the first line with strictly smaller indentation — that is the
   * construct this line's body belongs to.
   */
  const insideControlFlow = (line: number, indent: number): boolean => {
    for (let j = line - 1; j >= 0; j--) {
      if (!lines[j].trim()) continue;
      const outer = lines[j].search(/\S/);
      if (outer >= indent) continue;
      if (FUNCTION_DEF.test(lines[j])) return false;
      if (CONTROL_FLOW.test(lines[j])) return true;
      // Any other header (a `var x =` continuation, a type block) — keep climbing.
      indent = outer;
      if (outer === 0) return false;
    }
    return false;
  };

  lines.forEach((text, i) => {
    let match;
    while ((match = taCall.exec(text)) !== null) {
      const before = text.slice(0, match.index);

      // Inside a ternary — EITHER branch. The previous expression reduced to
      // "a '?' appears and no ':' sits between it and the call", which caught
      // `cond ? ta.sma(...) : na` but silently missed `cond ? na : ta.sma(...)`.
      // Both branches are conditional, so both corrupt the indicator's history.
      const inTernary = /\?/.test(before);

      const indent = text.search(/\S/);
      const inBlock =
        statements.has(i) && indent > 0 && insideControlFlow(i, indent);

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
    // `cancel` / `cancel_all` withdraw a PENDING ORDER; they do not close an open
    // position. Counting them as exits let a strategy with genuinely unbounded
    // risk pass clean — the precise thing S9 exists to catch.
    if (/(?<![a-zA-Z0-9_.])strategy\.(exit|close|close_all)\s*\(/.test(text)) {
      hasExit = true;
    }
  });

  if (!firstEntry || hasExit) return [];

  return [makeFinding('S9', firstEntry.line, firstEntry.column, 14,
    'This script opens positions but never closes them. Add strategy.exit or strategy.close — an entry without an exit is unbounded risk.')];
}

//──────────────────────────────────────────────────────────
// S3 — accumulator lifetime
//──────────────────────────────────────────────────────────

/** `var float sum = 0.0` / `var counter = 0` — a numeric seed, declared once. */
const VAR_ACCUMULATOR =
  /^\s*var(?:ip)?\s+(?:[A-Za-z_][A-Za-z0-9_]*\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?|na)\s*$/;

/** A `for`/`while` header and its indentation. */
const LOOP_HEADER = /^(\s*)(for|while)\b/;

/**
 * Run-once initialisation is a legitimate reason to accumulate into a `var` with no
 * reset. Building a lookup table on the first bar is correct code, and flagging it
 * would be exactly the false positive that gets a validator switched off.
 */
const RUN_ONCE_GUARD = /barstate\.is(first|last)|bar_index\s*==\s*0/;

/**
 * Flag a `var` accumulator that a loop re-accumulates into on every bar without a
 * reset.
 *
 * The original spec had only the opposite shape — an accumulator MISSING `var`,
 * which resets each bar. This is the inverse, and it is the more expensive half:
 *
 *   var float sum = 0.0
 *   for i = 0 to 9
 *       sum := sum + close[i]     // adds ten more closes every bar, forever
 *
 * The author wanted "sum of the last ten closes" and gets a number that grows for
 * the life of the chart. A missing `var` produces a visibly constant series; this
 * produces a plausible one that drifts, which is the defect that survives a
 * backtest and reaches a funded account.
 *
 * The `while` form fails differently and more quietly — the state that the
 * condition tests survives the bar, so the loop simply never runs again:
 *
 *   var int counter = 0
 *   while counter < 5
 *       counter += 1              // on bar 2 counter is already 5
 *
 * Structural, not an inference about intent: a `var` with a numeric seed,
 * re-assigned to itself inside a loop body, with no reset between the declaration
 * and the loop.
 */
function checkAccumulatorLifetime(lines: string[]): ValidationError[] {
  const declared = new Map<string, number>();

  lines.forEach((text, i) => {
    const match = VAR_ACCUMULATOR.exec(text);
    if (match) declared.set(match[1], i);
  });

  if (declared.size === 0) return [];

  const findings: ValidationError[] = [];
  const reported = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const header = LOOP_HEADER.exec(lines[i]);
    if (!header) continue;

    const loopIndent = header[1].length;
    const keyword = header[2];

    // Body = the contiguous run of more-indented lines beneath the header.
    const body: number[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].trim()) continue;
      const indent = lines[j].search(/\S/);
      if (indent <= loopIndent) break;
      body.push(j);
    }
    if (body.length === 0) continue;

    for (const [name, declLine] of declared) {
      if (reported.has(name) || declLine > i) continue;

      const selfAssign = new RegExp(
        `(?<![\\w.])${name}\\s*(?:(?:\\+|-|\\*|/|%)=|:=\\s*(?![=]).*(?<![\\w.])${name}(?![\\w]))`
      );
      const hit = body.find(j => selfAssign.test(lines[j]));
      if (hit === undefined) continue;

      // A reset before the loop makes this correct: the `var` is a reused buffer
      // rather than a running total. It must run every bar, so it has to sit at or
      // outside the loop's own indentation.
      const resetPattern = new RegExp(`^\\s*${name}\\s*:=\\s*(?![=])(.*)$`);
      let wasReset = false;
      let runOnce = false;

      for (let j = declLine + 1; j < i; j++) {
        const indent = lines[j].search(/\S/);
        if (RUN_ONCE_GUARD.test(lines[j]) && indent <= loopIndent) runOnce = true;

        const reset = resetPattern.exec(lines[j]);
        if (reset && indent <= loopIndent &&
            !new RegExp(`(?<![\\w.])${name}(?![\\w])`).test(reset[1])) {
          wasReset = true;
        }
      }
      if (wasReset || runOnce) continue;

      reported.add(name);
      const column = lines[hit].search(/\S/);

      findings.push(makeFinding('S3', hit + 1, column < 0 ? 0 : column, name.length,
        keyword === 'while'
          ? `'${name}' is declared with var, so it keeps its value across bars. ` +
            `On the next bar the while condition is already false and this loop never runs again. ` +
            `Reset '${name}' before the loop, or drop var if it is per-bar state.`
          : `'${name}' is declared with var, so it persists across bars and this loop adds to it ` +
            `again on every bar — it grows without bound. Drop var if you want a per-bar total, ` +
            `or reset '${name}' before the loop.`));
    }
  }

  return findings;
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
  // S10 needs the string literals back — same offsets, blanking preserves length.
  const rawLines = source.split('\n');

  return [
    ...checkPlotLimit(lines),
    ...checkRequestLimit(lines),
    ...checkGlobalScopeOnly(lines),
    ...checkRepainting(lines),
    ...checkExternalFeed(lines, rawLines),
    ...checkTaInConditional(lines),
    ...checkAccumulatorLifetime(lines),
    ...checkEntryWithoutExit(lines),
  ].sort((a, b) => a.line - b.line || a.column - b.column);
}
