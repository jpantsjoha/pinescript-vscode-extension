/**
 * IntelliSense data layer — vscode-free.
 *
 * Every completion item, signature and hover the providers show is decided HERE,
 * in plain data structures, so the coverage can be tested under `node --test`
 * (the providers themselves import 'vscode', which only exists inside the
 * extension host). src/completions.ts and src/signatureHelp.ts are thin
 * converters from these structures to vscode API objects.
 *
 * Sources, in precedence order:
 *  - v6/parameter-requirements-merged.ts (PINE_FUNCTIONS_MERGED): the full 475
 *    function reference crawled from TradingView, with manual overrides. This is
 *    the authority on WHICH functions exist and their signatures/overloads.
 *  - v6/v6-manual.ts (V6_VARIABLES / V6_FUNCTIONS / V6_NAMESPACES): the hand
 *    list. Authority for variables and keywords, and the fallback for
 *    descriptions/examples the crawl does not carry (51 merged entries are
 *    signature-only manual overrides with no description).
 *  - v6/reference-names.ts (REFERENCE_NAMES): the 371 namespaced constants and
 *    built-in variables the reference documents (xloc.bar_index, shape.circle,
 *    strategy.commission.percent, ...). Authority on WHICH of these exist.
 *  - v6/pine-constants-complete.ts (NAMESPACE_CONSTANTS, STRATEGY_VARIABLES):
 *    member lists per constant namespace, and the constant/variable split for
 *    strategy.*.
 */

