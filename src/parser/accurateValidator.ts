/**
 * Accurate Pine Script v6 Validator
 * Uses officially verified parameter requirements from parameter-requirements.ts
 * Complete v6 language support (6,665 items)
 */

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

/**
 * Diagnostic severity, mirroring `vscode.DiagnosticSeverity` by value.
 *
 * Declared locally rather than imported so this module has NO dependency on the
 * `vscode` runtime, which exists only inside the extension host. Importing it made
 * the validator unloadable outside VS Code — CI failed with
 * `Cannot find module 'vscode'`, and it would equally block the headless CLI, the
 * MCP server, and the agent plugin from reusing the engine.
 *
 * `extension.ts` maps these integers straight onto the real enum; the values are
 * identical, so nothing downstream changes.
 */
export const Severity = {
  Error: 0,
  Warning: 1,
  Information: 2,
  Hint: 3
} as const;

export type DiagnosticSeverity = 0 | 1 | 2 | 3;

export interface ValidationError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: DiagnosticSeverity;
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

  // User-defined types and enums (`type Foo` / `enum Bar`). These act as namespaces
  // for `.new(...)` constructors and field access, so they must not be flagged as
  // "undefined namespace".
  private declaredTypes = new Set<string>();

  // Functions whose parameter-NAME data is verified complete — safe to flag unknown
  // named arguments as errors. (Most functions have incomplete generated param data,
  // e.g. plot/input.*, so a blanket check would false-positive. This is the curated
  // allowlist of drawing functions where wrong arg names are common and catchable —
  // this is what catches e.g. `label.new(... text_halign=...)` → should be `textalign`.)
  private namedArgCheckedFunctions = new Set([
    'label.new', 'line.new', 'box.new', 'table.new', 'table.cell',
    'label.set_xy', 'label.set_text', 'label.set_point', 'polyline.new'
  ]);

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
    this.declaredTypes.clear();

    // Pine v6 (April 2026) added multiline string literals delimited by `"""` or
    // `'''`. Their contents are text, not code, and they span lines — so they must
    // be neutralised before any per-line analysis, or every word inside a message
    // block gets parsed as an identifier and the unbalanced quotes desynchronise
    // single-line string stripping for the rest of the file.
    const lines = this.blankMultilineStrings(text).split('\n');
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

      // Remove string literals AND inline comments to avoid false positives on their
      // content (e.g. a word followed by "(" inside a `// comment` was flagged as an
      // undefined function). Strings are blanked first, so a "//" left over is a real
      // comment, not part of a URL inside a string.
      const lineWithoutStrings = this.removeStringLiterals(line).replace(/\/\/.*$/, '');

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

      // Check each registered function (use original line for parameter extraction).
      // Only the functions actually named on this line are considered. The previous
      // implementation looped all 457 signatures per line and compiled a regex for
      // each — roughly 595,000 regex executions on a 1,300-line script, which put
      // validation well over the 100ms budget. Candidate extraction is one scan.
      for (const funcName of this.extractCalledFunctionNames(lineWithoutStrings)) {
        const spec = (ALL_FUNCTION_SIGNATURES as any)[funcName];
        if (spec) {
          this.validateFunctionCall(line, lineNum, funcName, spec);
        }
      }
    }

    return this.errors;
  }

  /**
   * Replace the body of every multiline string literal (`"""..."""` / `'''...'''`)
   * with spaces, leaving the delimiters and all newlines in place.
   *
   * Preserving both the line count and each line's length matters: reported line
   * numbers and columns are offsets into the ORIGINAL document, so the blanked text
   * has to stay positionally identical to what the user sees in the editor.
   */
  private blankMultilineStrings(text: string): string {
    return text.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, match =>
      match.replace(/[^\n]/g, ' ')
    );
  }

  private removeStringLiterals(line: string): string {
    // Replace all string literals with empty strings to avoid validating their content
    // Handles both single and double quoted strings
    return line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  }

  private collectDeclaredVariables(line: string): void {
    // Collect user-defined type / enum declarations so `TypeName.new(...)` and field
    // access aren't mistaken for an undefined namespace.
    const typeDecl = line.match(/^\s*(?:export\s+)?(?:type|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (typeDecl) {
      this.declaredTypes.add(typeDecl[1]);
      this.declaredVariables.add(typeDecl[1]);
    }

    // `for ... in` loop iterators bind names without an `=`, so the assignment
    // pattern below never sees them. Both v6 forms are handled:
    //     for element in collection
    //     for [index, element] in collection
    const forInDecl = line.match(/^\s*for\s+(?:\[([^\]]+)\]|([a-zA-Z_][a-zA-Z0-9_]*))\s+in\s+/);
    if (forInDecl) {
      const bound = forInDecl[1] ? forInDecl[1].split(',') : [forInDecl[2]];
      for (const name of bound) {
        const iterator = name.trim();
        if (iterator && !this.isReservedKeyword(iterator)) {
          this.declaredVariables.add(iterator);
        }
      }
    }

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
          !this.declaredTypes.has(namespace) &&
          !this.isBuiltInVariable(namespace)) {
        this.addError(
          lineNum,
          column,
          namespace.length + 1 + member.length,
          `Undefined namespace or variable '${namespace}'`,
          Severity.Error
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
              Severity.Warning
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
            Severity.Error
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
        Severity.Error
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
          Severity.Error
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
        Severity.Error
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
          Severity.Error
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
          Severity.Error
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
          Severity.Error
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

    // NOTE ON INDENTATION: this validator used to warn when a continuation line was
    // not indented past its opening line, and again when an `input.string()` options
    // continuation was indented by a multiple of four. TradingView REMOVED both
    // restrictions in the December 2025 release ("Removed indentation restrictions
    // for wrapped lines within parentheses... now supports multiples of four spaces
    // inside enclosed expressions"). Enforcing them flagged correct modern code, so
    // the rules are gone rather than downgraded — a warning on valid syntax is still
    // a false positive.

    // Trailing comma must be followed by something. Blank lines and comment lines
    // are legal *inside* a wrapped call, so look past them for the real continuation
    // rather than treating the very next line as authoritative.
    if (trimmed.endsWith(',')) {
      if (this.nextMeaningfulLineIndex(allLines, lineIndex + 1) === -1) {
        this.addError(
          lineNum,
          line.lastIndexOf(','),
          1,
          `Trailing comma without continuation. Expected parameter or closing parenthesis on next line.`,
          Severity.Error
        );
      }
    }

    // An unclosed parenthesis is only an error if nothing meaningful follows it.
    // Pine allows blank lines and comments between arguments:
    //     plot(close,
    //         // the series title
    //         "Close")
    const hasOpenFunc = /([a-zA-Z_][a-zA-Z0-9_.]*)\s*\([^)]*$/.test(line);
    if (hasOpenFunc && unclosedParens > 0) {
      if (this.nextMeaningfulLineIndex(allLines, lineIndex + 1) === -1) {
        this.addError(
          lineNum,
          line.lastIndexOf('('),
          1,
          `Unclosed parenthesis. Function call is incomplete.`,
          Severity.Error
        );
      }
    }
  }

  /**
   * Index of the next line carrying actual code, skipping blank lines and
   * whole-line comments. Returns -1 when only blanks/comments remain, which is the
   * only condition under which an open call or trailing comma is genuinely
   * unterminated.
   */
  private nextMeaningfulLineIndex(allLines: string[], from: number): number {
    for (let i = from; i < allLines.length; i++) {
      const candidate = allLines[i].trim();
      if (candidate && !candidate.startsWith('//')) {
        return i;
      }
    }
    return -1;
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
              Severity.Error
            );
          }
        } else if (!namespaceMatch) {
          // It's a standalone function call
          this.addError(
            lineNum,
            column,
            funcName.length,
            `Undefined function '${funcName}'`,
            Severity.Error
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

    // Match the function NAME + opening paren only. The argument string is then
    // extracted with a depth-aware scan so nested parentheses don't truncate it
    // (the old `\(([^)]*)\)` regex stopped at the first inner ')', under-counting
    // args for any call like `ta.ema(a / (b + c) * 100, 3)`).
    // Use negative lookbehind to prevent matching namespaced functions
    // e.g., when checking 'bool', don't match 'input.bool'
    const escapedName = functionName.replace(/\./g, '\\.');
    const regex = new RegExp(`(?<![a-zA-Z0-9_\\.])${escapedName}\\s*\\(`, 'g');

    let match;
    while ((match = regex.exec(line)) !== null) {
      const openParenIndex = match.index + match[0].length - 1;
      const argsString = this.extractBalancedArgs(line, openParenIndex);
      // null = the call's parens don't close on this line (multi-line call) — skip
      // count validation here to avoid false positives.
      if (argsString === null) {
        continue;
      }
      const column = match.index;

      // Count arguments (simple split by comma, not perfect but good enough)
      const args = argsString.trim() === '' ? [] : this.splitArguments(argsString);

      // Overload-aware arity bounds. A call is valid if it satisfies ANY overload,
      // so the accepted range is min(required) .. max(required + optional) across
      // all forms. Functions without an `overloads` field have exactly one form.
      const forms: Array<{ requiredParams?: string[]; optionalParams?: string[] }> =
        spec.overloads && spec.overloads.length > 0 ? spec.overloads : [spec];

      const requiredCount = Math.min(
        ...forms.map(f => (f.requiredParams ? f.requiredParams.length : 0))
      );
      const totalCount = Math.max(
        ...forms.map(f =>
          (f.requiredParams ? f.requiredParams.length : 0) +
          (f.optionalParams ? f.optionalParams.length : 0)
        )
      );

      // Check if function is variadic (signature contains "...").
      // This is a string heuristic over display text, so it only applies when we
      // have no structured data: a spec carrying explicit `overloads` is fully
      // described, and an ellipsis in its human-readable signature must not be
      // mistaken for "unbounded arguments".
      const isVariadic =
        !(spec.overloads && spec.overloads.length > 0) &&
        spec.signature && spec.signature.includes('...');

      // Only validate parameter counts for well-defined specs
      // Skip if:
      // 1. Function is in unreliable list (known bad parameter data)
      // 2. Variadic function (contains ...)
      // 3. No parameter info but has signature (auto-generated with incomplete data)
      // 4. Generated functions without parameters array (unreliable)
      // NOTE: `continue`, not `return` — a line can contain several calls to the
      // same function (`f(x) + f(y)`); returning would skip every later call.
      if (this.unreliableParamFunctions.has(functionName)) {
        continue; // Skip known unreliable functions
      }

      const hasReliableParams =
        (spec.parameters && spec.parameters.length > 0) ||
        (spec.overloads && spec.overloads.length > 0);

      if (isVariadic || (!hasReliableParams && (requiredCount === 0 || totalCount === 0))) {
        // Skip validation for variadic or auto-generated functions with incomplete data
        continue;
      }

      // Check if too few arguments. Reported against the overload with the fewest
      // required parameters, so the message names the minimum the user must supply.
      if (args.length < requiredCount) {
        const leanest = forms.reduce((a, b) =>
          (a.requiredParams?.length ?? 0) <= (b.requiredParams?.length ?? 0) ? a : b
        );
        const missing = (leanest.requiredParams || []).slice(args.length);
        this.addError(
          lineNum,
          column,
          functionName.length,
          `Missing required parameter(s) for '${functionName}': ${missing.join(', ')}`,
          Severity.Error
        );
      }

      // Check if too many arguments
      if (args.length > totalCount) {
        this.addError(
          lineNum,
          column,
          functionName.length,
          `Too many arguments for '${functionName}'. Expected max ${totalCount}, got ${args.length}`,
          Severity.Error
        );
      }

      // Validate named-argument NAMES against the function's known parameters
      // (only for curated functions with complete data — avoids false positives).
      // With overloads, the accepted set is the UNION across every form: writing
      // `line.new(x1=..., y1=...)` is valid even though the first overload has no
      // `x1`. Flattening to a single form is exactly what produced the earlier
      // false positives on the coordinate constructors.
      if (this.namedArgCheckedFunctions.has(functionName)) {
        const validNames = this.collectValidParamNames(spec);
        if (validNames.size > 0) {
          for (const arg of args) {
            const nm = arg.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)/);
            if (nm && !validNames.has(nm[1])) {
              this.addError(
                lineNum,
                column,
                functionName.length,
                `No parameter named '${nm[1]}' in '${functionName}'`,
                Severity.Error
              );
            }
          }
        }
      }

      // Special validations
      this.validateSpecialCases(line, lineNum, column, functionName, args);
    }
  }

  /**
   * The (possibly namespaced) identifiers called as functions on this line.
   *
   * The identifier pattern is greedy across dots, so `input.bool(...)` yields
   * `input.bool` rather than a bare `bool` — this preserves the behaviour the old
   * per-function negative lookbehind provided, without needing one regex per known
   * function. Returned as a Set because a name repeated on one line only needs
   * validating once; `validateFunctionCall` already walks every occurrence.
   */
  private extractCalledFunctionNames(line: string): Set<string> {
    const names = new Set<string>();
    const callPattern = /([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/g;
    let match;
    while ((match = callPattern.exec(line)) !== null) {
      names.add(match[1]);
    }
    return names;
  }

  /**
   * Every parameter name this function will accept, across all of its overloads.
   *
   * Sources, in order of reliability: the manual `overloads` list, the manual
   * required/optional lists, and finally the auto-generated `parameters` array.
   * All are unioned — an argument name is valid if ANY overload declares it.
   * Returns an empty set when nothing is known, which the caller treats as
   * "no data, do not flag" rather than "nothing is valid".
   */
  private collectValidParamNames(spec: any): Set<string> {
    const names = new Set<string>();

    if (Array.isArray(spec.overloads)) {
      for (const overload of spec.overloads) {
        for (const name of overload.requiredParams || []) names.add(name);
        for (const name of overload.optionalParams || []) names.add(name);
      }
    }

    for (const name of spec.requiredParams || []) names.add(name);
    for (const name of spec.optionalParams || []) names.add(name);

    if (Array.isArray(spec.parameters)) {
      for (const parameter of spec.parameters) {
        if (parameter && parameter.name) names.add(parameter.name);
      }
    }

    return names;
  }

  /**
   * Given a line and the index of an opening '(', return the substring of arguments
   * up to (but not including) the matching ')', honouring nested ()/[] and string
   * literals. Returns null if the parenthesis never closes on this line (multi-line
   * call), so the caller can skip count validation rather than emit a false error.
   */
  private extractBalancedArgs(line: string, openParenIndex: number): string | null {
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let args = '';

    for (let i = openParenIndex; i < line.length; i++) {
      const char = line[i];
      const prev = i > 0 ? line[i - 1] : '';

      if (inString) {
        if (char === stringChar && prev !== '\\') {
          inString = false;
        }
        if (i > openParenIndex) args += char;
        continue;
      }

      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        if (i > openParenIndex) args += char;
        continue;
      }

      if (char === '(' || char === '[') {
        depth++;
        if (i > openParenIndex) args += char;
        continue;
      }

      if (char === ')' || char === ']') {
        depth--;
        if (depth === 0) {
          return args; // matched the function's closing paren
        }
        if (i > openParenIndex) args += char;
        continue;
      }

      if (i > openParenIndex) args += char;
    }

    return null; // unbalanced on this line
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
        Severity.Error
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
        Severity.Error
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
        Severity.Warning
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
    this.errors.push({
      line,
      column,
      length,
      message,
      severity
    });
  }
}
