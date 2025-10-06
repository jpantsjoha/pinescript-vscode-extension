// Comprehensive Pine Script Validator with Type Checking and Scope Analysis
import { Program, Statement, Expression, CallExpression, CallArgument, Identifier, Literal } from './ast';
import { V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../../v6/v6-manual';
import { PINE_FUNCTIONS_MERGED } from '../../v6/parameter-requirements-merged';
import type { FunctionSignatureSpec, FunctionParameter } from '../../v6/parameter-requirements-generated';
import { PineType, TypeChecker, TypeInfo } from './typeSystem';
import { SymbolTable, Symbol as SymbolInfo } from './symbolTable';

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}


export interface ValidationError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: DiagnosticSeverity;
}

interface FunctionSignature {
  name: string;
  parameters: ParameterInfo[];
  returns?: string;
}

interface ParameterInfo {
  name: string;
  type?: PineType;
  optional?: boolean;
  defaultValue?: string;
}

export class ComprehensiveValidator {
  private errors: ValidationError[] = [];
  private symbolTable: SymbolTable;
  private functionSignatures: Map<string, FunctionSignature> = new Map();
  private expressionTypes: Map<Expression, PineType> = new Map();

  constructor() {
    this.symbolTable = new SymbolTable();
    this.buildFunctionSignatures();
  }

  validate(ast: Program): ValidationError[] {
    this.errors = [];
    this.symbolTable = new SymbolTable();
    this.expressionTypes.clear();

    // First pass: collect all variable declarations
    for (const statement of ast.body) {
      this.collectDeclarations(statement);
    }

    // Second pass: validate everything
    for (const statement of ast.body) {
      this.validateStatement(statement);
    }

    // Check for unused variables
    this.checkUnusedVariables();

    return this.errors;
  }

  private buildFunctionSignatures(): void {
    // Build from PINE_FUNCTIONS_MERGED which has accurate parameter requirements
    for (const [name, spec] of Object.entries(PINE_FUNCTIONS_MERGED)) {
      const sig = this.buildSignatureFromSpec(name, spec as FunctionSignatureSpec);
      if (sig) {
        this.functionSignatures.set(name, sig);
      }
    }

    // Add known return types for common functions (Phase A - Session 5)
    this.addKnownReturnTypes();

    // Also build from V6_FUNCTIONS for any missing functions
    for (const [name, item] of Object.entries(V6_FUNCTIONS)) {
      if (!this.functionSignatures.has(name)) {
        const sig = this.parseSignature(name, item as PineItem);
        if (sig) {
          this.functionSignatures.set(name, sig);
        }
      }
    }

    // Build from V6_NAMESPACES
    for (const [nsName, nsData] of Object.entries(V6_NAMESPACES)) {
      if (nsData.functions) {
        for (const [fnName, item] of Object.entries(nsData.functions)) {
          const fullName = `${nsName}.${fnName}`;
          if (!this.functionSignatures.has(fullName)) {
            const sig = this.parseSignature(fullName, item as PineItem);
            if (sig) {
              this.functionSignatures.set(fullName, sig);
            }
          }
        }
      }
    }
  }

  // Phase D - Session 5: Namespace properties for property access type inference
  private namespaceProperties: Record<string, PineType> = {
    // timeframe namespace properties
    'timeframe.period': 'string',
    'timeframe.multiplier': 'int',

    // syminfo namespace properties
    'syminfo.tickerid': 'string',
    'syminfo.ticker': 'string',
    'syminfo.prefix': 'string',
    'syminfo.type': 'string',
    'syminfo.session': 'string',
    'syminfo.timezone': 'string',
    'syminfo.currency': 'string',
    'syminfo.basecurrency': 'string',
    'syminfo.root': 'string',
    'syminfo.pointvalue': 'float',
    'syminfo.mintick': 'float',

    // barstate namespace properties
    'barstate.isfirst': 'series<bool>',
    'barstate.islast': 'series<bool>',
    'barstate.isrealtime': 'series<bool>',
    'barstate.isnew': 'series<bool>',
    'barstate.isconfirmed': 'series<bool>',
    'barstate.ishistory': 'series<bool>',

    // chart namespace properties
    'chart.bg_color': 'color',
    'chart.fg_color': 'color',
    'chart.left_visible_bar_time': 'series<int>',
    'chart.right_visible_bar_time': 'series<int>',
  };

