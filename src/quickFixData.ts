// Quick-fix edit computation (issue #49). Pure and vscode-free, so every edit is
// testable under `node --test`: codeActions.ts only converts these plain objects
// into vscode.CodeAction instances.
//
// Every fix here follows the project rule that a wrong action is worse than no
// action: each one is offered only when the diagnostic it answers is present and
// the edit is unambiguous. When in doubt, return nothing.
//
// Reference data comes through this ONE import line (quickFixReference.ts takes
// it from src/engine.ts, the single engine loader).
import { REFERENCE_NAMES, builtinHasParameter } from './quickFixReference';
import { currentDiagnostics, CurrentDiagnostic } from './diagnosticSources';

export interface Position { line: number; character: number }
export interface Range { start: Position; end: Position }

/** `Diagnostic.source` on every diagnostic this extension publishes. */
export const PINE_DIAGNOSTIC_SOURCE = 'pine';

/** The parts of a vscode.Diagnostic the fixes read. */
export interface DiagnosticInput {
  range: Range;
  message: string;
  /** Semantic checks carry their id (`S1`..`S10`) here. */
  code?: string | number;
  /** Only diagnostics from PINE_DIAGNOSTIC_SOURCE are acted on. */
  source?: string;
}

export interface EditSpec { range: Range; newText: string }

export interface QuickFix {
  title: string;
  /** Index into the diagnostics array passed to computeQuickFixes. */
  diagnosticIndex: number;
  edits: EditSpec[];
  isPreferred: boolean;
}

//──────────────────────────────────────────────────────────
// Text helpers
//──────────────────────────────────────────────────────────

/** Offsets of each line start. Lines split on '\n'; a CRLF '\r' stays on its line. */
function lineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return starts;
}

class Doc {
  readonly starts: number[];
  readonly masked: string;        // strings and comments blanked, length preserved
  readonly stringsBlanked: string; // strings blanked, comments kept
  constructor(readonly text: string) {
    this.starts = lineStarts(text);
    this.stringsBlanked = blankStrings(text);
    this.masked = blankComments(this.stringsBlanked);
  }
  get lineCount(): number { return this.starts.length; }
  /** Line content without its terminator ('\n' or '\r\n'). */
  lineText(line: number): string {
    const start = this.starts[line];
    let end = line + 1 < this.starts.length ? this.starts[line + 1] - 1 : this.text.length;
    if (end > start && this.text[end - 1] === '\r') end--;
    return this.text.slice(start, end);
  }
  /** -1 unless the position lies on its line (a stale range must not spill into the next). */
  offsetAt(pos: Position): number {
    if (pos.line < 0 || pos.line >= this.starts.length) return -1;
    if (pos.character < 0 || pos.character > this.lineText(pos.line).length) return -1;
    return this.starts[pos.line] + pos.character;
  }
  positionAt(offset: number): Position {
    let lo = 0, hi = this.starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.starts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return { line: lo, character: offset - this.starts[lo] };
  }
  eol(): string { return /\r\n/.test(this.text) ? '\r\n' : '\n'; }
}

/** Same rules as the engine's blankStrings: quotes kept, contents blanked, length kept. */
function blankStrings(text: string): string {
  const blank = (m: string) => m[0] + m.slice(1, -1).replace(/[^\n]/g, ' ') + m[m.length - 1];
  return text
    .replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, blank);
}

/** Blank `//` comments (applied after strings, so `//` inside a literal is safe). */
function blankComments(text: string): string {
  return text.split('\n').map(line => {
    const at = line.indexOf('//');
    return at === -1 ? line : line.slice(0, at) + line.slice(at).replace(/[^\r]/g, ' ');
  }).join('\n');
}