import { V6_VARIABLES, V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../v6/v6-manual';
import { PINE_FUNCTIONS_MERGED } from '../v6/parameter-requirements-merged';
import { REFERENCE_NAMES, REFERENCE_NAME_DESCRIPTIONS } from '../v6/reference-names';
import { NAMESPACE_CONSTANTS, STRATEGY_VARIABLES } from '../v6/pine-constants-complete';
import { KEYWORDS } from '../v6/pine-builtins-complete';

// Keywords for Pine Script v6
export const V6_KEYWORDS = [
  'if', 'else', 'for', 'while', 'break', 'continue', 'return',
  'var', 'varip', 'const',
  'true', 'false', 'na',
  'export', 'import', 'as',
  'switch', 'case', 'default',
  'and', 'or', 'not',
  'int', 'float', 'bool', 'string', 'color', 'line', 'label', 'box', 'table', 'array', 'matrix', 'map',
  'series', 'simple', 'input', 'const',
];

/**
 * Loose structural view of a merged-reference entry. The merged object spreads
 * the generated spec (syntax/description/parameters) with the manual override
 * spec (signature only), so every field except `name` may be absent.
 */
interface ReferenceEntry {
  name: string;
  syntax?: string;
  description?: string;
  requiredParams?: string[];
  optionalParams?: string[];
  signature?: string;
  parameters?: { name: string; type?: string; description?: string; optional?: boolean; required?: boolean }[];
  overloads?: { requiredParams: string[]; optionalParams: string[]; signature: string }[];
  returns?: string;
}

const REFERENCE = PINE_FUNCTIONS_MERGED as unknown as Record<string, ReferenceEntry>;

export type CompletionKind = 'function' | 'variable' | 'keyword' | 'module' | 'color' | 'constant' | 'field';

export interface CompletionData {
  label: string;
  kind: CompletionKind;
  /** Shown next to the label in the completion list. For functions: the syntax (first overload). */
  detail?: string;
  syntax?: string;
  description?: string;
  returns?: string;
  type?: string;
  example?: string;
  category?: string;
}

export interface SignatureParamData {
  label: string;
  documentation?: string;
}

export interface SignatureData {
  label: string;
  documentation?: string;
  parameters: SignatureParamData[];
}

export interface HoverData {
  syntax?: string;
  description?: string;
  returns?: string;
  type?: string;
  example?: string;
  category?: string;
}

/** Best display syntax for a reference entry: syntax, else first overload, else signature. */
function firstSyntax(entry: ReferenceEntry): string | undefined {
  return entry.syntax || entry.overloads?.[0]?.signature || entry.signature;
}

/** `ta.sma(source, length) → series float` yields `series float`; undefined when absent. */
function extractReturns(syntax: string | undefined): string | undefined {
  if (!syntax) return undefined;
  const match = syntax.match(/→\s*(.+)$/);
  return match ? match[1].trim() : undefined;
}

/** Optional doc fields a v6-manual item (or already-built CompletionData) can contribute. */
type ManualDocFields = Partial<Pick<PineItem, 'description' | 'syntax' | 'returns' | 'type' | 'example' | 'category'>>;

/** Build the function CompletionData for one merged-reference key, enriched from v6-manual. */
function functionCompletion(label: string, entry: ReferenceEntry, manual?: ManualDocFields): CompletionData {
  const syntax = firstSyntax(entry) || manual?.syntax;
  return {
    label,
    kind: 'function',
    detail: syntax,
    syntax,
    description: entry.description || manual?.description,
    returns: entry.returns || extractReturns(syntax) || manual?.returns,
    example: manual?.example,
    category: manual?.category,
  };
}

function manualNamespaceItem(ns: string, name: string): PineItem | undefined {
  const nsData = V6_NAMESPACES[ns];
  if (!nsData) return undefined;
  return nsData.functions?.[name] || nsData.variables?.[name];
}

/**
 * All namespace/member maps are computed ONCE at module load (PR #46 review):
 * the source lists are immutable, so rebuilding them on every keystroke only
 * rescanned the same 371 names again and again.
 */

/**
 * All namespace paths: union of the v6-manual hand list and the reference.
 * The namespace of a key is everything up to its LAST dot, so nested
 * namespaces are included: `chart.point.new` → `chart.point`,
 * `strategy.closedtrades.profit` → `strategy.closedtrades`.
 */
const NAMESPACES: string[] = (() => {
  const names = new Set<string>(Object.keys(V6_NAMESPACES));
  for (const key of Object.keys(REFERENCE)) {
    const dot = key.lastIndexOf('.');
    if (dot > 0) names.add(key.slice(0, dot));
  }
  return [...names];
})();

/** First-segment namespaces (`chart`, `strategy`, ...) offered as top-level hints. */
const ROOT_NAMESPACES: string[] = (() => {
  const roots = new Set<string>();
  for (const ns of NAMESPACES) roots.add(ns.split('.')[0]);
  return [...roots];
})();

/**
 * Namespaces that exist only through documented constants/variables
 * (`xloc`, `shape`, `strategy.commission`, ...). Kept separate from
 * NAMESPACES so top-level completions stay unchanged.
 */
const CONSTANT_NAMESPACE_LIST: string[] = (() => {
  const names = new Set<string>();
  for (const fqn of REFERENCE_NAMES) {
    const dot = fqn.lastIndexOf('.');
    if (dot > 0) names.add(fqn.slice(0, dot));
  }
  return [...names];
})();

/** Every known namespace path, including the constant-only ones. */
const KNOWN_NAMESPACES: ReadonlySet<string> = new Set([
  ...NAMESPACES,
  ...CONSTANT_NAMESPACE_LIST,
  ...Object.keys(NAMESPACE_CONSTANTS),
]);

/** Immediate child sub-namespace labels per namespace (`strategy` → `closedtrades`, ...). */
const CHILD_NAMESPACES: ReadonlyMap<string, string[]> = (() => {
  const map = new Map<string, Set<string>>();
  for (const nsPath of [...NAMESPACES, ...CONSTANT_NAMESPACE_LIST]) {
    const dot = nsPath.lastIndexOf('.');
    if (dot < 0) continue;
    const parent = nsPath.slice(0, dot);
    const child = nsPath.slice(dot + 1);
    if (!map.has(parent)) map.set(parent, new Set());
    map.get(parent)!.add(child);
  }
  return new Map([...map].map(([k, v]) => [k, [...v]]));
})();

/**
 * Constant/variable member label → fully qualified name, per namespace.
 * The union of REFERENCE_NAMES and NAMESPACE_CONSTANTS — completions and
 * hover must cover exactly this set (PR #46 review).
 */
const MEMBERS_BY_NAMESPACE: ReadonlyMap<string, ReadonlyMap<string, string>> = (() => {
  const map = new Map<string, Map<string, string>>();
  const add = (ns: string, name: string) => {
    if (!map.has(ns)) map.set(ns, new Map());
    map.get(ns)!.set(name, `${ns}.${name}`);
  };
  for (const fqn of REFERENCE_NAMES) {
    const dot = fqn.lastIndexOf('.');
    if (dot > 0) add(fqn.slice(0, dot), fqn.slice(dot + 1));
  }
  for (const [ns, members] of Object.entries(NAMESPACE_CONSTANTS)) {
    for (const name of members) add(ns, name);
  }
  return map;
})();

/** Every fully qualified constant/variable name in MEMBERS_BY_NAMESPACE. */
const ALL_MEMBER_NAMES: ReadonlySet<string> = new Set(
  [...MEMBERS_BY_NAMESPACE.values()].flatMap(members => [...members.values()])
);

export function getNamespaces(): string[] {
  return NAMESPACES;
}

/**
 * Fully qualified names that are a type/namespace, never a value. `chart.point`
 * is the chart-point UDT (`chart.point.new(...)`); without this explicit
 * exception VARIABLE_ROOTS classifies every `chart.*` name as a variable, and
 * whether `chart.` offered `point` as a module depended on pass ordering
 * (PR #46 review).
 */
const TYPE_NAMESPACE_PATHS = new Set(['chart.point']);

/** Root namespaces whose documented members are all built-in variables. */
const VARIABLE_ROOTS = new Set(['barstate', 'chart', 'syminfo', 'timeframe']);

/** Roots whose `.all` member is a built-in variable (drawing-object lists). */
const ALL_VARIABLE_ROOTS = new Set(['box', 'label', 'line', 'linefill', 'polyline', 'table']);

/**
 * Constant vs variable for a fully qualified REFERENCE_NAMES entry. The crawl
 * lumps both into one list, so the split is by rule: all-variable roots,
 * STRATEGY_VARIABLES (plus the closedtrades/opentrades state), session.is*,
 * dividend/earnings actual/estimate/future_*, drawing `.all` lists, and the
 * ta.* cumulative-volume variables. Everything else is a constant.
 */
function isVariableName(fqn: string): boolean {
  if (TYPE_NAMESPACE_PATHS.has(fqn)) return false;
  const dot = fqn.indexOf('.');
  const root = fqn.slice(0, dot);
  const member = fqn.slice(dot + 1);
  if (VARIABLE_ROOTS.has(root)) return true;
  if (ALL_VARIABLE_ROOTS.has(root) && member === 'all') return true;
  if (root === 'strategy') {
    return STRATEGY_VARIABLES.has(member)
      || member.startsWith('closedtrades.') || member.startsWith('opentrades.');
  }
  if (root === 'session') return member.startsWith('is');
  if (root === 'dividends' || root === 'earnings') {
    return member === 'actual' || member === 'estimate' || member.startsWith('future_');
  }
  // ta.tr/ta.vwap are functions and never reach here (functions win the label).
  if (root === 'ta') return true;
  return false;
}

/**
 * Completion kind for a fully qualified constant/variable-style name. A path
 * that is itself a known namespace (`chart.point`, `strategy.commission`, ...)
 * is a module, explicitly — never a variable by root-rule accident.
 */
function referenceMemberKind(fqn: string): CompletionKind {
  if (TYPE_NAMESPACE_PATHS.has(fqn) || KNOWN_NAMESPACES.has(fqn)) return 'module';
  return isVariableName(fqn) ? 'variable' : 'constant';
}

/** All top-level completions: variables, functions, keywords, namespace hints. */
export function getAllCompletionData(): CompletionData[] {
  const items: CompletionData[] = [];
  // A label is offered once PER KIND. `time` is both a variable and a function
  // (`time("D")`), and `array` is both a type keyword and a namespace: keying on
  // the label alone hid `time()` and the `array.` namespace entry, which v0.6.4
  // offered (0.6.5 release audit). Same-kind duplicates are still collapsed.
  const seen = new Set<string>();
  const push = (item: CompletionData) => {
    const key = `${item.kind}:${item.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  // Variables (v6-manual is the authority)
  for (const [name, item] of Object.entries(V6_VARIABLES)) {
    push({ label: name, kind: 'variable', detail: item.type, ...item });
  }

  // Functions: every top-level (dot-free) key of the full reference,
  // plus any v6-manual function the reference does not list.
  for (const [key, entry] of Object.entries(REFERENCE)) {
    if (key.includes('.')) continue;
    push(functionCompletion(key, entry, V6_FUNCTIONS[key]));
  }
  for (const [name, item] of Object.entries(V6_FUNCTIONS)) {
    push({ label: name, kind: 'function', detail: item.syntax, ...item });
  }

  // Keywords
  for (const keyword of V6_KEYWORDS) {
    push({ label: keyword, kind: 'keyword' });
  }

  // Namespace prefixes (for discoverability)
  for (const ns of ROOT_NAMESPACES) {
    push({
      label: ns,
      kind: 'module',
      detail: V6_NAMESPACES[ns]?.description || `${ns} namespace`,
    });
  }

  return items;
}

/**
 * Member completions for one namespace (after typing `ns.`).
 *
 * `declaredNames` is the set of names the current document declares at GLOBAL
 * scope (see getDeclaredNames) — either a bare set or a name → declaration
 * line map. When the namespace's ROOT segment is such a name — a global
 * variable, tuple element, UDT/enum or import alias like `xloc = 1` — the
 * built-in namespace is shadowed and no built-in members are offered
 * (PR #46 review). Parameters, block locals, loop variables and `:=`
 * reassignments never shadow (delta review). With `cursorLine`, only a
 * declaration on an EARLIER line shadows: `xloc.` above `xloc = 1` still
 * offers the built-ins (delta review round 2).
 */
export function getNamespaceCompletionData(namespace: string, declaredNames?: DeclaredNames, cursorLine?: number): CompletionData[] {
  if (isShadowedNamespace(namespace, declaredNames, cursorLine)) return [];
  const byLabel = new Map<string, CompletionData>();
  const nsData = V6_NAMESPACES[namespace];

  // v6-manual members first (richer hand-written docs)
  if (nsData?.functions) {
    for (const [name, item] of Object.entries(nsData.functions) as [string, PineItem][]) {
      byLabel.set(name, { label: name, kind: 'function', detail: item.syntax, ...item });
    }
  }
  if (nsData?.variables) {
    for (const [name, item] of Object.entries(nsData.variables) as [string, PineItem][]) {
      byLabel.set(name, { label: name, kind: 'variable', detail: item.type, ...item });
    }
  }
  if (namespace === 'color' && nsData?.constants) {
    for (const [name, value] of Object.entries(nsData.constants) as [string, string][]) {
      byLabel.set(name, { label: name, kind: 'color', detail: value });
    }
  }

  // Every reference function in this namespace; enrich overlaps, add the rest.
  const prefix = `${namespace}.`;
  for (const [key, entry] of Object.entries(REFERENCE)) {
    if (!key.startsWith(prefix)) continue;
    const name = key.slice(prefix.length);
    if (name.includes('.')) continue;
    const existing = byLabel.get(name);
    if (existing) {
      const merged = functionCompletion(name, entry, existing);
      byLabel.set(name, { ...existing, ...Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) });
    } else {
      byLabel.set(name, functionCompletion(name, entry, manualNamespaceItem(namespace, name)));
    }
  }

  // Immediate child sub-namespaces as module hints
  // (`strategy.` offers closedtrades/opentrades/risk, `chart.` offers point).
  for (const child of CHILD_NAMESPACES.get(namespace) ?? []) {
    if (!byLabel.has(child)) {
      byLabel.set(child, { label: child, kind: 'module', detail: `${namespace}.${child} namespace` });
    }
  }

  // Documented constants and built-in variables (issue #45): the precomputed
  // union of REFERENCE_NAMES and NAMESPACE_CONSTANTS. Functions and v6-manual
  // members win the label; a name is offered once.
  const members = MEMBERS_BY_NAMESPACE.get(namespace);
  if (members) {
    for (const [name, fqn] of members) {
      if (byLabel.has(name)) continue;
      byLabel.set(name, {
        label: name,
        kind: referenceMemberKind(fqn),
        detail: fqn,
        description: REFERENCE_NAME_DESCRIPTIONS[fqn],
      });
    }
  }

  return [...byLabel.values()];
}

// ── Declared-name collection (namespace shadowing, PR #46 delta review) ──
//
// A user name shadows a built-in namespace ONLY when it is declared at GLOBAL
// scope (indent 0) by a statement-level declaration: `name = ...`,
// `var|varip [Type] name = ...`, `Type name = ...`, a global tuple
// `[a, b] = ...` (possibly wrapped across lines), a `type`/`enum` name, or an
// import alias. Function/method parameters, locals inside indented blocks
// (if/for/while/switch/function bodies), loop variables and `:=`
// reassignments NEVER shadow — wrongly hiding real completions is worse than
// occasionally showing them. Bracket depth is tracked ACROSS lines (strings
// and comments blanked first) so a named argument on a continuation line of a
// wrapped call — `line.new(\n    first_point = ..., xloc = xloc.bar_time)` —
// is never read as a declaration. Two deliberate blanking rules: a
// commented-out `xloc = 1` must not suppress `xloc.` completions, and a
// string containing `xloc = 1` must not either.
//
// Each declaration is stored with its 0-based line so the provider can shadow
// only when the declaration precedes the completion line (delta review
// round 2): `xloc.` on a line above `xloc = 1` must still offer the built-ins.

/** Names a document declares: a bare set (line-unaware) or name → 0-based declaration line. */
export type DeclaredNames = ReadonlySet<string> | ReadonlyMap<string, number>;

/** Reserved words never count as declarations (same rule as the validator). */
function isReservedKeywordName(word: string): boolean {
  return KEYWORDS.has(word) || word === 'true' || word === 'false' || word === 'break' || word === 'continue';
}

/** Blank multiline string bodies (`"""..."""` / `'''...'''`), preserving lines. */
function blankMultilineStrings(text: string): string {
  return text.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, match =>
    match.replace(/[^\n]/g, ' ')
  );
}

/** Blank string contents, then any trailing `//` comment, preserving length. */
function blankStringsAndComments(line: string): string {
  const noStrings = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, m => ' '.repeat(m.length));
  const at = noStrings.indexOf('//');
  return at === -1 ? noStrings : noStrings.slice(0, at) + ' '.repeat(noStrings.length - at);
}

/**
 * Every GLOBAL-scope statement-level name the document declares, mapped to
 * the 0-based line of its declaration (the first declaration wins). Used to
 * suppress built-in namespace completions when a user name shadows the
 * namespace root (`xloc = 1` at indent 0, then `xloc.`). Only indent-0 lines
 * outside any open bracket are considered, so parameters, block locals, loop
 * variables, `:=` reassignments and named arguments in wrapped calls are
 * never collected. A global tuple destructuring that wraps across lines —
 * `[xloc,\n    upper,\n    lower] = ta.bb(...)` — is joined before matching.
 */
export function getDeclaredNames(documentText: string): Map<string, number> {
  const names = new Map<string, number>();
  const declare = (n: string, line: number) => { if (!names.has(n)) names.set(n, line); };
  let depth = 0; // open `(`/`[` at the START of the line, tracked across lines
  const lines = blankMultilineStrings(documentText).split('\n').map(blankStringsAndComments);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const startLine = i;
    const isGlobal = depth === 0 && line.length > 0 && line[0] !== ' ' && line[0] !== '\t';
    if (isGlobal) {
      // A global tuple destructuring may wrap across lines; join it (up to
      // the closing `]`) before matching. Joining keeps the same characters,
      // so the bracket-depth update below is unaffected.
      if (line[0] === '[') {
        while (!line.includes(']') && i + 1 < lines.length) {
          i++;
          line += ' ' + lines[i].trim();
        }
      }
      // Statement-level assignment: `x = 1`, `float x = 1`, `var Foo x = ...`,
      // `array<float> xs = ...`. `:=` never declares; `==`/`=>` never match.
      // A leading "type" token that is a keyword (`for font = 0 to 9`) is not
      // a declaration either. Built-in TYPE names are not keywords here —
      // `float x = 1` is a valid typed declaration (delta review round 2).
      // `[var|varip] [const|input|simple|series] [Type] name =` (qualifier added
      // in the 0.6.5 release audit: `series Holder xloc = ...` must shadow).
      const stmtDecl = line.match(/^(?:var\s+|varip\s+)?(?:(?:const|input|simple|series)\s+)?(?:([A-Za-z_][\w.]*(?:<[^>]*>)?)\s+)?([A-Za-z_]\w*)\s*=(?![=>])/);
      if (stmtDecl && !isReservedKeywordName(stmtDecl[2])
          && !(stmtDecl[1] && isReservedKeywordName(stmtDecl[1].split(/[<.]/)[0]))) {
        declare(stmtDecl[2], startLine);
      }
      // Global tuple destructuring: `[a, b] = f()`.
      const tupleDecl = line.match(/^\[([^\]]+)\]\s*=(?![=>])/);
      if (tupleDecl) {
        for (const n of tupleDecl[1].split(',').map(t => t.trim())) {
          if (/^[A-Za-z_]\w*$/.test(n) && !isReservedKeywordName(n)) declare(n, startLine);
        }
      }
      // Library imports bind a namespace prefix: `import user/lib/1 as ta2`
      // binds `ta2`, and the same import without `as` binds the last segment.
      const importDecl = line.match(/^import\s+(?:[a-zA-Z_]\w*\/)*([a-zA-Z_]\w*)\/\d+(?:\s+as\s+([a-zA-Z_]\w*))?/);
      if (importDecl) declare(importDecl[2] || importDecl[1], startLine);
      // User-defined type / enum names (`type Foo`, `enum Bar`).
      const typeDecl = line.match(/^(?:export\s+)?(?:type|enum)\s+([a-zA-Z_]\w*)/);
      if (typeDecl) declare(typeDecl[1], startLine);
    }
    // Bracket depth carries into the next line, so continuation lines of a
    // wrapped call are never treated as global statements.
    for (const ch of line) {
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    }
  }
  return names;
}

