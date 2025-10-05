// Comprehensive Pine Script Validator with Type Checking and Scope Analysis
import * as vscode from 'vscode';
import { Program, Statement, Expression, CallExpression, CallArgument, Identifier, Literal } from './ast';
import { V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../../v6/v6-manual';
import { PineType, TypeChecker, TypeInfo } from './typeSystem';
import { SymbolTable, Symbol as SymbolInfo } from './symbolTable';

export interface ValidationError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: vscode.DiagnosticSeverity;
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
    // Build from V6_FUNCTIONS
    for (const [name, item] of Object.entries(V6_FUNCTIONS)) {
      const sig = this.parseSignature(name, item as PineItem);
      if (sig) {
        this.functionSignatures.set(name, sig);
      }
    }

    // Build from V6_NAMESPACES
    for (const [nsName, nsData] of Object.entries(V6_NAMESPACES)) {
      if (nsData.functions) {
        for (const [fnName, item] of Object.entries(nsData.functions)) {
          const fullName = `${nsName}.${fnName}`;
          const sig = this.parseSignature(fullName, item as PineItem);
          if (sig) {
            this.functionSignatures.set(fullName, sig);
          }
        }
      }
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
            vscode.DiagnosticSeverity.Error
          );
        }

        this.symbolTable.enterScope();
        for (const stmt of statement.consequent) {
          this.validateStatement(stmt);
        }
        this.symbolTable.exitScope();

        if (statement.alternate) {
          this.symbolTable.enterScope();
          for (const stmt of statement.alternate) {
            this.validateStatement(stmt);
          }
          this.symbolTable.exitScope();
        }
        break;

      case 'ForStatement':
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
        vscode.DiagnosticSeverity.Error
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
        vscode.DiagnosticSeverity.Error
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

    if (positionalArgs.length > totalCount) {
      this.addError(
        call.line,
        call.column,
        functionName.length,
        `Too many arguments for '${functionName}'. Expected ${totalCount}, got ${positionalArgs.length}`,
        vscode.DiagnosticSeverity.Error
      );
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
              vscode.DiagnosticSeverity.Error
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
              vscode.DiagnosticSeverity.Error
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
          vscode.DiagnosticSeverity.Error
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
          vscode.DiagnosticSeverity.Error
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
            vscode.DiagnosticSeverity.Error
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
          vscode.DiagnosticSeverity.Warning
        );
      }
    }
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
        const ternaryExpr = expr as any;
        const conseqType = this.inferExpressionType(ternaryExpr.consequent);
        const altType = this.inferExpressionType(ternaryExpr.alternate);
        type = TypeChecker.isAssignable(conseqType, altType) ? conseqType : 'unknown';
        break;

      case 'MemberExpression':
        // For namespace.function, return unknown (will be resolved in call expression)
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
        vscode.DiagnosticSeverity.Warning
      );
    }
  }

  private addError(
    line: number,
    column: number,
    length: number,
    message: string,
    severity: vscode.DiagnosticSeverity
  ): void {
    this.errors.push({ line, column, length, message, severity });
  }
}