  private addKnownReturnTypes(): void {
    // High-impact function return types identified in Session 5 analysis
    // These functions are commonly used but missing return type information
    const knownReturnTypes: Record<string, string> = {
      // timeframe namespace
      'timeframe.in_seconds': 'int',
      'timeframe.multiplier': 'int',
      'timeframe.isseconds': 'bool',
      'timeframe.isminutes': 'bool',
      'timeframe.ishours': 'bool',
      'timeframe.isdaily': 'bool',
      'timeframe.isweekly': 'bool',
      'timeframe.ismonthly': 'bool',
      'timeframe.isdwm': 'bool',
      'timeframe.isintraday': 'bool',

      // strategy namespace
      'strategy.position_size': 'series float',
      'strategy.position_avg_price': 'series float',
      'strategy.opentrades': 'series int',
      'strategy.closedtrades': 'series int',
      'strategy.wintrades': 'series int',
      'strategy.losstrades': 'series int',
      'strategy.grossprofit': 'series float',
      'strategy.grossloss': 'series float',
      'strategy.netprofit': 'series float',

      // request namespace
      'request.security': 'series float',
      'request.dividends': 'series float',
      'request.splits': 'series float',
      'request.earnings': 'series float',

      // str namespace
      'str.tostring': 'string',
      'str.tonumber': 'float',
      'str.length': 'int',
      'str.contains': 'bool',
      'str.pos': 'int',
      'str.substring': 'string',
      'str.replace': 'string',
      'str.replace_all': 'string',
      'str.lower': 'string',
      'str.upper': 'string',
      'str.split': 'array<string>',
      'str.format': 'string',

      // math namespace (additional)
      'math.ceil': 'int',
      'math.floor': 'int',
      'math.round': 'int',
      'math.sign': 'int',
      'math.abs': 'float',
      'math.sqrt': 'float',
      'math.pow': 'float',
      'math.exp': 'float',
      'math.log': 'float',
      'math.log10': 'float',

      // array namespace (common)
      'array.size': 'int',
      'array.get': 'any',  // Returns element type
      'array.includes': 'bool',
      'array.indexof': 'int',
      'array.lastindexof': 'int',
      'array.min': 'float',
      'array.max': 'float',
      'array.sum': 'float',
      'array.avg': 'float',

      // ta namespace (additional)
      'ta.change': 'series float',
      'ta.rsi': 'series float',
      'ta.ema': 'series float',
      'ta.sma': 'series float',
      'ta.wma': 'series float',
      'ta.vwma': 'series float',
      'ta.stoch': 'series float',
      'ta.bb': 'series float',
      'ta.bbw': 'series float',
      'ta.atr': 'series float',
      'ta.tr': 'series float',
      'ta.crossover': 'bool',
      'ta.crossunder': 'bool',
      'ta.cross': 'bool',
      'ta.valuewhen': 'series float',
      'ta.barssince': 'series int',
      'ta.highest': 'series float',
      'ta.lowest': 'series float',
      'ta.highestbars': 'series int',
      'ta.lowestbars': 'series int',
    };

    // Apply return types to existing signatures
    for (const [funcName, returnType] of Object.entries(knownReturnTypes)) {
      const sig = this.functionSignatures.get(funcName);
      if (sig && !sig.returns) {
        sig.returns = returnType;
      }
    }
  }

  private buildSignatureFromSpec(name: string, spec: FunctionSignatureSpec): FunctionSignature | null {
    try {
      const parameters: ParameterInfo[] = [];

      // Use the parameters array if available
      if (spec.parameters && Array.isArray(spec.parameters)) {
        for (const param of spec.parameters as FunctionParameter[]) {
          parameters.push({
            name: param.name,
            type: this.mapToPineType(param.type),
            optional: param.optional || false,
            defaultValue: undefined,
          });
        }
      } else {
        // Fallback to requiredParams and optionalParams
        const requiredParams = spec.requiredParams || [];
        const optionalParams = spec.optionalParams || [];

        for (const paramName of requiredParams) {
          parameters.push({
            name: paramName,
            type: 'unknown',
            optional: false,
          });
        }

        for (const paramName of optionalParams) {
          parameters.push({
            name: paramName,
            type: 'unknown',
            optional: true,
          });
        }
      }

      return {
        name,
        parameters,
        returns: spec.returns || undefined
      };
    } catch (e) {
      return null;
    }
  }

