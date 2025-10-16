/**
 * Accurate Pine Script v6 Validator
 * Uses officially verified parameter requirements from parameter-requirements.ts
 * Complete v6 language support (6,665 items)
 */

import * as vscode from 'vscode';
import { PINE_FUNCTIONS_MERGED as ALL_FUNCTION_SIGNATURES } from '../../v6/parameter-requirements-merged';
import { isValidNamespaceMember, CONSTANT_NAMESPACES } from '../../v6/pine-constants-complete';
import {
  STANDALONE_BUILTINS,
  VARIABLE_NAMESPACES,
  FUNCTION_NAMESPACES,
  KEYWORDS,
  TYPE_NAMES,
  isBuiltInVariable as isBuiltIn,
  isKnownNamespace
} from '../../v6/pine-builtins-complete';

export interface ValidationError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: vscode.DiagnosticSeverity;
}

export class AccurateValidator {
  private errors: ValidationError[] = [];

  // Complete v6 namespace support (31 constant + 21 variable + 22 function namespaces)
  private knownNamespaces = new Set([
    ...CONSTANT_NAMESPACES,
    ...VARIABLE_NAMESPACES,
    ...FUNCTION_NAMESPACES
  ]);

  private declaredVariables = new Set<string>();

  // Functions with unreliable auto-generated parameter data - skip parameter validation
  private unreliableParamFunctions = new Set([
    'table.set_bgcolor', 'table.set_border_color', 'table.set_border_width',
    'table.set_frame_color', 'table.set_frame_width', 'table.set_position',
    'table.cell_set_bgcolor', 'table.cell_set_text_color', 'table.cell_set_text',
    'table.cell_set_width', 'table.cell_set_height'
  ]);

  validate(text: string): ValidationError[] {
    this.errors = [];
    this.declaredVariables.clear();

    // First pass: collect declared variables
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.collectDeclaredVariables(lines[i]);
    }

