/**
 * Complete Pine Script v6 Built-in Variables
 * Auto-generated from official TradingView Pine Script v6 Reference
 * Source: https://www.tradingview.com/pine-script-reference/v6/
 *
 * Total: 27 standalone + 21 variable namespaces
 * Generated: 2025-10-05
 */

//──────────────────────────────────────────────────────────
// STANDALONE BUILT-IN VARIABLES (27)
//──────────────────────────────────────────────────────────
export const STANDALONE_BUILTINS = new Set([
  // Price data
  'ask',
  'bid',
  'close',
  'high',
  'low',
  'open',
  'volume',

  // Derived price series
  'hl2',      // (high + low) / 2
  'hlc3',     // (high + low + close) / 3
  'hlcc4',    // (high + low + close + close) / 4
  'ohlc4',    // (open + high + low + close) / 4

  // Time-related
  'time',               // Current bar's timestamp
  'time_close',         // Current bar's close timestamp
  'time_tradingday',    // Trading day timestamp
  'timenow',            // Current time

  // Time components
  'dayofmonth',
  'dayofweek',
  'hour',
  'minute',
  'month',
  'second',
  'weekofyear',
  'year',

  // Bar indexing
  'bar_index',          // Current bar number (0-based)
  'last_bar_index',     // Last bar number
  'last_bar_time',      // Last bar timestamp

  // Special values
  'na'                  // Not available / null value
]);

//──────────────────────────────────────────────────────────
// VARIABLE NAMESPACES (21)
//──────────────────────────────────────────────────────────

// Note: These are namespaces that contain built-in variables
// Examples: barstate.isfirst, syminfo.ticker, timeframe.period
export const VARIABLE_NAMESPACES = new Set([
  'adjustment',
  'backadjustment',
  'barstate',
  'box',
  'chart',
  'display',
  'dividends',
  'earnings',
  'label',
  'line',
  'linefill',
  'polyline',
  'request',
  'session',
  'settlement_as_close',
  'strategy',
  'syminfo',
  'ta',
  'table',
  'text',
  'timeframe'
]);

//──────────────────────────────────────────────────────────
// FUNCTION NAMESPACES (22)
//──────────────────────────────────────────────────────────

// Note: These are namespaces that contain functions
// Examples: ta.sma(), input.int(), str.tostring()
export const FUNCTION_NAMESPACES = new Set([
  'array',
  'box',
  'chart',
  'color',
  'input',
  'label',
  'line',
  'linefill',
  'log',
  'map',
  'math',
  'matrix',
  'polyline',
  'request',
  'runtime',
  'str',
  'strategy',
  'syminfo',
  'ta',
  'table',
  'ticker',
  'timeframe'
]);

//──────────────────────────────────────────────────────────
// KEYWORDS (15)
//──────────────────────────────────────────────────────────
export const KEYWORDS = new Set([
  // Control flow
  'if',
  'else',
  'for',
  'for...in',
  'while',
  'switch',

  // Logical operators
  'and',
  'or',
  'not',

  // Declaration
  'var',
  'varip',

  // Module system
  'import',
  'export',

  // User-defined types
  'type',
  'method',
  'enum'
]);

//──────────────────────────────────────────────────────────
// OPERATORS (21)
//──────────────────────────────────────────────────────────
export const OPERATORS = new Set([
  // Arithmetic
  '+',
  '-',
  '*',
  '/',
  '%',

  // Comparison
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',

  // Assignment
  '=',
  ':=',

  // Compound assignment
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',

  // Ternary
  '?:',

  // Array access
  '[]',

  // Function arrow
  '=>'
]);

//──────────────────────────────────────────────────────────
// TYPE NAMES (Not to be validated as functions)
//──────────────────────────────────────────────────────────
export const TYPE_NAMES = new Set([
  'int',
  'float',
  'bool',
  'string',
  'color',
  'array',
  'matrix',
  'map',
  'line',
  'label',
  'box',
  'table',
  'polyline',
  'linefill',
  'series',
  'simple',
  'const'
]);

//──────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
//──────────────────────────────────────────────────────────

export function isBuiltInVariable(name: string): boolean {
  return STANDALONE_BUILTINS.has(name);
}

export function isVariableNamespace(name: string): boolean {
  return VARIABLE_NAMESPACES.has(name);
}

export function isFunctionNamespace(name: string): boolean {
  return FUNCTION_NAMESPACES.has(name);
}

export function isKnownNamespace(name: string): boolean {
  return VARIABLE_NAMESPACES.has(name) || FUNCTION_NAMESPACES.has(name);
}

export function isKeyword(name: string): boolean {
  return KEYWORDS.has(name);
}

export function isOperator(name: string): boolean {
  return OPERATORS.has(name);
}

export function isTypeName(name: string): boolean {
  return TYPE_NAMES.has(name);
}

export function isReservedWord(name: string): boolean {
  return isBuiltInVariable(name) || isKeyword(name) || isTypeName(name);
}

//──────────────────────────────────────────────────────────
// METADATA
//──────────────────────────────────────────────────────────
export const BUILTINS_METADATA = {
  standaloneBuiltins: STANDALONE_BUILTINS.size,
  variableNamespaces: VARIABLE_NAMESPACES.size,
  functionNamespaces: FUNCTION_NAMESPACES.size,
  keywords: KEYWORDS.size,
  operators: OPERATORS.size,
  typeNames: TYPE_NAMES.size,
  generatedFrom: 'v6/raw/v6-language-constructs.json',
  source: 'https://www.tradingview.com/pine-script-reference/v6/',
  version: 'v6',
  lastUpdated: '2025-10-05'
};
