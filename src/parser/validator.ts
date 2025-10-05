// Pine Script v6 AST-based Validator
import * as vscode from 'vscode';
import { Program, CallExpression, CallArgument, Expression, Statement } from './ast';
import { V6_FUNCTIONS, V6_NAMESPACES, PineItem } from '../../v6/v6-manual';

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
  type?: string;
  optional?: boolean;
  defaultValue?: string;
}

export class PineScriptValidator {
  private errors: ValidationError[] = [];
  private functionSignatures: Map<string, FunctionSignature> = new Map();
  private variables: Map<string, string> = new Map(); // variable name -> type

  constructor() {
    this.buildFunctionSignatures();
  }

  validate(ast: Program): ValidationError[] {
    this.errors = [];
    this.variables.clear();

    for (const statement of ast.body) {
      this.validateStatement(statement);
    }

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
      // Extract parameters from syntax: "functionName(param1, param2, ...)"
      const match = item.syntax.match(/\(([^)]*)\)/);
      if (!match) return { name, parameters: [], returns: item.returns };

      const paramsString = match[1].trim();
      if (!paramsString) return { name, parameters: [], returns: item.returns };

      const parameters: ParameterInfo[] = [];
      const params = paramsString.split(',').map(p => p.trim());

      for (const param of params) {
        // Parse: "name" or "name=default" or "name: type" or "name: type = default"
        const parts = param.split('=');
        const nameAndType = parts[0].trim();
        const defaultValue = parts[1]?.trim();

        const typeParts = nameAndType.split(':');
        const paramName = typeParts[0].trim();
        const paramType = typeParts[1]?.trim();

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

  private validateStatement(statement: Statement): void {
    switch (statement.type) {
      case 'VariableDeclaration':
        this.variables.set(statement.name, statement.typeAnnotation?.name || 'unknown');
        if (statement.init) {
          this.validateExpression(statement.init);
        }
        break;

      case 'ExpressionStatement':
        this.validateExpression(statement.expression);
        break;

      case 'FunctionDeclaration':
        // Validate function body
        for (const stmt of statement.body) {
          this.validateStatement(stmt);
        }
        break;

      case 'IfStatement':
        this.validateExpression(statement.condition);
        for (const stmt of statement.consequent) {
          this.validateStatement(stmt);
        }
        if (statement.alternate) {
          for (const stmt of statement.alternate) {
            this.validateStatement(stmt);
          }
        }
        break;

      case 'ForStatement':
      case 'WhileStatement':
        if ('condition' in statement) {
          this.validateExpression(statement.condition);
        }
        for (const stmt of statement.body) {
          this.validateStatement(stmt);
        }
        break;

      case 'ReturnStatement':
        this.validateExpression(statement.value);
        break;
    }
  }

  private validateExpression(expr: Expression): void {
    switch (expr.type) {
      case 'CallExpression':
        this.validateCallExpression(expr);
        break;

      case 'MemberExpression':
        this.validateExpression(expr.object);
        break;

      case 'BinaryExpression':
        this.validateExpression(expr.left);
        this.validateExpression(expr.right);
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

    // Recursively validate argument expressions
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
    const providedArgs = new Map<string, CallArgument>();
    const positionalArgs: CallArgument[] = [];

    for (const arg of args) {
      if (arg.name) {
        providedArgs.set(arg.name, arg);
      } else {
        positionalArgs.push(arg);
      }
    }

    // Check if too many positional arguments
    const requiredParams = signature.parameters.filter(p => !p.optional).length;
    const totalParams = signature.parameters.length;

    if (positionalArgs.length > totalParams) {
      this.addError(
        call.line,
        call.column,
        functionName.length,
        `Too many arguments for "${functionName}". Expected ${totalParams}, got ${positionalArgs.length}`,
        vscode.DiagnosticSeverity.Error
      );
    }

    // Check each parameter
    for (let i = 0; i < signature.parameters.length; i++) {
      const param = signature.parameters[i];

      // Check if provided by name
      const namedArg = providedArgs.get(param.name);
      if (namedArg) {
        // Argument provided by name - check if it's valid
        if (!signature.parameters.some(p => p.name === param.name)) {
          this.addError(
            call.line,
            call.column,
            param.name.length,
            `Function "${functionName}" does not have parameter "${param.name}"`,
            vscode.DiagnosticSeverity.Error
          );
        }
        continue;
      }

      // Check if provided positionally
      if (i < positionalArgs.length) {
        continue;
      }

      // Parameter not provided - check if required
      if (!param.optional) {
        this.addError(
          call.line,
          call.column,
          functionName.length,
          `Missing required parameter "${param.name}" for function "${functionName}"`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }

    // Check for invalid named parameters
    for (const [name, arg] of providedArgs.entries()) {
      const validParam = signature.parameters.find(p => p.name === name);
      if (!validParam) {
        this.addError(
          call.line,
          call.column,
          name.length,
          `Invalid parameter "${name}". Did you mean one of: ${signature.parameters.map(p => p.name).join(', ')}?`,
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
            5, // length of "shape"
            'Invalid parameter "shape". Did you mean "style"?',
            vscode.DiagnosticSeverity.Error
          );
        }
      }
    }

    // plotchar: should use "char" not "shape"
    if (functionName === 'plotchar' || functionName.endsWith('.plotchar')) {
      for (const arg of args) {
        if (arg.name === 'shape') {
          this.addError(
            call.line,
            call.column,
            5,
            'Invalid parameter "shape". Did you mean "char"?',
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