/**
 * True when the namespace's ROOT segment is declared by the script, so the
 * built-in namespace of the same name is shadowed (`strategy = 1` shadows
 * both `strategy.` and `strategy.closedtrades.`). Given a name → declaration
 * line map and a `cursorLine`, only a declaration on an EARLIER line shadows;
 * a bare set (no line information) shadows unconditionally.
 */
export function isShadowedNamespace(namespace: string, declaredNames?: DeclaredNames, cursorLine?: number): boolean {
  if (!declaredNames) return false;
  const root = namespace.split('.')[0];
  if (declaredNames instanceof Map) {
    const declaredLine = declaredNames.get(root);
    if (declaredLine === undefined) return false;
    return cursorLine === undefined || declaredLine < cursorLine;
  }
  return declaredNames.has(root);
}

/**
 * Split the parameter list of a signature at top-level commas.
 * `f(a, b(c, d), e?)` → ['a', 'b(c, d)', 'e?'].
 */
function splitParams(paramsString: string): string[] {
  const params: string[] = [];
  let current = '';
  let depth = 0;
  for (const char of paramsString) {
    if (char === '(' || char === '[' || char === '<') depth++;
    else if (char === ')' || char === ']' || char === '>') depth--;
    else if (char === ',' && depth === 0) {
      if (current.trim()) params.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) params.push(current.trim());
  return params;
}

/** Parameter labels from a signature string; [] when it has no parameter list. */
export function parseSignatureParams(signature: string): string[] {
  const match = signature.match(/\(([^)]*)\)/);
  if (!match || !match[1].trim()) return [];
  return splitParams(match[1].trim());
}