  private parseSignature(name: string, item: PineItem): FunctionSignature | null {
    if (!item.syntax) return null;

    try {
      const match = item.syntax.match(/\(([^)]*)\)/);
      if (!match) return { name, parameters: [], returns: item.returns };

      const paramsString = match[1].trim();
      if (!paramsString) return { name, parameters: [], returns: item.returns };

      const parameters: ParameterInfo[] = [];
      const params = this.splitParameters(paramsString);

      for (const param of params) {
        const parts = param.split('=');
        const nameAndType = parts[0].trim();
        const defaultValue = parts[1]?.trim();

        const typeParts = nameAndType.split(':');
        const paramName = typeParts[0].trim();
        const paramType = this.mapToPineType(typeParts[1]?.trim());

        parameters.push({
          name: paramName,
          type: paramType,
          optional: !!defaultValue,
          defaultValue,
        });
      }

      return { name, parameters, returns: item.returns };
    } catch (e) {
      return null;
    }
  }

  private splitParameters(paramsString: string): string[] {
    const params: string[] = [];
    let current = '';
    let depth = 0;

    for (const char of paramsString) {
      if (char === '(' || char === '[') depth++;
      else if (char === ')' || char === ']') depth--;
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

  private mapToPineType(typeStr?: string): PineType {
    if (!typeStr) return 'unknown';

    const typeMap: Record<string, PineType> = {
      'int': 'int',
      'float': 'float',
      'bool': 'bool',
      'string': 'string',
      'color': 'color',
      'series int': 'series<int>',
      'series float': 'series<float>',
      'series bool': 'series<bool>',
      'series string': 'series<string>',
      'series color': 'series<color>',
    };

    return typeMap[typeStr.toLowerCase()] || 'unknown';
  }

  private collectDeclarations(statement: Statement): void {
    if (statement.type === 'VariableDeclaration') {
      const symbol: SymbolInfo = {
        name: statement.name,
        type: 'unknown',
        line: statement.line,
        column: statement.column,
        used: false,
        kind: 'variable',
        declaredWith: statement.varType,
      };

      // Try to infer type from initialization
      if (statement.init) {
        const initType = this.inferExpressionType(statement.init);
        symbol.type = initType;
      }

      this.symbolTable.define(symbol);
    } else if (statement.type === 'FunctionDeclaration') {
      // First, collect declarations from function body (needed for type inference)
      this.symbolTable.enterScope();

      // Add parameters to scope
      // Infer parameter types based on common patterns
      for (let i = 0; i < statement.params.length; i++) {
        const param = statement.params[i];
        // First parameter often series data (x, src, val, etc.)
        // Other parameters often int (length, period, n, etc.)
        const paramType = i === 0 ? 'series<float>' : 'int';

        this.symbolTable.define({
          name: param.name,
          type: paramType,
          line: statement.line,
          column: statement.column,
          used: false,
          kind: 'variable',
          declaredWith: null,
        });
      }

      // Collect declarations from function body
      for (const stmt of statement.body) {
        this.collectDeclarations(stmt);
      }

      // NOW infer return type (with body variables in scope)
      const returnType = this.inferFunctionReturnType(statement);

      this.symbolTable.exitScope();

      // Define the function in parent scope
      const symbol: SymbolInfo = {
        name: statement.name,
        type: returnType,
        line: statement.line,
        column: statement.column,
        used: false,
        kind: 'function',
        declaredWith: null,
      };

      this.symbolTable.define(symbol);
    }
  }

  private validateStatement(statement: Statement): void {
    switch (statement.type) {
      case 'VariableDeclaration':
        if (statement.init) {
          this.validateExpression(statement.init);
        }
        break;

      case 'ExpressionStatement':
        this.validateExpression(statement.expression);
        break;

      case 'FunctionDeclaration':
        this.symbolTable.enterScope();

        // Add function parameters to scope
        for (const param of statement.params) {
          this.symbolTable.define({
            name: param.name,
            type: 'unknown', // Parameter types would need type annotations
            line: statement.line,
            column: statement.column,
            used: false,
            kind: 'variable',
            declaredWith: null,
          });
        }

        // Collect declarations within function body
        for (const stmt of statement.body) {
          this.collectDeclarations(stmt);
        }

        // Validate function body
        for (const stmt of statement.body) {
          this.validateStatement(stmt);
        }
        this.symbolTable.exitScope();
        break;

      case 'IfStatement':
        this.validateExpression(statement.condition);
        const condType = this.inferExpressionType(statement.condition);
        if (!TypeChecker.isBoolType(condType)) {
          this.addError(
            statement.line,
            statement.column,
            10,
            `Condition must be boolean, got ${condType}`,
            DiagnosticSeverity.Error
          );
        }

        // Note: In Pine Script, if statements do NOT create new scopes
        // Variables assigned inside if blocks persist in the outer scope
        for (const stmt of statement.consequent) {
          this.collectDeclarations(stmt);
        }
        for (const stmt of statement.consequent) {
          this.validateStatement(stmt);
        }

        if (statement.alternate) {
          for (const stmt of statement.alternate) {
            this.collectDeclarations(stmt);
          }
          for (const stmt of statement.alternate) {
            this.validateStatement(stmt);
          }
        }
        break;

      case 'ForStatement':
        // For loops create a new scope and define the iterator variable
        this.symbolTable.enterScope();

        // Add the iterator variable to the scope (always int type)
        if ('iterator' in statement) {
          this.symbolTable.define({
            name: statement.iterator,
            type: 'int',
            line: statement.line,
            column: statement.column,
            used: false,
            kind: 'variable',
            declaredWith: null,
          });
        }

        // Validate range expressions
        if ('from' in statement) {
          this.validateExpression(statement.from);
        }
        if ('to' in statement) {
          this.validateExpression(statement.to);
        }

        // Collect declarations first
        for (const stmt of statement.body) {
          this.collectDeclarations(stmt);
        }
        // Then validate
        for (const stmt of statement.body) {
          this.validateStatement(stmt);
        }

        this.symbolTable.exitScope();
        break;

      case 'WhileStatement':
        if ('condition' in statement) {
          this.validateExpression(statement.condition);
        }
        this.symbolTable.enterScope();
        for (const stmt of statement.body) {
          this.validateStatement(stmt);
        }
        this.symbolTable.exitScope();
        break;

      case 'ReturnStatement':
        this.validateExpression(statement.value);
        break;
    }
  }

  private validateExpression(expr: Expression): void {
    switch (expr.type) {
      case 'Identifier':
        this.validateIdentifier(expr);
        break;

      case 'CallExpression':
        this.validateCallExpression(expr);
        break;

      case 'MemberExpression':
        this.validateExpression(expr.object);
        break;

      case 'BinaryExpression':
        this.validateExpression(expr.left);
        this.validateExpression(expr.right);
        this.validateBinaryExpression(expr);
        break;

      case 'UnaryExpression':
        this.validateExpression(expr.argument);
        break;

      case 'TernaryExpression':
        this.validateExpression(expr.condition);
        this.validateExpression(expr.consequent);
        this.validateExpression(expr.alternate);
        break;

      case 'ArrayExpression':
        for (const el of expr.elements) {
          this.validateExpression(el);
        }
        break;

      case 'IndexExpression':
        this.validateExpression(expr.object);
        this.validateExpression(expr.index);
        break;
    }
  }

  private validateIdentifier(identifier: Identifier): void {
    const symbol = this.symbolTable.lookup(identifier.name);

    if (!symbol) {
      // Check if it's a namespace member access (we'll handle this in member expression)
      if (identifier.name.includes('.')) {
        return;
      }

      // Undefined variable - suggest similar names
      const similar = this.symbolTable.findSimilarSymbols(identifier.name, 2);
      let message = `Undefined variable '${identifier.name}'`;

      if (similar.length > 0) {
        message += `. Did you mean '${similar[0]}'?`;
      }

      this.addError(
        identifier.line,
        identifier.column,
        identifier.name.length,
        message,
        DiagnosticSeverity.Error
      );
      return;
    }

    // Mark as used
    this.symbolTable.markUsed(identifier.name);
  }

  private validateBinaryExpression(expr: any): void {
    const leftType = this.inferExpressionType(expr.left);
    const rightType = this.inferExpressionType(expr.right);

    if (!TypeChecker.areTypesCompatible(leftType, rightType, expr.operator)) {
      this.addError(
        expr.line,
        expr.column,
        1,
        `Type mismatch: cannot apply '${expr.operator}' to ${leftType} and ${rightType}`,
        DiagnosticSeverity.Error
      );
    }
  }

  private validateCallExpression(call: CallExpression): void {
    // Get function name
    let functionName = '';
    if (call.callee.type === 'Identifier') {
      functionName = call.callee.name;
    } else if (call.callee.type === 'MemberExpression') {
      const member = call.callee;
      if (member.object.type === 'Identifier') {
        functionName = `${member.object.name}.${member.property.name}`;
      }
    }

    if (!functionName) return;

    // Get function signature
    const signature = this.functionSignatures.get(functionName);
    if (!signature) {
      // Unknown function - could be user-defined
      return;
    }

    // Validate arguments
    this.validateFunctionArguments(call, functionName, signature);

    // Validate argument expressions
    for (const arg of call.arguments) {
      this.validateExpression(arg.value);
    }
  }

  private validateFunctionArguments(
    call: CallExpression,
    functionName: string,
    signature: FunctionSignature
  ): void {
    const args = call.arguments;

    // Build map of provided arguments
    const providedArgs = new Map<string, { arg: CallArgument; type: PineType }>();
    const positionalArgs: { arg: CallArgument; type: PineType }[] = [];

    for (const arg of args) {
      const argType = this.inferExpressionType(arg.value);
      if (arg.name) {
        providedArgs.set(arg.name, { arg, type: argType });
      } else {
        positionalArgs.push({ arg, type: argType });
      }
    }

    // Check argument count
    const requiredCount = signature.parameters.filter(p => !p.optional).length;
    const totalCount = signature.parameters.length;

    // Check if function is variadic (accepts variable arguments)
    // Functions like math.max(...), math.min(...) have empty parameters array but accept multiple args
    const isVariadic = totalCount === 0 && functionName.match(/^(math\.(max|min|avg|sum)|array\.(concat|covariance|avg|min|max|sum))/);

    if (!isVariadic && positionalArgs.length > totalCount) {
      this.addError(
        call.line,
        call.column,
        functionName.length,
        `Too many arguments for '${functionName}'. Expected ${totalCount}, got ${positionalArgs.length}`,
        DiagnosticSeverity.Error
      );
    }

    // For variadic functions, require at least minimum number of arguments
    if (isVariadic) {
      const minArgs = functionName.match(/^math\.(max|min)/) ? 2 : 1;
      if (positionalArgs.length < minArgs) {
        this.addError(
          call.line,
          call.column,
          functionName.length,
          `'${functionName}' requires at least ${minArgs} argument${minArgs > 1 ? 's' : ''}, got ${positionalArgs.length}`,
          DiagnosticSeverity.Error
        );
      }
      return; // Skip further parameter validation for variadic functions
    }

    // Validate each parameter
    for (let i = 0; i < signature.parameters.length; i++) {
      const param = signature.parameters[i];

      // Check named argument
      const namedArg = providedArgs.get(param.name);
      if (namedArg) {
        // Validate type
        if (param.type && param.type !== 'unknown') {
          if (!TypeChecker.isAssignable(namedArg.type, param.type)) {
            this.addError(
              call.line,
              call.column,
              param.name.length,
              `Type mismatch for parameter '${param.name}': expected ${param.type}, got ${namedArg.type}`,
              DiagnosticSeverity.Error
            );
          }
        }
        continue;
      }

      // Check positional argument
      if (i < positionalArgs.length) {
        const posArg = positionalArgs[i];
        if (param.type && param.type !== 'unknown') {
          if (!TypeChecker.isAssignable(posArg.type, param.type)) {
            this.addError(
              call.line,
              call.column,
              functionName.length,
              `Type mismatch for argument ${i + 1}: expected ${param.type}, got ${posArg.type}`,
              DiagnosticSeverity.Error
            );
          }
        }
        continue;
      }

      // Parameter not provided
      if (!param.optional) {
        this.addError(
          call.line,
          call.column,
          functionName.length,
          `Missing required parameter '${param.name}' for function '${functionName}'`,
          DiagnosticSeverity.Error
        );
      }
    }

    // Check for invalid named parameters
    for (const [name] of providedArgs.entries()) {
      if (!signature.parameters.some(p => p.name === name)) {
        const validNames = signature.parameters.map(p => p.name).join(', ');
        this.addError(
          call.line,
          call.column,
          name.length,
          `Invalid parameter '${name}'. Valid parameters: ${validNames}`,
          DiagnosticSeverity.Error
        );
      }
    }

    // Special case validations
    this.validateSpecialCases(call, functionName, args);
  }

  private validateSpecialCases(
    call: CallExpression,
    functionName: string,
    args: CallArgument[]
  ): void {
    // plotshape: should use "style" not "shape"
    if (functionName === 'plotshape' || functionName.endsWith('.plotshape')) {
      for (const arg of args) {
        if (arg.name === 'shape') {
          this.addError(
            call.line,
            call.column,
            5,
            'Invalid parameter "shape". Did you mean "style"?',
            DiagnosticSeverity.Error
          );
        }
      }
    }

    // indicator/strategy: timeframe_gaps without timeframe
    if (functionName === 'indicator' || functionName === 'strategy') {
      const hasTimeframeGaps = args.some(a => a.name === 'timeframe_gaps');
      const hasTimeframe = args.some(a => a.name === 'timeframe');

      if (hasTimeframeGaps && !hasTimeframe) {
        this.addError(
          call.line,
          call.column,
          functionName.length,
          '"timeframe_gaps" has no effect without a "timeframe" argument',
          DiagnosticSeverity.Warning
        );
      }
    }
  }

  private mapReturnTypeToPineType(returnTypeStr: string): PineType {
    // Map common return type strings from function signatures to PineType
    const typeMap: Record<string, PineType> = {
      'int': 'int',
      'float': 'float',
      'bool': 'bool',
      'string': 'string',
      'color': 'color',
      'series float': 'series<float>',
      'series int': 'series<int>',
      'series bool': 'series<bool>',
      'series string': 'series<string>',
      'series color': 'series<color>',
      'const int': 'int',
      'const float': 'float',
      'const bool': 'bool',
      'const string': 'string',
      'simple int': 'int',
      'simple float': 'float',
      'simple bool': 'bool',
      'simple string': 'string',
    };

    return typeMap[returnTypeStr.toLowerCase()] || 'unknown';
  }

  private inferFunctionReturnType(func: any): PineType {
    // func is FunctionDeclaration from AST
    if (!func.body || func.body.length === 0) {
      return 'unknown';
    }

    // Get the last statement in the function body
    const lastStmt = func.body[func.body.length - 1];

    // If it's a return statement, infer from the return value
    if (lastStmt.type === 'ReturnStatement') {
      return this.inferExpressionType(lastStmt.value);
    }

    // If it's a variable declaration or expression statement, it's the return value
    if (lastStmt.type === 'ExpressionStatement') {
      return this.inferExpressionType(lastStmt.expression);
    }

    if (lastStmt.type === 'VariableDeclaration' && lastStmt.init) {
      return this.inferExpressionType(lastStmt.init);
    }

    return 'unknown';
  }

  private inferExpressionType(expr: Expression): PineType {
    // Check cache
    if (this.expressionTypes.has(expr)) {
      return this.expressionTypes.get(expr)!;
    }

    let type: PineType = 'unknown';

    switch (expr.type) {
      case 'Literal':
        type = TypeChecker.inferLiteralType((expr as Literal).value);
        break;

      case 'Identifier':
        const symbol = this.symbolTable.lookup((expr as Identifier).name);
        type = symbol ? symbol.type : 'unknown';
        break;

      case 'CallExpression':
        const callExpr = expr as CallExpression;
        let funcName = '';
        if (callExpr.callee.type === 'Identifier') {
          funcName = callExpr.callee.name;
        } else if (callExpr.callee.type === 'MemberExpression') {
          const member = callExpr.callee;
          if (member.object.type === 'Identifier') {
            funcName = `${member.object.name}.${member.property.name}`;
          }
        }

        // First check if it's a user-defined function in symbol table
        const funcSymbol = this.symbolTable.lookup(funcName);
        if (funcSymbol && funcSymbol.kind === 'function') {
          type = funcSymbol.type;
          break;
        }

        // Then check function signatures for built-ins
        const signature = this.functionSignatures.get(funcName);
        if (signature && signature.returns) {
          // Map the return type string to PineType
          type = this.mapReturnTypeToPineType(signature.returns);
          break;
        }

        // Fallback to TypeChecker for common built-ins
        const argTypes = callExpr.arguments.map(arg => this.inferExpressionType(arg.value));
        type = TypeChecker.getBuiltinReturnType(funcName, argTypes);
        break;

      case 'BinaryExpression':
        const binaryExpr = expr as any;
        const leftType = this.inferExpressionType(binaryExpr.left);
        const rightType = this.inferExpressionType(binaryExpr.right);
        type = TypeChecker.getBinaryOpType(leftType, rightType, binaryExpr.operator);
        break;

      case 'UnaryExpression':
        const unaryExpr = expr as any;
        type = this.inferExpressionType(unaryExpr.argument);
        break;

      case 'TernaryExpression':
        // Phase C - Session 5: Enhanced ternary expression type inference
        const ternaryExpr = expr as any;
        const conseqType = this.inferExpressionType(ternaryExpr.consequent);
        const altType = this.inferExpressionType(ternaryExpr.alternate);

        // If both unknown, return unknown
        if (conseqType === 'unknown' && altType === 'unknown') {
          type = 'unknown';
          break;
        }

        // If one is unknown, try to use the known type
        if (conseqType === 'unknown' && altType !== 'unknown') {
          type = altType;
          break;
        }
        if (altType === 'unknown' && conseqType !== 'unknown') {
          type = conseqType;
          break;
        }

        // Handle na ? na : value pattern - common in Pine Script
        if (conseqType === 'na') {
          type = altType;
        } else if (altType === 'na') {
          type = conseqType;
        } else if (TypeChecker.isAssignable(conseqType, altType)) {
          type = conseqType;
        } else if (TypeChecker.isAssignable(altType, conseqType)) {
          type = altType;
        } else if (TypeChecker.isNumericType(conseqType) && TypeChecker.isNumericType(altType)) {
          // Both numeric - use wider type
          if (conseqType.includes('float') || altType.includes('float')) {
            type = conseqType.startsWith('series') || altType.startsWith('series')
              ? 'series<float>'
              : 'float';
          } else {
            type = conseqType.startsWith('series') || altType.startsWith('series')
              ? 'series<int>'
              : 'int';
          }
        } else {
          // Keep unknown only if truly incompatible
          type = 'unknown';
        }
        break;

      case 'IndexExpression':
        // Phase B - Session 5: Infer type from array/series element access
        const indexExpr = expr as any;
        const arrayType = this.inferExpressionType(indexExpr.object);

        // Handle series<T>[index] → T
        const seriesMatch = arrayType.match(/^series<(.+)>$/);
        if (seriesMatch) {
          type = seriesMatch[1] as PineType;  // Return inner type (e.g., series<float> → float)
          break;
        }

        // Handle array<T>[index] → T
        const arrayMatch = arrayType.match(/^array<(.+)>$/);
        if (arrayMatch) {
          type = arrayMatch[1] as PineType;  // Return element type
          break;
        }

        // For unknown array type, return unknown
        // For known non-array/series type, assume it's indexable and return same type
        type = arrayType === 'unknown' ? 'unknown' : arrayType;
        break;

      case 'MemberExpression':
        // Phase D - Session 5: Check for namespace properties first
        const memberExpr = expr as any;

        // Try to get namespace.property full name
        if (memberExpr.object?.type === 'Identifier' && memberExpr.property?.type === 'Identifier') {
          const propertyName = `${memberExpr.object.name}.${memberExpr.property.name}`;

          // Check if it's a known namespace property
          if (propertyName in this.namespaceProperties) {
            type = this.namespaceProperties[propertyName];
            break;
          }
        }

        // For namespace.function calls, return unknown (will be resolved in call expression)
        type = 'unknown';
        break;
    }

    this.expressionTypes.set(expr, type);
    return type;
  }

  private checkUnusedVariables(): void {
    const unused = this.symbolTable.getAllUnusedSymbols();
    for (const symbol of unused) {
      this.addError(
        symbol.line,
        symbol.column,
        symbol.name.length,
        `Variable '${symbol.name}' is declared but never used`,
        DiagnosticSeverity.Warning
      );
    }
  }

  private addError(
    line: number,
    column: number,
    length: number,
    message: string,
    severity: DiagnosticSeverity
  ): void {
    this.errors.push({ line, column, length, message, severity });
  }
}
