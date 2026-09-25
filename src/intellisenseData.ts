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

export type CompletionKind = 'function' | 'variable' | 'keyword' | 'module' | 'color' | 'constant';

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
  // A label is offered once. Precedence: variable > function > keyword > module.
  // (The reference lists `time`, `dayofmonth`, ... as functions, but v6-manual's
  // variables are the better completion; `input` is both a keyword and a namespace.)
  const seen = new Set<string>();
  const push = (item: CompletionData) => {
    if (seen.has(item.label)) return;
    seen.add(item.label);
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
 * `declaredNames` is the set of names the current document declares (see
 * getDeclaredNames). When the namespace's ROOT segment is user-declared —
 * a variable, UDT, tuple name, parameter or import alias like `xloc = 1` —
 * the built-in namespace is shadowed and no built-in members are offered
 * (PR #46 review).
 */
export function getNamespaceCompletionData(namespace: string, declaredNames?: ReadonlySet<string>): CompletionData[] {
  if (isShadowedNamespace(namespace, declaredNames)) return [];
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

// ── Declared-name collection (namespace shadowing, PR #46 review) ──
//
// getDeclaredNames mirrors the declaration rules of
// AccurateValidator.collectDeclaredVariables: statement-level assignments
// (typed, var/varip, `:=`), tuple destructuring, function/method names and
// their parameters, loop variables, type/enum names and import aliases. One
// deliberate difference: strings and comments are blanked FIRST — a
// commented-out `xloc = 1` must not suppress `xloc.` completions, and a
// string containing `xloc = 1` must not either.

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

/** Statement segments of one line: split at `=>` and at depth-0 commas. */
function statementSegments(line: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let angle = 0;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    // `map<string, float> m = ...`: a generic type's comma is not a separator.
    // Only array/matrix/map take a type list, so a comparison `<` never opens one.
    else if (ch === '<' && /\b(?:array|matrix|map)(?:\.new)?$/.test(line.slice(0, i))) angle++;
    else if (ch === '>' && angle > 0) angle--;
    if (depth === 0 && angle === 0 && ch === '=' && line[i + 1] === '>') { out.push(cur); cur = ''; i++; continue; }
    if (depth === 0 && angle === 0 && ch === ',') { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/** Split a parameter list on top-level commas; `map<string, float> m` is ONE parameter. */
function splitDeclParams(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let angle = 0;
  let cur = '';
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    // Pine's only generic type templates are array<>, matrix<> and map<> (plus
    // the `.new<type>()` constructors). Any other `<` is a comparison.
    else if (ch === '<' && /\b(?:array|matrix|map)(?:\.new)?$/.test(list.slice(0, i))) angle++;
    else if (ch === '>' && angle > 0) angle--;
    if (ch === ',' && depth === 0 && angle === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/**
 * Every name the document declares. Used to suppress built-in namespace
 * completions when a user name shadows the namespace root (`xloc = 1` then
 * `xloc.`). File-wide, like the validator: a parameter name declared in one
 * function suppresses everywhere — over-suppression hides a completion, the
 * safe direction; under-suppression offers `xloc.bar_index` for a number.
 */
export function getDeclaredNames(documentText: string): Set<string> {
  const names = new Set<string>();
  for (const rawLine of blankMultilineStrings(documentText).split('\n')) {
    const line = blankStringsAndComments(rawLine);

    // Statement-level declaration: `x = 1`, `float x = 1`, `var Foo x = ...`,
    // `array<float> xs = ...`, `x := 2`.
    for (const segment of statementSegments(line)) {
      const stmtDecl = segment.match(/^\s*(?:var\s+|varip\s+)?(?:[A-Za-z_][\w.]*(?:<[^>]*>)?\s+)?([A-Za-z_]\w*)\s*:?=(?!=)/);
      if (stmtDecl && !isReservedKeywordName(stmtDecl[1])) names.add(stmtDecl[1]);
    }
    // Tuple destructuring: `[a, b] = f()`.
    const tupleDecl = line.match(/^\s*\[([^\]]+)\]\s*=(?!=)/);
    if (tupleDecl) {
      for (const n of tupleDecl[1].split(',').map(t => t.trim())) {
        if (/^[A-Za-z_]\w*$/.test(n) && !isReservedKeywordName(n)) names.add(n);
      }
    }
    // Loop counters: `for i = 0 to 9`.
    const forDecl = line.match(/^\s*for\s+([A-Za-z_]\w*)\s*=/);
    if (forDecl) names.add(forDecl[1]);
    // Library imports bind a namespace prefix: `import user/lib/1 as ta2` binds
    // `ta2`, and the same import without `as` binds the last path segment.
    const importDecl = line.match(/^\s*import\s+(?:[a-zA-Z_][a-zA-Z0-9_]*\/)*([a-zA-Z_][a-zA-Z0-9_]*)\/\d+(?:\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*))?/);
    if (importDecl) names.add(importDecl[2] || importDecl[1]);
    // User-defined type / enum names (`type Foo`, `enum Bar`).
    const typeDecl = line.match(/^\s*(?:export\s+)?(?:type|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (typeDecl) names.add(typeDecl[1]);
    // `for element in collection` / `for [index, element] in collection`.
    const forInDecl = line.match(/^\s*for\s+(?:\[([^\]]+)\]|([a-zA-Z_][a-zA-Z0-9_]*))\s+in\s+/);
    if (forInDecl) {
      const bound = forInDecl[1] ? forInDecl[1].split(',') : [forInDecl[2]];
      for (const name of bound) {
        const iterator = name.trim();
        if (iterator && !isReservedKeywordName(iterator)) names.add(iterator);
      }
    }
    // Function and method definitions: `f(params) =>` — the NAME and every
    // PARAMETER are declared.
    const fnDef = line.match(/^\s*(?:export\s+)?(?:method\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)\s*=>/);
    if (fnDef) {
      names.add(fnDef[1]);
      for (const param of splitDeclParams(fnDef[2])) {
        // `int n = 3` -> `int n`; `array<float> xs` -> `xs`; `series float x` -> `x`
        const decl = param.split('=')[0].trim();
        const name = decl.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        if (name && !isReservedKeywordName(name[1])) names.add(name[1]);
      }
    }
  }
  return names;
}

/**
 * True when the namespace's ROOT segment is declared by the script, so the
 * built-in namespace of the same name is shadowed (`strategy = 1` shadows
 * both `strategy.` and `strategy.closedtrades.`).
 */
export function isShadowedNamespace(namespace: string, declaredNames?: ReadonlySet<string>): boolean {
  if (!declaredNames) return false;
  return declaredNames.has(namespace.split('.')[0]);
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
    return {
      syntax: item.syntax,
      description: item.description,
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
 * string literals and any call already closed, so `str.format("{0}, {1}", ta.sma(x, 1), `
 * resolves to `str.format`, not to nothing. Returns the name and the index of its '('.
 */
function openCallAt(beforeCursor: string): { name: string; open: number } | null {
  // Blank string contents (keeping length) so their parens and commas are inert.
  const text = beforeCursor.replace(/"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?/g, m => m[0] + ' '.repeat(Math.max(0, m.length - 1)));
  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')' || ch === ']') depth++;
    else if (ch === '[') { if (depth > 0) depth--; }
    else if (ch === '(') {
      if (depth > 0) { depth--; continue; }
      // A call name may carry a generic argument list: `array.new<float>(`,
      // `map.new<string, float>(`. A '(' with no name before it is a grouping
      // paren, `ta.sma((close + open`; keep scanning outward for the call.
      // The generic list must be type names only (`<float>`, `<string, array<float>>`),
      // so a comparison such as `dayofmonth < 15 ? high > (` is never read as one.
      const TYPE = '[A-Za-z_][\\w.]*(?:<[A-Za-z_][\\w.]*(?:\\s*,\\s*[A-Za-z_][\\w.]*)*>)?';
      const GENERIC = `(?:<\\s*${TYPE}(?:\\s*,\\s*${TYPE})*\\s*>)?`;
      const m = text.slice(0, i).match(new RegExp(`([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*)\\s*(${GENERIC})\\s*$`));
      // Only Pine's generic constructors take a type list; anything else followed
      // by `<...>` is a comparison (`dayofmonth < high > (`), so this '(' is a
      // grouping paren and the scan continues outward.
      if (m && (!m[2] || /^(?:array|matrix|map)\.new$/.test(m[1]))) return { name: m[1], open: i };
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
  const inner = call ? text.slice(call.open + 1) : text.replace(/^[^(]*\(/, '');
  const blanked = inner.replace(/"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?/g, m => ' '.repeat(m.length));
  let depth = 0;
  let paramIndex = 0;
  for (const ch of blanked) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) paramIndex++;
  }
  return paramIndex;
}