/** Bare parameter name from a signature fragment: `source?` → `source`, `x: int` → `x`. */
function paramName(label: string): string {
  return label.replace(/\?$/, '').split(/[=:]/)[0].trim();
}

/**
 * All signatures for a function (one per overload when the reference lists
 * several call forms), with per-parameter documentation where known.
 * Falls back to the v6-manual hand list for functions the reference lacks.
 */
export function getSignatureData(functionName: string): SignatureData[] {
  const entry = REFERENCE[functionName];
  if (entry) {
    const paramDocs = new Map<string, string>();
    for (const p of entry.parameters || []) {
      if (p.description) paramDocs.set(p.name, p.description);
    }
    const doc = entry.description
      ? entry.description + (entry.returns || extractReturns(entry.syntax) ? `\n\n**Returns:** \`${entry.returns || extractReturns(entry.syntax)}\`` : '')
      : undefined;
    const toSignatureData = (signature: string): SignatureData => ({
      label: signature,
      documentation: doc,
      parameters: parseSignatureParams(signature).map(label => ({
        label,
        documentation: paramDocs.get(paramName(label)),
      })),
    });
    if (entry.overloads && entry.overloads.length > 0) {
      return entry.overloads.map(o => toSignatureData(o.signature));
    }
    const sig = entry.syntax || entry.signature;
    if (sig) return [toSignatureData(sig)];
  }

  // v6-manual fallback
  let item: PineItem | undefined = V6_FUNCTIONS[functionName];
  if (!item && functionName.includes('.')) {
    const [ns, name] = functionName.split('.');
    item = V6_NAMESPACES[ns]?.functions?.[name];
  }
  if (!item?.syntax) return [];

  const documentation = item.description
    ? item.description + (item.returns ? `\n\n**Returns:** \`${item.returns}\`` : '')
    : undefined;
  return [{
    label: item.syntax,
    documentation,
    parameters: parseSignatureParams(item.syntax).map(label => ({ label })),
  }];
}

