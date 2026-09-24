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
 */

import { V6_VARIABLES, V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../v6/v6-manual';
import { PINE_FUNCTIONS_MERGED } from '../v6/parameter-requirements-merged';

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

export type CompletionKind = 'function' | 'variable' | 'keyword' | 'module' | 'color';

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
 * All namespace paths: union of the v6-manual hand list and the reference.
 * The namespace of a key is everything up to its LAST dot, so nested
 * namespaces are included: `chart.point.new` → `chart.point`,
 * `strategy.closedtrades.profit` → `strategy.closedtrades`.
 */
export function getNamespaces(): string[] {
  const names = new Set<string>(Object.keys(V6_NAMESPACES));
  for (const key of Object.keys(REFERENCE)) {
    const dot = key.lastIndexOf('.');
    if (dot > 0) names.add(key.slice(0, dot));
  }
  return [...names];
}

/** First-segment namespaces (`chart`, `strategy`, ...) offered as top-level hints. */
function getRootNamespaces(): string[] {
  const roots = new Set<string>();
  for (const ns of getNamespaces()) roots.add(ns.split('.')[0]);
  return [...roots];
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
  for (const ns of getRootNamespaces()) {
    push({
      label: ns,
      kind: 'module',
      detail: V6_NAMESPACES[ns]?.description || `${ns} namespace`,
    });
  }

  return items;
}

/** Member completions for one namespace (after typing `ns.`). */
export function getNamespaceCompletionData(namespace: string): CompletionData[] {
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
  for (const nsPath of getNamespaces()) {
    if (!nsPath.startsWith(prefix)) continue;
    const child = nsPath.slice(prefix.length);
    if (child.includes('.')) continue;
    if (!byLabel.has(child)) {
      byLabel.set(child, { label: child, kind: 'module', detail: `${nsPath} namespace` });
    }
  }

  return [...byLabel.values()];
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
 * examples/categories); the full reference is the fallback.
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

  const entry = REFERENCE[symbol];
  if (!entry) return undefined;
  const syntax = firstSyntax(entry);
  return {
    syntax,
    description: entry.description,
    returns: entry.returns || extractReturns(syntax),
  };
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