/** Index of the bracket that closes the one at `open`, or -1. `s` must be masked. */
function matchingClose(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** The '(' enclosing `offset`, scanning backward over masked text, or -1. */
function enclosingOpenParen(s: string, offset: number): number {
  let depth = 0;
  for (let i = offset - 1; i >= 0; i--) {
    const ch = s[i];
    if (ch === ')' || ch === ']') depth++;
    else if (ch === '(' || ch === '[') {
      if (depth === 0) return ch === '(' ? i : -1;
      depth--;
    }
  }
  return -1;
}

interface Arg { start: number; end: number; name?: string; valueStart: number }

/** Top-level arguments of the call whose parens are at [open, close], as absolute offsets. */
function callArgs(masked: string, open: number, close: number): Arg[] {
  const args: Arg[] = [];
  let depth = 0;
  let segStart = open + 1;
  const push = (from: number, to: number) => {
    let a = from, b = to;
    while (a < b && /\s/.test(masked[a])) a++;
    while (b > a && /\s/.test(masked[b - 1])) b--;
    if (a === b) return;
    const seg = masked.slice(a, b);
    const named = /^([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*/.exec(seg);
    args.push({ start: a, end: b, name: named ? named[1] : undefined, valueStart: named ? a + named[0].length : a });
  };
  for (let i = open + 1; i < close; i++) {
    const ch = masked[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) { push(segStart, i); segStart = i + 1; }
  }
  push(segStart, close);
  return args;
}

/** Offset just after the last code character before `close` (skips blanked comments and newlines). */
function lastCodeCharEnd(masked: string, open: number, close: number): number {
  let i = close - 1;
  while (i > open && /\s/.test(masked[i])) i--;
  return i + 1;
}

function insertAt(doc: Doc, offset: number, newText: string): EditSpec {
  const p = doc.positionAt(offset);
  return { range: { start: p, end: p }, newText };
}

function replaceSpan(doc: Doc, from: number, to: number, newText: string): EditSpec {
  return { range: { start: doc.positionAt(from), end: doc.positionAt(to) }, newText };
}

//──────────────────────────────────────────────────────────
// 1. Misspelled namespace member
//──────────────────────────────────────────────────────────

/** Documented members (second segment) of each namespace, from the v6 reference. */
let membersByNamespace: Map<string, Set<string>> | undefined;
function namespaceMembers(ns: string): Set<string> {
  if (!membersByNamespace) {
    membersByNamespace = new Map();
    for (const full of REFERENCE_NAMES) {
      const [head, member] = full.split('.');
      if (!member) continue;
      if (!membersByNamespace.has(head)) membersByNamespace.set(head, new Set());
      membersByNamespace.get(head)!.add(member);
    }
  }
  return membersByNamespace.get(ns) ?? new Set();
}

/** Built-in type keywords: `color c = ...` annotates a type, it does not shadow. */
const TYPE_KEYWORDS = new Set(['color', 'line', 'label', 'box', 'table', 'linefill', 'polyline', 'chart']);

/**
 * True when the script may bind `ns` itself (a variable, a UDT-typed field, a
 * parameter, a loop variable), so `ns.member` might not be the built-in. Every
 * bare occurrence of the identifier must be one of: a namespace access (`ns.`),
 * a call of the built-in function of that name (`plot(`), a named argument of a
 * BUILT-IN call that documents a parameter called `ns` (`plot(..., color=...)`),
 * or a type annotation (`color c`). Anything else counts as a binding: a
 * defaulted parameter in a function or method head (`f(MyShape shape = na) =>`,
 * wrapped or not), a user-function argument, a declaration. `exceptAt` is the
 * diagnosed argument itself, already verified by the caller.
 */
function mayShadowNamespace(doc: Doc, ns: string, exceptAt = -1): boolean {
  const s = doc.masked;
  const re = new RegExp(`(?<![A-Za-z0-9_.])${ns}(?![A-Za-z0-9_])`, 'g');
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index === exceptAt) continue;
    let i = m.index + ns.length;
    while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
    const next = s[i] ?? '';
    if (next === '.') continue;
    if (next === '(') continue;   // the built-in function of the same name: plot(...), strategy(...)
    if (next === '=' && s[i + 1] !== '=' && isBuiltinNamedArgument(doc, m.index, ns)) continue;
    const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
    if (ident && ident[0] !== 'in' && TYPE_KEYWORDS.has(ns)) continue;
    return true;
  }
  return false;
}

/**
 * `name=` at `offset` is an argument of a call to a built-in function that
 * documents a parameter `name`, directly in that call's argument list, and the
 * parenthesised list is not a definition head (no `=>` after it, same line or
 * wrapped, and no `method` keyword before the name).
 */
function isBuiltinNamedArgument(doc: Doc, offset: number, name: string): boolean {
  const s = doc.masked;
  const open = enclosingOpenParen(s, offset);
  if (open < 0) return false;
  let j = offset - 1;
  while (j > open && /\s/.test(s[j])) j--;
  if (s[j] !== '(' && s[j] !== ',') return false;
  const head = /(?<![A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*$/.exec(s.slice(Math.max(0, open - 80), open));
  if (!head) return false;
  const before = s.slice(Math.max(0, open - 80), open - head[0].length);
  if (/\bmethod\s+$/.test(before)) return false;
  if (!builtinHasParameter(head[1], name)) return false;
  const close = matchingClose(s, open);
  if (close < 0) return false;
  return !/^\s*=>/.test(s.slice(close + 1, close + 200));
}

export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

const MAX_DISTANCE = 2;

/** The single documented member within MAX_DISTANCE of `member`, or undefined. */
export function suggestMember(ns: string, member: string): string | undefined {
  const close = [...namespaceMembers(ns)].filter(c => editDistance(member, c) <= MAX_DISTANCE);
  return close.length === 1 ? close[0] : undefined;
}

function fixMisspelledMember(doc: Doc, d: DiagnosticInput): Omit<QuickFix, 'diagnosticIndex'>[] {
  const m = /^Unknown ([a-z_][a-z0-9_]*) constant or function '([A-Za-z_][A-Za-z0-9_]*)'$/.exec(d.message);
  if (!m) return [];
  const [, ns, member] = m;
  const start = doc.offsetAt(d.range.start);
  // Re-verify against the CURRENT text: the whole token, preceded by `ns.`.
  if (start < 0 || doc.text.slice(start, start + member.length) !== member) return [];
  if (/[A-Za-z0-9_]/.test(doc.text[start + member.length] ?? '')) return [];
  if (doc.text.slice(start - ns.length - 1, start) !== `${ns}.`) return [];
  if (/[A-Za-z0-9_.]/.test(doc.text[start - ns.length - 2] ?? '')) return [];
  if (mayShadowNamespace(doc, ns)) return [];
  const suggestion = suggestMember(ns, member);
  if (!suggestion) return [];
  return [{
    title: `Change to ${ns}.${suggestion}`,
    edits: [replaceSpan(doc, start, start + member.length, suggestion)],
    isPreferred: true,
  }];
}

//──────────────────────────────────────────────────────────
// 2. plotshape/plotchar `shape=` → the parameter the validator names
//──────────────────────────────────────────────────────────

function fixShapeParameter(doc: Doc, d: DiagnosticInput): Omit<QuickFix, 'diagnosticIndex'>[] {
  const m = /^Invalid parameter "shape"(?: for (plotshape|plotchar)\(\))?\. Did you mean "(style|char)"\?$/.exec(d.message);
  if (!m) return [];
  const correct = m[2];
  const start = doc.offsetAt(d.range.start);
  if (start < 0 || !/^shape\s*=(?!=)/.test(doc.masked.slice(start, start + 40))) return [];
  const open = enclosingOpenParen(doc.masked, start);
  if (open < 0) return [];
  const fn = /(?<![A-Za-z0-9_.])(plotshape|plotchar)\s*$/.exec(doc.masked.slice(Math.max(0, open - 40), open));
  if (!fn || fn[1] !== (correct === 'style' ? 'plotshape' : 'plotchar')) return [];
  const close = matchingClose(doc.masked, open);
  if (close < 0) return [];
  const args = callArgs(doc.masked, open, close);
  const arg = args.find(a => a.start === start && a.name === 'shape');
  if (!arg) return [];
  // Renaming onto a parameter the call already passes would create a duplicate.
  if (args.some(a => a.name === correct)) return [];
  // plotchar's `char` takes a string; renaming `shape=shape.xcross` to `char=` would
  // swap a reported error for a silent type error. Only a string literal qualifies.
  const value = doc.text.slice(arg.valueStart, arg.end);
  if (correct === 'char' && !/^["']/.test(value)) return [];
  // plotshape's `style` takes a shape.* constant (or its string). `shape=color.red`
  // most likely meant `color=`, so anything else gets no rename.
  if (correct === 'style') {
    // `MyShape shape = ...` makes `shape.circle` a user field, not a style.
    if (mayShadowNamespace(doc, 'shape', start)) return [];
    const member = /^shape\.([A-Za-z_][A-Za-z0-9_]*)$/.exec(value);
    const isShape = member !== null && namespaceMembers('shape').has(member[1]);
    if (!isShape && !/^(["'])[^"'\n]*\1$/.test(value)) return [];
  }
  return [{
    title: `Rename parameter to ${correct}`,
    edits: [replaceSpan(doc, start, start + 'shape'.length, correct)],
    isPreferred: false,
  }];
}

//──────────────────────────────────────────────────────────
// 3. S10 — add ignore_invalid_symbol=true
//──────────────────────────────────────────────────────────

const FEED_FUNCTIONS = /(?<![A-Za-z0-9_.])request\.(security_lower_tf|security|dividends|earnings|splits|financial)\s*$/;

/**
 * 0-based positional slot of `ignore_invalid_symbol`, from the v6 reference
 * signatures (none of these functions is overloaded). A function missing here
 * gets no action.
 */
const IGNORE_INVALID_SLOT: Record<string, number> = {
  security: 5,          // symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, ...
  security_lower_tf: 3, // symbol, timeframe, expression, ignore_invalid_symbol, ...
  dividends: 4,         // ticker, field, gaps, lookahead, ignore_invalid_symbol, currency
  earnings: 4,          // ticker, field, gaps, lookahead, ignore_invalid_symbol, currency
  splits: 4,            // ticker, field, gaps, lookahead, ignore_invalid_symbol
  financial: 4,         // symbol, financial_id, period, gaps, ignore_invalid_symbol, currency
};

function fixExternalFeed(doc: Doc, d: DiagnosticInput): Omit<QuickFix, 'diagnosticIndex'>[] {
  const start = doc.offsetAt(d.range.start);
  if (start < 0 || !/^["']/.test(doc.text[start] ?? '')) return [];
  const open = enclosingOpenParen(doc.masked, start);
  if (open < 0) return [];
  const fn = FEED_FUNCTIONS.exec(doc.masked.slice(Math.max(0, open - 40), open));
  if (!fn || IGNORE_INVALID_SLOT[fn[1]] === undefined) return [];
  const close = matchingClose(doc.masked, open);
  if (close < 0) return [];
  const args = callArgs(doc.masked, open, close);
  // The literal must still be the symbol argument, and an exchange-prefixed feed.
  if (args.length === 0 || args[0].valueStart !== start) return [];
  if (!/^(["'])[A-Za-z0-9_]+:[^\s"']+\1$/.test(doc.text.slice(args[0].valueStart, args[0].end))) return [];
  if (args.some(a => a.name === 'ignore_invalid_symbol')) return [];
  // Supplied positionally: every argument up to and including its slot is positional.
  const firstNamed = args.findIndex(a => a.name !== undefined);
  const positional = firstNamed === -1 ? args.length : firstNamed;
  if (positional > IGNORE_INVALID_SLOT[fn[1]]) return [];
  // A positional argument after a named one is not Pine; leave such a call alone.
  if (args.slice(positional).some(a => a.name === undefined)) return [];
  const at = lastCodeCharEnd(doc.masked, open, close);
  const sep = doc.masked[at - 1] === ',' ? ' ' : ', ';
  return [{
    title: 'Add ignore_invalid_symbol=true',
    edits: [insertAt(doc, at, `${sep}ignore_invalid_symbol=true`)],
    isPreferred: false,
  }];
}

//──────────────────────────────────────────────────────────
// 4. S1 — no rewrite
//──────────────────────────────────────────────────────────

// S1 gets only the ignore action. Whether `expr[1]` with lookahead_on is right
// depends on facts the text cannot prove: that the requested timeframe is higher
// than the chart's (on the same or a lower one the rewrite changes the value),
// that the expression is not already an offset alias (`settled = close[1]`), and
// that it does not return a tuple (`ta.vwap(src, anchor, mult)` does). A rewrite
// that writes wrong Pine is worse than none.

//──────────────────────────────────────────────────────────
// 5. Any semantic check — `// pine-ignore: S<n>` on the line
//──────────────────────────────────────────────────────────

const DIRECTIVE_HEAD = /\/\/\s*pine-ignore\b\s*:?\s*/;

function fixIgnore(doc: Doc, d: DiagnosticInput, id: string): Omit<QuickFix, 'diagnosticIndex'>[] {
  const line = d.range.start.line;
  if (line < 0 || line >= doc.lineCount) return [];
  // Engine messages lead with their id: `[S1] Possible repainting ...`.
  if (!d.message.startsWith(`[${id}]`)) return [];
  const lineStart = doc.starts[line];
  const content = doc.lineText(line);
  // Search with strings blanked: a `//` or `pine-ignore` inside a literal is data.
  const blanked = doc.stringsBlanked.slice(lineStart, lineStart + content.length);
  const title = `Ignore ${id} on this line`;

  const directive = DIRECTIVE_HEAD.exec(blanked);
  if (directive) {
    // Same list grammar as the engine's extractSuppressions. A bare directive
    // ignores everything, and a list that names the id already covers it: leave both.
    const listed = (/^[A-Za-z0-9,\s]*/.exec(blanked.slice(directive.index + directive[0].length))![0])
      .split(',').map(part => part.trim().toUpperCase()).filter(Boolean);
    if (listed.length === 0 || listed.includes(id)) return [];
    // Put the id first in the existing list: the engine reads only the first
    // directive on a line, and a list that ends in prose still parses its head.
    const at = lineStart + directive.index + directive[0].length;
    return [{ title, edits: [insertAt(doc, at, `${id}, `)], isPreferred: false }];
  }

  const comment = blanked.indexOf('//');
  if (comment !== -1) {
    // Lead the existing comment with the directive so the note after it cannot
    // disturb parsing: `x // note` -> `x // pine-ignore: S1 // note`.
    return [{ title, edits: [insertAt(doc, lineStart + comment, `// pine-ignore: ${id} `)], isPreferred: false }];
  }

  return [{ title, edits: [insertAt(doc, lineStart + content.length, ` // pine-ignore: ${id}`)], isPreferred: false }];
}

//──────────────────────────────────────────────────────────
// 6. Missing //@version=6
//──────────────────────────────────────────────────────────

function fixVersion(doc: Doc, d: DiagnosticInput): Omit<QuickFix, 'diagnosticIndex'>[] {
  if (d.message !== 'Recommend using //@version=6 for Pine v6.') return [];
  // Another version (//@version=5) is a migration, not a typo: rewriting it could
  // change what the script means, so no action is offered.
  if (/^\s*\/\/\s*@version\s*=/m.test(doc.text)) return [];
  return [{
    title: 'Insert //@version=6',
    // After a leading byte-order mark, which must stay the first character.
    edits: [insertAt(doc, doc.text.startsWith('\uFEFF') ? 1 : 0, `//@version=6${doc.eol()}`)],
    isPreferred: true,
  }];
}

//──────────────────────────────────────────────────────────
// Entry point
//──────────────────────────────────────────────────────────

function semanticId(d: DiagnosticInput): string | undefined {
  return typeof d.code === 'string' && /^S\d+$/.test(d.code) ? d.code : undefined;
}

/**
 * Quick fixes for the given diagnostics against the document text. Duplicate
 * actions (two diagnostic sources reporting the same defect) are returned once.
 */
export function computeQuickFixes(
  text: string,
  diagnostics: DiagnosticInput[],
  validate: (text: string) => CurrentDiagnostic[] = cachedCurrentDiagnostics
): QuickFix[] {
  const doc = new Doc(text);
  const out: QuickFix[] = [];
  const seen = new Set<string>();
  let current: Set<string> | undefined;
  diagnostics.forEach((d, diagnosticIndex) => {
    // Foreign diagnostics (another extension, a linter) get nothing.
    if (d.source !== PINE_DIAGNOSTIC_SOURCE) return;
    // Never trust the incoming diagnostic: it may be stale. Act only when the
    // current text still produces exactly this finding (code, message, range).
    current ??= new Set(validate(text).map(diagnosticKey));
    if (!current.has(diagnosticKey(d))) return;
    const fixes: Omit<QuickFix, 'diagnosticIndex'>[] = [];
    const id = semanticId(d);
    if (id) {
      if (id === 'S10') fixes.push(...fixExternalFeed(doc, d));
      fixes.push(...fixIgnore(doc, d, id));
    } else {
      fixes.push(...fixMisspelledMember(doc, d), ...fixShapeParameter(doc, d), ...fixVersion(doc, d));
    }
    for (const fix of fixes) {
      const key = fix.title + JSON.stringify(fix.edits);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...fix, diagnosticIndex });
    }
  });
  return out;
}

function diagnosticKey(d: { range: Range; message: string; code?: string | number }): string {
  const { start, end } = d.range;
  return `${d.code ?? ''}|${start.line}:${start.character}-${end.line}:${end.character}|${d.message}`;
}

// provideCodeActions runs on every cursor move; validation runs once per text.
let cachedText: string | undefined;
let cachedResult: CurrentDiagnostic[] = [];
function cachedCurrentDiagnostics(text: string): CurrentDiagnostic[] {
  if (text !== cachedText) {
    cachedResult = currentDiagnostics(text);
    cachedText = text;
  }
  return cachedResult;
}

/** Apply non-overlapping edits to `text` (used by tests; VS Code applies them itself). */
export function applyEdits(text: string, edits: EditSpec[]): string {
  const doc = new Doc(text);
  const withOffsets = edits.map((e, i) => ({ i, from: doc.offsetAt(e.range.start), to: doc.offsetAt(e.range.end), newText: e.newText }));
  // Last edit first; at a shared offset the later edit goes first so the earlier
  // one's text ends up in front, as VS Code orders same-position inserts.
  withOffsets.sort((a, b) => b.from - a.from || b.to - a.to || b.i - a.i);
  let out = text;
  for (const e of withOffsets) out = out.slice(0, e.from) + e.newText + out.slice(e.to);
  return out;
}