/**
 * Hover data for a symbol. v6-manual wins when it knows the symbol (hand
 * examples/categories); the full reference is the fallback. Documented
 * constants/variables and namespace paths are recognized too, so hover
 * covers the SAME member set completions offer (PR #46 review).
 */
export function getHoverData(symbol: string): HoverData | undefined {
  let item: PineItem | undefined = V6_VARIABLES[symbol] || V6_FUNCTIONS[symbol];
  // Only a two-segment symbol can be a v6-manual namespace member. Splitting
  // `strategy.closedtrades.profit` on its first dot returned the docs for the
  // variable `strategy.closedtrades` instead (review finding, 2026-09-24).
  if (!item && symbol.split('.').length === 2) {
    const [ns, name] = symbol.split('.');
    item = manualNamespaceItem(ns, name);
  }
  if (item) {
    // A built-in variable that is also a function (`time`, `time_close`, ...):
    // show both, since the hover cannot tell `time` from `time("D")`.
    const alsoFn = !symbol.includes('.') && V6_VARIABLES[symbol] ? REFERENCE[symbol] : undefined;
    const fnNote = alsoFn
      ? `\n\nAlso a function: \`${firstSyntax(alsoFn)}\`${alsoFn.description ? ' ' + alsoFn.description : ''}`
      : '';
    return {
      syntax: item.syntax,
      description: (item.description || '') + fnNote,
      returns: item.returns,
      type: item.type,
      example: item.example,
      category: item.category,
    };
  }

  // Reference functions come before the constant/variable fallback: a name
  // that is both (ta.tr, ta.vwap) completes as a function, so it hovers as one.
  const entry = REFERENCE[symbol];
  if (entry) {
    const syntax = firstSyntax(entry);
    return {
      syntax,
      description: entry.description,
      returns: entry.returns || extractReturns(syntax),
    };
  }

  // A namespace or type path itself (`chart.point`, `strategy.commission`).
  if (TYPE_NAMESPACE_PATHS.has(symbol) || KNOWN_NAMESPACES.has(symbol)) {
    return {
      type: 'module',
      description: TYPE_NAMESPACE_PATHS.has(symbol)
        ? `${symbol} type`
        : V6_NAMESPACES[symbol]?.description || `${symbol} namespace`,
    };
  }

  // Documented constants and built-in variables (issue #45): the hover shows
  // the full name (the provider's header), the kind, the namespace, and the
  // reference description where the crawl carries one (PR #46 review).
  if (ALL_MEMBER_NAMES.has(symbol)) {
    const dot = symbol.lastIndexOf('.');
    return {
      type: isVariableName(symbol) ? 'variable' : 'constant',
      description: REFERENCE_NAME_DESCRIPTIONS[symbol],
      category: dot > 0 ? symbol.slice(0, dot) : undefined,
    };
  }

  return undefined;
}

/**
 * Find the function being called before the cursor, e.g. `ta.sma(close, |`
 * yields `ta.sma`. Pure helper shared by the signature-help provider.
 */
/**
 * The innermost call still open at the cursor. Scans back from the cursor, skipping
 * string literals, comments, and any call already closed, so `str.format("{0}, {1}", ta.sma(x, 1), `
 * resolves to `str.format`, not to nothing. Returns the name and the index of its '('.
 */
// Hoisted matchers (PR #51 review, finding 10): these run on every keystroke —
// openCallAt's call-name pattern ran once per '(' met in the backward scan —
// so they are compiled once at module load instead of per scan/per call.
const STRING_LITERAL_RE = /"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?/g;
const CALL_NAME_TYPE = '[A-Za-z_][\\w.]*(?:<[A-Za-z_][\\w.]*(?:\\s*,\\s*[A-Za-z_][\\w.]*)*>)?';
const CALL_NAME_GENERIC = `(?:<\\s*${CALL_NAME_TYPE}(?:\\s*,\\s*${CALL_NAME_TYPE})*\\s*>)?`;
const CALL_NAME_RE = new RegExp(`([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*)\\s*(${CALL_NAME_GENERIC})\\s*$`);
const GENERIC_CTOR_RE = /^(?:array|matrix|map)\.new$/;
const LEADING_UP_TO_PAREN_RE = /^[^(]*\(/;
const PARAM_NAME_RE = /^[A-Za-z_]\w*$/;
const DEFINITION_HEAD_RE = /^\s*(?:(?:method|export)\s+)*[A-Za-z_]\w*\s*$/;
const NAMED_SEGMENT_RE = /^\s*([A-Za-z_]\w*)\s*=(?![=>])/;
// `name=` followed by an optional typed value prefix (`style=`, `style=sh`,
// `style=shape.ci`). `==`/`=>` never match: the prefix class excludes `=>`.
const NAME_VALUE_RE = /([A-Za-z_]\w*)\s*=\s*([A-Za-z0-9_.]*)$/;

function openCallAt(beforeCursor: string): { name: string; open: number } | null {
  // Blank string contents and comments (keeping length) so their parens and
  // commas are inert.
  const text = blankStringsAndCommentsBeforeCursor(beforeCursor);
  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')' || ch === ']') depth++;
    else if (ch === '[') {
      if (depth > 0) depth--;
      else return null; // unmatched '[': the cursor is in an array literal or subscript, not a parameter list
    }
    else if (ch === '(') {
      if (depth > 0) { depth--; continue; }
      // A call name may carry a generic argument list: `array.new<float>(`,
      // `map.new<string, float>(`. A '(' with no name before it is a grouping
      // paren, `ta.sma((close + open`; keep scanning outward for the call.
      // The generic list must be type names only (`<float>`, `<string, array<float>>`),
      // so a comparison such as `dayofmonth < 15 ? high > (` is never read as one.
      const m = text.slice(0, i).match(CALL_NAME_RE);
      // Only Pine's generic constructors take a type list; anything else followed
      // by `<...>` is a comparison (`dayofmonth < high > (`), so this '(' is a
      // grouping paren and the scan continues outward.
      if (m && (!m[2] || GENERIC_CTOR_RE.test(m[1]))) return { name: m[1], open: i };
    }
  }
  return null;
}

