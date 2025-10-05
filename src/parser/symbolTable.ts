// Symbol Table for tracking variables, functions, and scopes
import { PineType } from './typeSystem';

export interface Symbol {
  name: string;
  type: PineType;
  line: number;
  column: number;
  used: boolean;
  kind: 'variable' | 'function' | 'parameter';
  declaredWith?: 'var' | 'varip' | 'const' | null; // for variables
}

export class Scope {
  private symbols: Map<string, Symbol> = new Map();
  private parent: Scope | null;
  private children: Scope[] = [];

  constructor(parent: Scope | null = null) {
    this.parent = parent;
  }

  define(symbol: Symbol): void {
    this.symbols.set(symbol.name, symbol);
  }

  lookup(name: string): Symbol | undefined {
    const symbol = this.symbols.get(name);
    if (symbol) return symbol;
    if (this.parent) return this.parent.lookup(name);
    return undefined;
  }

  lookupLocal(name: string): Symbol | undefined {
    return this.symbols.get(name);
  }

  getAllSymbols(): Symbol[] {
    return Array.from(this.symbols.values());
  }

  getUnusedSymbols(): Symbol[] {
    return this.getAllSymbols().filter(s => !s.used && s.kind === 'variable');
  }

  markUsed(name: string): void {
    const symbol = this.symbols.get(name);
    if (symbol) {
      symbol.used = true;
    } else if (this.parent) {
      this.parent.markUsed(name);
    }
  }

  createChild(): Scope {
    const child = new Scope(this);
    this.children.push(child);
    return child;
  }

  getParent(): Scope | null {
    return this.parent;
  }
}

export class SymbolTable {
  private globalScope: Scope;
  private currentScope: Scope;

  constructor() {
    this.globalScope = new Scope();
    this.currentScope = this.globalScope;
    this.initializeBuiltins();
  }

  private initializeBuiltins(): void {
    // Built-in variables
    const builtinVars = [
      'close', 'open', 'high', 'low', 'volume', 'time', 'bar_index',
      'hl2', 'hlc3', 'ohlc4', 'hlcc4',
      'na', 'syminfo', 'timeframe', 'barstate',
    ];

    for (const name of builtinVars) {
      this.globalScope.define({
        name,
        type: 'series<float>',
        line: 0,
        column: 0,
        used: false,
        kind: 'variable',
      });
    }

    // Built-in functions
    const builtinFuncs = [
      'plot', 'plotshape', 'plotchar', 'hline', 'bgcolor', 'barcolor',
      'indicator', 'strategy', 'library',
      'alert', 'alertcondition',
      'label', 'line', 'box', 'table',
      'nz', 'na',
    ];

    for (const name of builtinFuncs) {
      this.globalScope.define({
        name,
        type: 'unknown',
        line: 0,
        column: 0,
        used: false,
        kind: 'function',
      });
    }

    // Namespaces (treated as symbols)
    const namespaces = [
      'ta', 'math', 'str', 'color', 'input', 'request',
      'array', 'matrix', 'map',
    ];

    for (const name of namespaces) {
      this.globalScope.define({
        name,
        type: 'unknown',
        line: 0,
        column: 0,
        used: false,
        kind: 'variable',
      });
    }
  }

  enterScope(): void {
    this.currentScope = this.currentScope.createChild();
  }

  exitScope(): void {
    const parent = this.currentScope.getParent();
    if (parent) {
      this.currentScope = parent;
    }
  }

  define(symbol: Symbol): void {
    this.currentScope.define(symbol);
  }

  lookup(name: string): Symbol | undefined {
    return this.currentScope.lookup(name);
  }

  lookupLocal(name: string): Symbol | undefined {
    return this.currentScope.lookupLocal(name);
  }

  markUsed(name: string): void {
    this.currentScope.markUsed(name);
  }

  getCurrentScope(): Scope {
    return this.currentScope;
  }

  getGlobalScope(): Scope {
    return this.globalScope;
  }

  getAllUnusedSymbols(): Symbol[] {
    return this.globalScope.getUnusedSymbols();
  }

  // Find similar symbol names (for typo suggestions)
  findSimilarSymbols(name: string, threshold: number = 2): string[] {
    const allSymbols = this.getAllSymbolNames();
    const similar: string[] = [];

    for (const symbolName of allSymbols) {
      const distance = this.levenshteinDistance(name, symbolName);
      if (distance <= threshold && distance > 0) {
        similar.push(symbolName);
      }
    }

    return similar.sort((a, b) => {
      const distA = this.levenshteinDistance(name, a);
      const distB = this.levenshteinDistance(name, b);
      return distA - distB;
    });
  }

  private getAllSymbolNames(): string[] {
    const names: string[] = [];
    let scope: Scope | null = this.currentScope;

    while (scope) {
      names.push(...scope.getAllSymbols().map(s => s.name));
      scope = scope.getParent();
    }

    return [...new Set(names)];
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