    // Second pass: validate function calls and undefined references
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip blank lines and comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) {
        continue;
      }

      // Remove string literals to avoid false positives on content inside strings
      const lineWithoutStrings = this.removeStringLiterals(line);

      // Check undefined namespaces (e.g., ssss.adas)
      this.checkUndefinedNamespaces(lineWithoutStrings, lineNum);

      // Check incomplete references (e.g., plot.styl, plot.)
      this.checkIncompleteReferences(lineWithoutStrings, lineNum);

      // Check undefined function calls (e.g., sometin())
      this.checkUndefinedFunctions(lineWithoutStrings, lineNum);

      // Check invalid comma-separated var declarations (e.g., var float a = na, b = na)
      this.checkInvalidVarDeclarations(line, lineNum);  // Keep original for this check

      // Check ternary operator syntax (semicolon vs colon)
      this.checkTernaryOperatorSyntax(lineWithoutStrings, lineNum);

      // Check multi-line expression continuation
      this.checkExpressionContinuation(lineWithoutStrings, lineNum, i, lines);

      // Check multi-line function calls and statement continuation
      this.checkMultiLineStatements(lineWithoutStrings, lineNum, i, lines);

      // Check each registered function (use original line for parameter extraction)
      for (const [funcName, spec] of Object.entries(ALL_FUNCTION_SIGNATURES)) {
        this.validateFunctionCall(line, lineNum, funcName, spec);
      }
    }

    return this.errors;
  }

  private removeStringLiterals(line: string): string {
    // Replace all string literals with empty strings to avoid validating their content
    // Handles both single and double quoted strings
    return line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  }

  private collectDeclaredVariables(line: string): void {
    // Match variable declarations: varname = ..., var type varname = ..., varip type varname = ...
    const varDeclarations = line.matchAll(/\b(var|varip)?\s*(?:int|float|bool|string|color)?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g);
    for (const match of varDeclarations) {
      const varName = match[2];
      if (varName && !this.isReservedKeyword(varName)) {
        this.declaredVariables.add(varName);
      }
    }

    // Match function parameters: funcName(..., paramName, ...)
    const paramDeclarations = line.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*=>/g);
    for (const match of paramDeclarations) {
      const funcName = match[1];
      if (funcName) {
        this.declaredVariables.add(funcName);
      }
    }
  }

  private checkUndefinedNamespaces(line: string, lineNum: number): void {
    // Match namespace.member patterns
    const namespacePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = namespacePattern.exec(line)) !== null) {
      const namespace = match[1];
      const member = match[2];
      const column = match.index;

      // Skip if this is a parameter assignment (e.g., style=plot.style_line)
      // Check if there's an = sign before the namespace
      const beforeMatch = line.substring(0, column);
      if (/\w+\s*=\s*$/.test(beforeMatch)) {
        // This is something like "style=plot.style_line", skip the check
        continue;
      }

      // Skip if it's a known namespace, declared variable, or built-in
      if (!this.knownNamespaces.has(namespace) &&
          !this.declaredVariables.has(namespace) &&
          !this.isBuiltInVariable(namespace)) {
        this.addError(
          lineNum,
          column,
          namespace.length + 1 + member.length,
          `Undefined namespace or variable '${namespace}'`,
          vscode.DiagnosticSeverity.Error
        );
      }
      // Check if member is a valid constant for known namespaces
      else if (this.knownNamespaces.has(namespace)) {
        const isValid = this.isValidConstantOrFunction(namespace, member);

        if (!isValid) {
          // Check for constant-like namespaces (all 31 constant namespaces from v6)
          const constantNamespaces = new Set([
            'adjustment', 'alert', 'backadjustment', 'barmerge', 'barstate', 'color',
            'currency', 'dayofweek', 'display', 'dividends', 'earnings', 'extend',
            'font', 'format', 'hline', 'label', 'line', 'location', 'math', 'order',
            'plot', 'position', 'scale', 'session', 'settlement_as_close', 'shape',
            'size', 'splits', 'strategy', 'table', 'text', 'xloc', 'yloc'
          ]);
          if (constantNamespaces.has(namespace)) {
            this.addError(
              lineNum,
              column + namespace.length + 1,
              member.length,
              `Unknown ${namespace} constant or function '${member}'`,
              vscode.DiagnosticSeverity.Warning
            );
          }
        }
      }
    }
  }

  private checkIncompleteReferences(line: string, lineNum: number): void {
    // Match patterns like "namespace." followed by nothing, whitespace, or end of line
    // This catches cases like "plot.styl" where "styl" is incomplete
    const incompletePattern = /\b([a-z]+)\.\s*($|[^a-zA-Z0-9_])/g;
    let match;

    while ((match = incompletePattern.exec(line)) !== null) {
      const namespace = match[1];
      const column = match.index;

      // Only flag if it's a known namespace
      if (this.knownNamespaces.has(namespace)) {
        // Check if this is truly incomplete (no member after the dot)
        const afterDot = match[2];
        if (!afterDot || afterDot.trim() === '' || !/^[a-zA-Z_]/.test(afterDot)) {
          this.addError(
            lineNum,
            column,
            namespace.length + 1,
            `Incomplete reference to '${namespace}' namespace`,
            vscode.DiagnosticSeverity.Error
          );
        }
      }
    }
  }

  private checkInvalidVarDeclarations(line: string, lineNum: number): void {
    // Match invalid comma-separated var declarations:
    // var float a = na, b = na  (INVALID in Pine Script v6)
    // var int x = 0, y = 0      (INVALID in Pine Script v6)
    // Pine Script v6 requires: var float a = na \n var float b = na

    const invalidVarPattern = /\b(var|varip)\s+(int|float|bool|string|color)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*[^,\n]+,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;
    let match;

    while ((match = invalidVarPattern.exec(line)) !== null) {
      const declarationMode = match[1];  // var or varip
      const type = match[2];             // int, float, etc.
      const firstVar = match[3];
      const secondVar = match[4];
      const column = match.index;

      this.addError(
        lineNum,
        column,
        match[0].length,
        `Invalid comma-separated variable declaration. Pine Script v6 requires separate declarations:\n${declarationMode} ${type} ${firstVar} = ...\n${declarationMode} ${type} ${secondVar} = ...`,
        vscode.DiagnosticSeverity.Error
      );
    }
  }

  private checkTernaryOperatorSyntax(line: string, lineNum: number): void {
    // Check for semicolons after ternary operator conditions (should be colons)
    // Pattern: condition ? value ; (WRONG)
    // Should be: condition ? value : (CORRECT)

    // Match ternary operators with semicolons instead of colons
    // This catches: ? expression ; or ? expression ;\s
    const ternaryWithSemicolon = /\?\s*([^:;?\n]+?)\s*;(?!\s*\/\/)/g;
    let match;

    while ((match = ternaryWithSemicolon.exec(line)) !== null) {
      const column = match.index;
      const semicolonPos = column + match[0].lastIndexOf(';');

      // Check if this is actually part of a ternary by looking for ? before it
      const beforeMatch = line.substring(0, column);
      const hasQuestionMark = beforeMatch.includes('?') || match[0].includes('?');

      if (hasQuestionMark) {
        this.addError(
          lineNum,
          semicolonPos,
          1,
          `Invalid semicolon in ternary operator. Use colon (:) instead of semicolon (;) for ternary operator continuation`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }

    // Also check for pattern: ? value1 : value2 ; value3 (semicolon where colon expected)
    // This is the specific error in line 163: ? color.new(...) ; smoothedScore
    const ternaryIncomplete = /\?\s*[^:;?\n]+\s*:\s*[^:;?\n]+\s*;(?=\s*\w)/g;
    match = null;

    while ((match = ternaryIncomplete.exec(line)) !== null) {
      const column = match.index;
      const semicolonPos = column + match[0].lastIndexOf(';');

      this.addError(
        lineNum,
        semicolonPos,
        1,
        `Invalid semicolon in nested ternary operator. Use colon (:) for ternary continuation, not semicolon (;)`,
        vscode.DiagnosticSeverity.Error
      );
    }
  }

  private checkExpressionContinuation(line: string, lineNum: number, lineIndex: number, allLines: string[]): void {
    // Check for multi-line expressions that might be incorrectly terminated
    // Common pattern: function call with ternary operator spanning multiple lines

    const trimmed = line.trim();

    // If line ends with ? without a corresponding value, next line should start with value
    if (trimmed.endsWith('?') && lineIndex + 1 < allLines.length) {
      const nextLine = allLines[lineIndex + 1].trim();
      // Next line should provide the true value (not start with : or ;)
      if (nextLine.startsWith(';')) {
        const column = line.length - 1;
        this.addError(
          lineNum,
          column,
          1,
          `Incomplete ternary operator. Expected value after '?', found semicolon on next line`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }

    // If line ends with : (ternary continuation), next line must continue the expression
    // BUT: Only flag if it's truly incomplete (not if entire expression is on one line)
    if (trimmed.endsWith(':') && lineIndex + 1 < allLines.length) {
      const nextLine = allLines[lineIndex + 1].trim();

      // Check if the colon is part of a complete single-line ternary
      // Pattern: condition ? value : condition ? value : value (all on one line)
      const hasSingleLineTernary = /\?\s*[^:]+:\s*[^:]+:\s*[^:]+/.test(line);

      // Only flag as error if:
      // 1. Next line starts with semicolon (wrong) OR
      // 2. Line doesn't have complete single-line ternary
      if (nextLine.startsWith(';') && !hasSingleLineTernary) {
        const column = line.length - 1;
        this.addError(
          lineNum + 1,
          0,
          1,
          `Invalid expression continuation. Semicolon found after ternary colon (:). Did you mean to use another colon for nested ternary?`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }

    // Check for function calls ending with semicolon on same line as ternary
    // Pattern: bgcolor(...) ; or plot(...) ;
    const funcWithSemicolon = /\b(bgcolor|plot|plotshape|plotchar|hline|fill|label\.new|line\.new|box\.new|table\.new)\s*\([^)]*\)\s*;/g;
    let match;

    while ((match = funcWithSemicolon.exec(line)) !== null) {
      const funcName = match[1];
      const column = match.index + match[0].lastIndexOf(';');

      // Check if there's a ternary operator in the function arguments
      const funcCall = match[0];
      if (funcCall.includes('?')) {
        this.addError(
          lineNum,
          column,
          1,
          `Invalid semicolon in function call with ternary operator. Ternary operators require colons (:), not semicolons (;)`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }
  }

  private checkMultiLineStatements(line: string, lineNum: number, lineIndex: number, allLines: string[]): void {
    // Check for proper multi-line statement continuation (Pine Script v6 rules)
    // Based on TradingView style guide and common patterns

    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('//')) {
      return;
    }

    // Count parentheses to track open function calls
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const unclosedParens = openParens - closeParens;

    // If line has unclosed parentheses, next line should be indented continuation
    if (unclosedParens > 0 && lineIndex + 1 < allLines.length) {
      const nextLine = allLines[lineIndex + 1];
      const currentIndent = line.search(/\S/); // First non-whitespace
      const nextIndent = nextLine.search(/\S/);

      // Next line should be indented more than current line (continuation)
      // Exception: if next line closes the parentheses immediately
      if (nextLine.trim() && !nextLine.trim().startsWith(')')) {
        if (nextIndent <= currentIndent) {
          // Check if this is a function call with parameters
          const funcMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/);
          if (funcMatch) {
            this.addError(
              lineNum + 1,
              0,
              nextLine.trim().length,
              `Improper indentation for multi-line function call continuation. Continuation lines should be indented beyond the opening line.`,
              vscode.DiagnosticSeverity.Warning
            );
          }
        }
      }
    }

    // Check for lines ending with comma (parameter continuation)
    if (trimmed.endsWith(',') && lineIndex + 1 < allLines.length) {
      const nextLine = allLines[lineIndex + 1];
      const nextTrimmed = nextLine.trim();

      // If line ends with comma, there should be a continuation
      if (nextTrimmed === '' || nextTrimmed.startsWith('//')) {
        this.addError(
          lineNum,
          line.lastIndexOf(','),
          1,
          `Trailing comma without continuation. Expected parameter or closing parenthesis on next line.`,
          vscode.DiagnosticSeverity.Error
        );
      }

      // Check if next line is properly indented for parameter continuation
      const currentIndent = line.search(/\S/);
      const nextIndent = nextLine.search(/\S/);

      // For input functions with options parameter, next line should be indented
      if (line.includes('input.') && line.includes('(') && nextIndent <= currentIndent) {
        this.addError(
          lineNum + 1,
          0,
          Math.min(10, nextLine.trim().length),
          `Multi-line input function: continuation line should be indented. Consider proper indentation for readability.`,
          vscode.DiagnosticSeverity.Warning
        );
      }
    }

    // Check for specific input.string() pattern with options parameter
    // Pattern: input.string(default, title, options=[...])
    if (line.includes('input.string(') && trimmed.endsWith(',')) {
      const nextLine = lineIndex + 1 < allLines.length ? allLines[lineIndex + 1] : '';
      const nextTrimmed = nextLine.trim();

      // If next line starts with "options=" but is not indented properly
      if (nextTrimmed.startsWith('options=')) {
        const currentIndent = line.search(/\S/);
        const nextIndent = nextLine.search(/\S/);

        if (nextIndent <= currentIndent + 4) {
          this.addError(
            lineNum + 1,
            0,
            7, // Length of "options"
            `Multi-line input.string() with options parameter: ensure proper indentation (use spaces not a multiple of 4 for continuation as per style guide).`,
            vscode.DiagnosticSeverity.Warning
          );
        }
      }
    }

    // Check for incomplete statements - line ends without clear continuation marker
    // But has function call patterns suggesting multi-line
    const hasOpenFunc = /([a-zA-Z_][a-zA-Z0-9_.]*)\s*\([^)]*$/.test(line);
    if (hasOpenFunc && unclosedParens > 0) {
      // Check if next line exists and continues properly
      if (lineIndex + 1 < allLines.length) {
        const nextLine = allLines[lineIndex + 1].trim();

        // If next line is empty or comment, warn about incomplete statement
        if (!nextLine || nextLine.startsWith('//')) {
          this.addError(
            lineNum,
            line.lastIndexOf('('),
            1,
            `Incomplete function call. Opening parenthesis without corresponding parameters or closing parenthesis.`,
            vscode.DiagnosticSeverity.Error
          );
        }
      } else {
        // This is the last line with unclosed parentheses
        this.addError(
          lineNum,
          line.lastIndexOf('('),
          1,
          `Unclosed parenthesis. Function call is incomplete.`,
          vscode.DiagnosticSeverity.Error
        );
      }
    }
  }

  private isValidConstantOrFunction(namespace: string, member: string): boolean {
    // Check if it's a valid constant
    if (isValidNamespaceMember(namespace, member)) {
      return true;
    }

    // Check if it's a known function
    const fullName = `${namespace}.${member}`;
    if (ALL_FUNCTION_SIGNATURES[fullName]) {
      return true;
    }

    return false;
  }

  private checkUndefinedFunctions(line: string, lineNum: number): void {
    // Match function calls: funcName(...)
    const funcPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;
    while ((match = funcPattern.exec(line)) !== null) {
      const funcName = match[1];
      const column = match.index;

      // Skip if it's a known function, declared variable, or built-in control structure
      if (!ALL_FUNCTION_SIGNATURES[funcName] &&
          !this.declaredVariables.has(funcName) &&
          !this.isControlStructure(funcName)) {
        // Check if it's a namespaced function that exists
        const beforeFunc = line.substring(0, column);
        const namespaceMatch = beforeFunc.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.\s*$/);
        if (namespaceMatch && this.knownNamespaces.has(namespaceMatch[1])) {
          // It's a namespaced function, check if it exists
          const fullName = `${namespaceMatch[1]}.${funcName}`;
          if (!ALL_FUNCTION_SIGNATURES[fullName]) {
            this.addError(
              lineNum,
              column,
              funcName.length,
              `Undefined function '${fullName}'`,
              vscode.DiagnosticSeverity.Error
            );
          }
        } else if (!namespaceMatch) {
          // It's a standalone function call
          this.addError(
            lineNum,
            column,
            funcName.length,
            `Undefined function '${funcName}'`,
            vscode.DiagnosticSeverity.Error
          );
        }
      }
    }
  }

  private isReservedKeyword(word: string): boolean {
    return KEYWORDS.has(word) || word === 'true' || word === 'false' || word === 'break' || word === 'continue';
  }

  private isBuiltInVariable(word: string): boolean {
    return isBuiltIn(word) || VARIABLE_NAMESPACES.has(word);
  }

  private isControlStructure(word: string): boolean {
    // Control structures, keywords, and operators that should never be flagged
    // All 15 keywords + boolean literals + special values
    return KEYWORDS.has(word) || word === 'true' || word === 'false' || word === 'na' || word === 'break' || word === 'continue';
  }

  private validateFunctionCall(
    line: string,
    lineNum: number,
    functionName: string,
    spec: any
  ): void {
    // Skip type names - they're not functions
    if (TYPE_NAMES.has(functionName)) {
      return;
    }

    // Create regex to match function calls
    // Use negative lookbehind to prevent matching namespaced functions
    // e.g., when checking 'bool', don't match 'input.bool'
    const escapedName = functionName.replace(/\./g, '\\.');
    const regex = new RegExp(`(?<![a-zA-Z0-9_\\.])${escapedName}\\s*\\(([^)]*)\\)`, 'g');

    let match;
    while ((match = regex.exec(line)) !== null) {
      const argsString = match[1];
      const column = match.index;

      // Count arguments (simple split by comma, not perfect but good enough)
      const args = argsString.trim() === '' ? [] : this.splitArguments(argsString);

      const requiredCount = spec.requiredParams ? spec.requiredParams.length : 0;
      const totalCount = (spec.requiredParams ? spec.requiredParams.length : 0) + (spec.optionalParams ? spec.optionalParams.length : 0);

      // Check if function is variadic (signature contains "...")
      const isVariadic = spec.signature && spec.signature.includes('...');

      // Only validate parameter counts for well-defined specs
      // Skip if:
      // 1. Function is in unreliable list (known bad parameter data)
      // 2. Variadic function (contains ...)
      // 3. No parameter info but has signature (auto-generated with incomplete data)
      // 4. Generated functions without parameters array (unreliable)
      if (this.unreliableParamFunctions.has(functionName)) {
        return; // Skip known unreliable functions
      }

      const hasReliableParams = spec.parameters && spec.parameters.length > 0;

      if (isVariadic || (!hasReliableParams && (requiredCount === 0 || totalCount === 0))) {
        // Skip validation for variadic or auto-generated functions with incomplete data
        return;
      }

      // Check if too few arguments
      if (args.length < requiredCount) {
        const missing = spec.requiredParams.slice(args.length);
        this.addError(
          lineNum,
          column,
          functionName.length,
          `Missing required parameter(s) for '${functionName}': ${missing.join(', ')}`,
          vscode.DiagnosticSeverity.Error
        );
      }

      // Check if too many arguments
      if (args.length > totalCount) {
        this.addError(
          lineNum,
          column,
          functionName.length,
          `Too many arguments for '${functionName}'. Expected max ${totalCount}, got ${args.length}`,
          vscode.DiagnosticSeverity.Error
        );
      }

      // Special validations
      this.validateSpecialCases(line, lineNum, column, functionName, args);
    }
  }

  private splitArguments(argsString: string): string[] {
    const args: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      const prevChar = i > 0 ? argsString[i - 1] : '';

      // Handle strings
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        current += char;
        continue;
      }

      if (inString) {
        current += char;
        continue;
      }

      // Handle nesting
      if (char === '(' || char === '[') {
        depth++;
        current += char;
      } else if (char === ')' || char === ']') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        if (current.trim()) {
          args.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
  }

  private validateSpecialCases(
    line: string,
    lineNum: number,
    column: number,
    functionName: string,
    args: string[]
  ): void {
    // plotshape: check for "shape=" parameter (should be "style=")
    if (functionName === 'plotshape' && line.includes('shape=')) {
      const shapeIndex = line.indexOf('shape=');
      this.addError(
        lineNum,
        shapeIndex,
        6,
        'Invalid parameter "shape" for plotshape(). Did you mean "style"?',
        vscode.DiagnosticSeverity.Error
      );
    }

    // plotchar: check for "shape=" parameter (should be "char=")
    if (functionName === 'plotchar' && line.includes('shape=')) {
      const shapeIndex = line.indexOf('shape=');
      this.addError(
        lineNum,
        shapeIndex,
        6,
        'Invalid parameter "shape" for plotchar(). Did you mean "char"?',
        vscode.DiagnosticSeverity.Error
      );
    }

    // indicator/strategy: timeframe_gaps without timeframe
    if ((functionName === 'indicator' || functionName === 'strategy') &&
        line.includes('timeframe_gaps') && !line.includes('timeframe=')) {
      const index = line.indexOf('timeframe_gaps');
      this.addError(
        lineNum,
        index,
        14,
        '"timeframe_gaps" has no effect without "timeframe" parameter',
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
    this.errors.push({
      line,
      column,
      length,
      message,
      severity
    });
  }
}