/** Name of the function whose argument list the cursor is in, or null. */
export function findFunctionCallName(line: string, character: number): string | null {
  const call = openCallAt(line.substring(0, character));
  return call ? call.name : null;
}

/**
 * Index of the active parameter: top-level commas between the open '(' and the
 * cursor, ignoring commas inside strings and nested calls. Accepts either the text
 * before the cursor (preferred) or the text from the '(' onwards.
 */
export function calculateActiveParameter(text: string): number {
  const call = openCallAt(text);
  const inner = call ? text.slice(call.open + 1) : text.replace(LEADING_UP_TO_PAREN_RE, '');
  // Blank comments as well as strings: a top-level comma inside a `//`
  // comment must not move the active parameter (PR #51 delta review).
  const blanked = blankStringsAndCommentsBeforeCursor(inner);
  let depth = 0;
  let paramIndex = 0;
  for (const ch of blanked) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) paramIndex++;
  }
  return paramIndex;
}

// ── Named-parameter completions (issue #13) ─────────────────────────────
//
// Inside a call's argument list (`plot(close, ⎸`) the parameter NAMES of the
// called function are offered as `name=` items, drawn from the full reference
// and unioned across all overloads. Parameters already supplied are excluded,
// whether by name (`title="t"`) or positionally: with N positional arguments
// before the cursor, every overload whose signature accepts N positional args
// still fits, and a name stays offered iff some fitting overload lists it
// beyond the filled slots (union of per-overload remainders). After a `name=`
// whose values come from a constant namespace (`style=` → shape.*, `xloc=` →
// xloc.*, ...) the namespace's constants are offered instead.

export interface ParameterInfo {
  name: string;
  type?: string;
  description?: string;
  required: boolean;
}

/**
 * Every parameter of a function in declaration order, unioned across all
 * overloads (`line.new` yields first_point/second_point AND x1..y2), with the
 * per-parameter type/description the reference carries where available.
 * REFERENCE is static, so results are memoized per function name (PR #51
 * review, finding 10) — repeat calls return the identical array.
 */
const PARAMETER_INFO_CACHE = new Map<string, ParameterInfo[]>();

export function getParameterInfo(functionName: string): ParameterInfo[] {
  const cached = PARAMETER_INFO_CACHE.get(functionName);
  if (cached) return cached;
  const entry = REFERENCE[functionName];
  if (!entry) {
    PARAMETER_INFO_CACHE.set(functionName, []);
    return PARAMETER_INFO_CACHE.get(functionName)!;
  }
  const docs = new Map<string, { type?: string; description?: string }>();
  for (const p of entry.parameters || []) docs.set(p.name, { type: p.type, description: p.description });
  const required = new Set(entry.requiredParams || []);
  const names: string[] = [];
  const seen = new Set<string>();
  const add = (n: string) => {
    // Signature fragments like `...` or `source?` are not parameter names.
    if (PARAM_NAME_RE.test(n) && !seen.has(n)) { seen.add(n); names.push(n); }
  };
  const signatures = entry.overloads && entry.overloads.length > 0
    ? entry.overloads.map(o => o.signature)
    : [entry.syntax || entry.signature || ''];
  for (const sig of signatures) {
    for (const label of parseSignatureParams(sig)) add(paramName(label));
  }
  // The signature may end in `...`; the required/optional lists are the
  // complete name inventory (plot: trackprice, histbase, ...).
  for (const n of entry.requiredParams || []) add(n);
  for (const n of entry.optionalParams || []) add(n);
  const info = names.map(name => ({ name, required: required.has(name), ...docs.get(name) }));
  PARAMETER_INFO_CACHE.set(functionName, info);
  return info;
}

/**
 * Strings blanked (contents only, keeping length) and everything after the
 * first unquoted `//` blanked too, so string/comment parens, commas, and `=`
 * are inert to the argument-list scanners. A `//` inside a string is already
 * blanked by the string pass and never starts a comment. Unlike
 * blankStringsAndComments (whole-document declaration scanning), an unclosed
 * string at the cursor is blanked as well.
 */
/**
 * One pass over the context text, tracking string and comment state across
 * lines: a `"""` or `'''` multiline string can span lines, while `"..."`,
 * `'...'` and `//` comments end at their line. Each string keeps its opening
 * quote and its contents become spaces, so lengths and offsets are preserved.
 * `state` is what the cursor (the end of the text) sits inside.
 */
function scanStringsAndComments(text: string): { blanked: string; state: 'code' | 'string' | 'comment'; quote: string; triple: boolean } {
  const out = text.split('');
  let state: 'code' | 'string' | 'comment' = 'code';
  let quote = '';
  let triple = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (state === 'comment') {
      if (ch === '\n') state = 'code';
      else out[i] = ' ';
    } else if (state === 'string') {
      if (ch === '\n') {
        if (!triple) state = 'code';
        continue;
      }
      if (!triple && ch === '\\') {
        out[i] = ' ';
        if (i + 1 < text.length && text[i + 1] !== '\n') out[++i] = ' ';
        continue;
      }
      out[i] = ' ';
      if (triple ? text.startsWith(quote.repeat(3), i) : ch === quote) {
        if (triple) { out[i + 1] = ' '; out[i + 2] = ' '; i += 2; }
        state = 'code';
      }
    } else if (ch === '"' || ch === "'") {
      state = 'string';
      quote = ch;
      triple = text.startsWith(ch.repeat(3), i);
      if (triple) { out[i + 1] = ' '; out[i + 2] = ' '; i += 2; }
    } else if (ch === '/' && text[i + 1] === '/') {
      state = 'comment';
      out[i] = ' ';
    }
  }
  return { blanked: out.join(''), state, quote, triple };
}

function blankStringsAndCommentsBeforeCursor(text: string): string {
  return scanStringsAndComments(text).blanked;
}

