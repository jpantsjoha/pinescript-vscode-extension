// Pine Script Type System
export type PineType =
  | 'int'
  | 'float'
  | 'bool'
  | 'string'
  | 'color'
  | 'series<int>'
  | 'series<float>'
  | 'series<bool>'
  | 'series<string>'
  | 'series<color>'
  | 'array<int>'
  | 'array<float>'
  | 'array<bool>'
  | 'array<string>'
  | 'array<color>'
  | 'matrix<int>'
  | 'matrix<float>'
  | 'line'
  | 'label'
  | 'box'
  | 'table'
  | 'void'
  | 'na'
  | 'unknown';

export interface TypeInfo {
  type: PineType;
  isOptional?: boolean;
  defaultValue?: any;
}

export class TypeChecker {
  // Check if type1 is assignable to type2
  static isAssignable(from: PineType, to: PineType): boolean {
    if (from === to) return true;
    if (to === 'unknown' || from === 'unknown') return true;
    if (from === 'na') return true; // na is assignable to any type

    // int -> float coercion
    if (from === 'int' && to === 'float') return true;
    if (from === 'series<int>' && to === 'series<float>') return true;

    // Simple -> series coercion
    if (from === 'int' && to === 'series<int>') return true;
    if (from === 'float' && to === 'series<float>') return true;
    if (from === 'bool' && to === 'series<bool>') return true;
    if (from === 'string' && to === 'series<string>') return true;
    if (from === 'color' && to === 'series<color>') return true;

    return false;
  }

  // Infer type from literal value
  static inferLiteralType(value: any): PineType {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float';
    }
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'string') return 'string';
    if (value === 'na') return 'na';
    return 'unknown';
  }

  // Get result type of binary operation
  static getBinaryOpType(left: PineType, right: PineType, operator: string): PineType {
    // Arithmetic operators
    if (['+', '-', '*', '/', '%'].includes(operator)) {
      // If either is series, result is series
      if (left.startsWith('series') || right.startsWith('series')) {
        // If either is float, result is series<float>
        if (left.includes('float') || right.includes('float')) {
          return 'series<float>';
        }
        return 'series<int>';
      }
      // Simple types
      if (left === 'float' || right === 'float') return 'float';
      return 'int';
    }

    // Comparison operators
    if (['<', '>', '<=', '>=', '==', '!='].includes(operator)) {
      if (left.startsWith('series') || right.startsWith('series')) {
        return 'series<bool>';
      }
      return 'bool';
    }

    // Logical operators
    if (['and', 'or'].includes(operator)) {
      if (left.startsWith('series') || right.startsWith('series')) {
        return 'series<bool>';
      }
      return 'bool';
    }

    return 'unknown';
  }

  // Check if types are compatible for operation
  static areTypesCompatible(left: PineType, right: PineType, operator: string): boolean {
    // Arithmetic operators require numeric types
    if (['+', '-', '*', '/', '%'].includes(operator)) {
      const leftNumeric = this.isNumericType(left);
      const rightNumeric = this.isNumericType(right);
      return leftNumeric && rightNumeric;
    }

    // Comparison operators
    if (['<', '>', '<=', '>='].includes(operator)) {
      const leftNumeric = this.isNumericType(left);
      const rightNumeric = this.isNumericType(right);
      return leftNumeric && rightNumeric;
    }

    // Equality operators work on same types
    if (['==', '!='].includes(operator)) {
      return this.isAssignable(left, right) || this.isAssignable(right, left);
    }

    // Logical operators require bool
    if (['and', 'or'].includes(operator)) {
      return this.isBoolType(left) && this.isBoolType(right);
    }

    return false;
  }

  static isNumericType(type: PineType): boolean {
    return type === 'int' || type === 'float' ||
           type === 'series<int>' || type === 'series<float>';
  }

  static isBoolType(type: PineType): boolean {
    return type === 'bool' || type === 'series<bool>';
  }

  static isStringType(type: PineType): boolean {
    return type === 'string' || type === 'series<string>';
  }

  // Map Pine Script function return types
  static getBuiltinReturnType(functionName: string, args: PineType[]): PineType {
    // Common patterns
    const builtinTypes: Record<string, PineType> = {
      // Built-in variables
      'close': 'series<float>',
      'open': 'series<float>',
      'high': 'series<float>',
      'low': 'series<float>',
      'volume': 'series<float>',
      'bar_index': 'series<int>',
      'time': 'series<int>',

      // Input functions
      'input.int': 'int',
      'input.float': 'float',
      'input.bool': 'bool',
      'input.string': 'string',
      'input.color': 'color',
      'input.timeframe': 'string',
      'input.source': 'series<float>',
      'input.session': 'string',

      // TA functions (most return series<float>)
      'ta.sma': 'series<float>',
      'ta.ema': 'series<float>',
      'ta.rsi': 'series<float>',
      'ta.atr': 'series<float>',
      'ta.highest': 'series<float>',
      'ta.lowest': 'series<float>',
      'ta.change': 'series<float>',
      'ta.mom': 'series<float>',
      'ta.crossover': 'series<bool>',
      'ta.crossunder': 'series<bool>',
      'ta.cross': 'series<bool>',
      'ta.vwap': 'series<float>',

      // Math functions
      'math.abs': 'float',
      'math.max': 'float',
      'math.min': 'float',
      'math.round': 'float',
      'math.floor': 'int',
      'math.ceil': 'int',
      'math.sqrt': 'float',
      'math.pow': 'float',
      'math.sign': 'int',

      // String functions
      'str.tostring': 'string',
      'str.format': 'string',
      'str.length': 'int',
      'str.contains': 'bool',
      'str.upper': 'string',
      'str.lower': 'string',

      // Color functions
      'color.new': 'color',
      'color.rgb': 'color',
      'color.from_gradient': 'color',

      // Drawing functions
      'plot': 'void',
      'plotshape': 'void',
      'plotchar': 'void',
      'hline': 'void',
      'bgcolor': 'void',
      'barcolor': 'void',
      'label.new': 'label',
      'line.new': 'line',
      'box.new': 'box',
      'table.new': 'table',

      // Other
      'na': 'na',
      'nz': 'float',
      'indicator': 'void',
      'strategy': 'void',
      'alertcondition': 'void',
    };

    return builtinTypes[functionName] || 'unknown';
  }

  // Validate literal values
  static validateLiteral(type: PineType, value: any): { valid: boolean; message?: string } {
    switch (type) {
      case 'int':
      case 'series<int>':
        if (typeof value === 'number' && Number.isInteger(value)) {
          return { valid: true };
        }
        return { valid: false, message: `Expected integer, got ${typeof value}` };

      case 'float':
      case 'series<float>':
        if (typeof value === 'number') {
          return { valid: true };
        }
        return { valid: false, message: `Expected number, got ${typeof value}` };

      case 'bool':
      case 'series<bool>':
        if (typeof value === 'boolean') {
          return { valid: true };
        }
        return { valid: false, message: `Expected boolean, got ${typeof value}` };

      case 'string':
      case 'series<string>':
        if (typeof value === 'string') {
          return { valid: true };
        }
        return { valid: false, message: `Expected string, got ${typeof value}` };

      default:
        return { valid: true };
    }
  }
}