/**
 * The text a completion or signature-help request should analyse: the current
 * line up to the cursor, preceded by up to `maxLines` earlier lines, so a call
 * wrapped across lines (`plot(\n    close,\n    |`) is still found. Known limit:
 * a call opened more than `maxLines` lines above the cursor is not found, so
 * completion falls back to the global list (a miss, never a wrong suggestion).
 * Pass the document's lines from the top: the lines above the window are
 * scanned (not analysed) so a `"""` string that opens above it and runs into
 * it is still read as a string. Earlier
 * statements are balanced, so the backward scan passes over them. Pure: the
 * provider passes the document's lines.
 */
export function statementContext(lines: string[], lineIndex: number, character: number, maxLines = 30): string {
  const start = Math.max(0, lineIndex - maxLines);
  const before = lines.slice(start, lineIndex);
  const current = (lines[lineIndex] || '').slice(0, character);
  const window = before.length ? before.join('\n') + '\n' + current : current;
  if (start === 0) return window;
  // Carry a multiline string that is still open where the window starts: an
  // opening triple quote on a line of its own puts the scan in the same state.
  const above = scanStringsAndComments(lines.slice(0, start).join('\n') + '\n');
  return above.state === 'string' && above.triple ? above.quote.repeat(3) + '\n' + window : window;
}

/**
 * True when the '(' just before the cursor opens a CALL (a name, or a generic
 * constructor like array.new<float>, directly before it) rather than grouping
 * an expression: `plot((close + open` must not pop up plot's parameters when
 * the inner '(' is typed (0.6.5 release audit).
 */
export function isCallParenBeforeCursor(text: string): boolean {
  const blanked = blankStringsAndCommentsBeforeCursor(text).replace(/\s+$/, '');
  if (!blanked.endsWith('(')) return false;
  const head = blanked.slice(0, -1);
  const m = head.match(/([A-Za-z_][\w.]*)\s*(?:<[^<>()]*(?:<[^<>()]*>[^<>()]*)*>)?\s*$/);
  // `if (`, `and (`, `switch (` group an expression; a keyword is never a call.
  return !!m && !CALL_KEYWORDS.has(m[1]);
}

const CALL_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'switch', 'and', 'or', 'not', 'return', 'in', 'to', 'by',
  'var', 'varip', 'import', 'export', 'method', 'type', 'enum', 'const', 'simple', 'series',
]);

/** True when the cursor sits inside a string literal (multiline included) or a `//` comment. */
function isInsideStringOrComment(beforeCursorText: string): boolean {
  return scanStringsAndComments(beforeCursorText).state !== 'code';
}

/**
 * Definition-in-progress rule (PR #51 review): the text up to an open '(' is
 * a function/method DEFINITION head only when it is just `name`, `method name`,
 * or `export name` from the start of the line (no `=` before it, so it is not
 * an expression) AND `=>` exists somewhere on the line. Without `=>` the text
 * is treated as a call: `plot(close,` is indistinguishable from a definition
 * head until the `=>` is typed. Strings and comments are blanked first so a
 * `=>` inside them does not count.
 */
function isDefinitionHead(line: string, open: number): boolean {
  const blanked = blankStringsAndCommentsBeforeCursor(line);
  if (!DEFINITION_HEAD_RE.test(blanked.slice(0, open))) return false;
  return blanked.includes('=>');
}

/**
 * The COMPLETE top-level argument segments before the cursor (everything up
 * to the last top-level comma; the segment being typed does not count).
 * Strings are blanked before splitting so commas and `=` inside them are
 * inert, and nested calls stay below top level. Returns the names supplied as
 * `name=` (`==`/`=>` comparisons never match) and the count of positional
 * segments — any non-empty segment not shaped like `name=`. A positional
 * segment after a named one is invalid Pine and simply counts as positional.
 */
function argsBeforeCursor(inner: string): { named: Set<string>; positional: number } {
  const blanked = blankStringsAndCommentsBeforeCursor(inner);
  const named = new Set<string>();
  let positional = 0;
  let depth = 0;
  let current = '';
  let currentRaw = '';
  const scan = (segment: string, raw: string) => {
    const m = segment.match(NAMED_SEGMENT_RE);
    if (m) named.add(m[1]);
    else if (raw.trim()) positional++;
  };
  for (let i = 0; i < blanked.length; i++) {
    const ch = blanked[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { scan(current, currentRaw); current = ''; currentRaw = ''; }
    else { current += ch; currentRaw += inner[i]; }
  }
  return { named, positional };
}

/**
 * Parameter names already filled POSITIONALLY before the cursor: with N
 * positional arguments, each overload whose signature accepts N positional
 * args (length ≥ N, or a trailing `...`) can still fit the call, and its
 * first N slots are taken. A name stays offered iff some fitting overload
 * lists it beyond slot N (union of per-overload remainders); names the
 * required/optional inventories add outside any signature (`...` extras like
 * plot's trackprice) are never positionally filled. Parameters that appear
 * ONLY in disqualified overloads (`timestamp`'s dateString, `line.new`'s
 * first_point after 9 positional args) are filled by definition — they can
 * never be supplied in this call. When no overload can accept N positional
 * args, nothing is excluded.
 */
function positionallyFilledParams(functionName: string, positional: number): Set<string> {
  const filled = new Set<string>();
  if (positional <= 0) return filled;
  const entry = REFERENCE[functionName];
  if (!entry) return filled;
  const signatures = entry.overloads && entry.overloads.length > 0
    ? entry.overloads.map(o => o.signature)
    : [entry.syntax || entry.signature || ''];
  const inAnySignature = new Set<string>();
  const remainders = new Set<string>();
  let anyFit = false;
  for (const sig of signatures) {
    const fragments = parseSignatureParams(sig);
    const variadic = fragments.some(f => f.trim() === '...');
    const params = fragments
      .map(paramName)
      .filter(n => PARAM_NAME_RE.test(n));
    for (const n of params) inAnySignature.add(n);
    if (!variadic && params.length < positional) continue; // disqualified: cannot accept this many positional args
    anyFit = true;
    for (const n of params.slice(positional)) remainders.add(n);
  }
  if (!anyFit) return filled;
  for (const p of getParameterInfo(functionName)) {
    if (inAnySignature.has(p.name) && !remainders.has(p.name)) filled.add(p.name);
  }
  return filled;
}

/**
 * `name=` completions for the argument list the cursor is in, in declaration
 * order, excluding names already supplied in the current call by name or
 * positionally. Empty outside a call, inside a string or comment, in a
 * function/method definition head, right after `name =` (a value goes there,
 * not another parameter name), or for a function the reference does not list.
 */
export function getNamedParameterCompletions(line: string, character: number): CompletionData[] {
  const beforeCursor = line.substring(0, character);
  if (isInsideStringOrComment(beforeCursor)) return [];
  if (isNamedArgumentValuePosition(line, character)) return [];
  const call = openCallAt(beforeCursor);
  if (!call) return [];
  if (isDefinitionHead(line, call.open)) return [];
  const { named, positional } = argsBeforeCursor(beforeCursor.slice(call.open + 1));
  const filled = positionallyFilledParams(call.name, positional);
  return getParameterInfo(call.name)
    .filter(p => !named.has(p.name) && !filled.has(p.name))
    .map(p => ({
      label: `${p.name}=`,
      kind: 'field',
      detail: p.type || (p.required ? 'required' : 'optional'),
      description: p.description,
    }));
}

/**
 * The argument segment being typed: everything between the last top-level
 * comma before the cursor and the cursor, with strings and comments blanked.
 * `open` is the index of the call's '('. A value position is decided by the
 * START of this segment (`name=`), never by what follows — an expression
 * with operators (`length = 10 + ⎸`) is still the value of `length`
 * (PR #51 delta review, finding 2).
 */
function currentArgumentSegment(beforeCursor: string, open: number): string {
  const inner = blankStringsAndCommentsBeforeCursor(beforeCursor).slice(open + 1);
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) start = i + 1;
  }
  return inner.slice(start);
}

/**
 * True when the cursor sits in the value of a named argument — the current
 * argument segment begins with `name =` (optional spaces, optional typed
 * prefix or partial expression: `style=`, `style=sh`, `length = 10 + `)
 * inside a call's argument list. `==`/`=>` never match, and neither does an
 * assignment outside a call (`x = ⎸` keeps the ordinary completions).
 */
export function isNamedArgumentValuePosition(line: string, character: number): boolean {
  const beforeCursor = line.substring(0, character);
  if (isInsideStringOrComment(beforeCursor)) return false;
  const call = openCallAt(beforeCursor);
  if (!call) return false;
  return NAMED_SEGMENT_RE.test(currentArgumentSegment(beforeCursor, call.open));
}

/**
 * The ONLY completions a '(' or ',' trigger may produce (PR #51 review): the
 * argument-list items — constant values right after `name=`, else the call's
 * named parameters. Empty everywhere else (tuples, arrays, grouping parens,
 * declarations, generics, definitions, comments), so the trigger never pops
 * the global list. Typed/invoked completion is unaffected.
 */
export function getTriggerCharacterCompletions(line: string, character: number): CompletionData[] {
  const values = getNamedArgumentValueCompletions(line, character);
  if (values.length > 0) return values;
  return getNamedParameterCompletions(line, character);
}

/** A constant namespace whose members are valid values, with an optional member prefix filter. */
interface ConstantNamespaceSpec { ns: string; prefix?: string }

/** Parameter name → constant namespaces, for parameters whose values are namespaced constants. */
const PARAM_CONSTANT_NAMESPACES: Record<string, ConstantNamespaceSpec[]> = {
  location: [{ ns: 'location' }],
  size: [{ ns: 'size' }],
  xloc: [{ ns: 'xloc' }],
  yloc: [{ ns: 'yloc' }],
  extend: [{ ns: 'extend' }],
  display: [{ ns: 'display' }],
  linestyle: [{ ns: 'hline', prefix: 'style_' }, { ns: 'line', prefix: 'style_' }],
};

/**
 * `style` means a different constant namespace per function: shape.* for the
 * plotshape family, plot.style_* for plot, line.style_* for line.new, ...
 * Functions not listed offer nothing for `style=` — a wrong constant is
 * worse than none. Every entry is verified against the v6 reference:
 * plotchar (char/location/size) and plotarrow (colorup/colordown/...) take
 * NO style parameter and must never appear here (PR #51 review, finding 9).
 */
export const STYLE_CONSTANT_NAMESPACES: Record<string, ConstantNamespaceSpec[]> = {
  plot: [{ ns: 'plot', prefix: 'style_' }],
  plotshape: [{ ns: 'shape' }],
  'line.new': [{ ns: 'line', prefix: 'style_' }],
  'label.new': [{ ns: 'label', prefix: 'style_' }],
};

/**
 * The value prefix typed after `name=` at the cursor (`style=sh` → `sh`),
 * `''` when nothing is typed or the cursor is not after a `name=`. The
 * completion layer uses it for the replacement range.
 */
export function getNamedArgumentValuePrefix(line: string, character: number): string {
  const m = line.substring(0, character).match(NAME_VALUE_RE);
  return m ? m[2] : '';
}

/**
 * Constant completions for the value position after `name=` inside a call
 * (`plotshape(cond, style=⎸` → shape.circle, shape.triangleup, ...). A typed
 * prefix (`style=sh`, `style=shape.ci`) still returns the full namespace —
 * the editor filters it by the prefix (PR #51 review, finding 8). Empty when
 * the cursor is not after a `name=`, when the name is not a parameter of the
 * open function, or when the parameter has no known constant namespace.
 */
export function getNamedArgumentValueCompletions(line: string, character: number): CompletionData[] {
  const beforeCursor = line.substring(0, character);
  if (isInsideStringOrComment(beforeCursor)) return [];
  const m = beforeCursor.match(NAME_VALUE_RE);
  if (!m) return [];
  const call = openCallAt(beforeCursor);
  if (!call) return [];
  if (isDefinitionHead(line, call.open)) return [];
  const param = m[1];
  if (!getParameterInfo(call.name).some(p => p.name === param)) return [];
  const specs = param === 'style' ? STYLE_CONSTANT_NAMESPACES[call.name] : PARAM_CONSTANT_NAMESPACES[param];
  if (!specs) return [];
  const items: CompletionData[] = [];
  for (const { ns, prefix } of specs) {
    for (const [name, fqn] of MEMBERS_BY_NAMESPACE.get(ns) ?? []) {
      if (prefix && !name.startsWith(prefix)) continue;
      items.push({ label: fqn, kind: 'constant', detail: fqn, description: REFERENCE_NAME_DESCRIPTIONS[fqn] });
    }
  }
  return items;
}
