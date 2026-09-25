/**
 * Accurate Pine Script v6 Validator
 * Uses officially verified parameter requirements from parameter-requirements.ts
 * Complete v6 language support (6,665 items)
 */

import { PINE_FUNCTIONS_MERGED as ALL_FUNCTION_SIGNATURES } from '../../v6/parameter-requirements-merged';
import { isValidNamespaceMember, CONSTANT_NAMESPACES } from '../../v6/pine-constants-complete';
import { REFERENCE_NAMES } from '../../v6/reference-names';
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

  // Names bound by `import user/lib/1 as ta2` (or the library's last path segment
  // without `as`). Kept separate from declaredVariables because that set is
  // deliberately over-collected — every `name=` in a call looks like a declaration
  // to it, so `plot(close, color=color.red)` "declares" `color`. Import lines are
  // unambiguous, so this set is exact, and an alias may shadow a built-in namespace.
  private declaredImports = new Set<string>();

  // Names genuinely DECLARED by the script: statement-level assignments (with or
  // without a type, `var`/`varip`), tuple destructuring, function parameters and
  // loop variables. Unlike declaredVariables it never collects a named argument
  // inside a call, so `plot(close, color=color.purplee)` still checks `color`, while
  // `PositionInfo position = ...` then `position.entryPrice` is a variable, not the
  // built-in `position` namespace (review finding, 2026-09-24).
  private declaredLocals = new Set<string>();

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
    this.declaredImports.clear();
    this.declaredLocals.clear();

    // Pine v6 (April 2026) added multiline string literals delimited by `"""` or
    // `'''`. Their contents are text, not code, and they span lines — so they must
    // be neutralised before any per-line analysis, or every word inside a message
    // block gets parsed as an identifier and the unbalanced quotes desynchronise
    // single-line string stripping for the rest of the file.
    const lines = this.blankMultilineStrings(text).split('\n');
    // Cleaned per-line text (strings and comments blanked, positions preserved).
    // Bracket depth is tracked on THIS text, so a bracket inside a string or
    // comment never makes a complete statement look wrapped.
    const cleanedLines = lines.map(l => this.removeComments(this.removeStringLiterals(l)));
    // First pass: collect declarations per STATEMENT, not per physical line.
    // Pine allows wrapping anywhere inside () and [], so a statement whose
    // brackets are still open continues on the next lines (issue #42): a wrapped
    // method header still declares its name and parameters, and a wrapped tuple
    // still declares its names. Lines interior to a wrap are not statement
    // starts — a `name=` there is a named argument, not a declaration, so
    // `plot(\n close,\n color=color.purplee)` still checks the misspelled
    // constant instead of "declaring" color.
    let stmtStart = 0;
    while (stmtStart < lines.length) {
      const stmtEnd = this.wrappedStatementEnd(cleanedLines, stmtStart);
      this.collectDeclaredVariables(
        stmtEnd === stmtStart
          ? lines[stmtStart]
          : cleanedLines.slice(stmtStart, stmtEnd + 1).join(' '));
      stmtStart = stmtEnd + 1;
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
      // comment, not part of a URL inside a string. Computed once above for every line.
      const lineWithoutStrings = cleanedLines[i];

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
      // NOTE: the CLEANED line is passed, not the original. Candidate names were
      // already taken from the cleaned line, but validateFunctionCall re-scans
      // whatever it is given — so handing it the raw line meant a commented-out
      // call sharing a line with a real one got validated:
      //     x = ta.sma(close, 14)  // previously ta.sma(close, 14, 99)
      // reported "Too many arguments" against the comment. Blanking preserves
      // length, so reported columns still point at the right character.
      // `wrappedLines` is the whole statement (as cleaned physical lines) when
      // this line's brackets stay open (issue #42): a call whose parens close
      // on a later line is arity-checked against the joined text instead of
      // being skipped, and checks that inspect arguments see every argument.
      const stmtEnd = this.wrappedStatementEnd(cleanedLines, i);
      const wrappedLines = cleanedLines.slice(i, stmtEnd + 1);
      for (const funcName of this.extractCalledFunctionNames(lineWithoutStrings)) {
        const spec = (ALL_FUNCTION_SIGNATURES as any)[funcName];
        if (spec) {
          this.validateFunctionCall(lineWithoutStrings, lineNum, funcName, spec, wrappedLines);
        }
      }
    }

    return this.errors;
  }

  /**
   * Index of the last line of the statement starting at `start`. A statement
   * whose brackets are still open at end of line continues on the following
   * lines — Pine allows wrapping anywhere inside () and [] (issue #42). Depth
   * is tracked on the CLEANED lines, so a bracket inside a string or comment
   * never extends the statement. When brackets balance on the line itself its
   * own index comes back: nothing is joined across lines when brackets balance.
   *
   * Three bounds keep a syntax error from cascading (review finding f1 on #42):
   * with an opener that never closes (`bad = (`) the join used to run to EOF,
   * swallowing every declaration below the break — `type Config` was never
   * collected and `Config.new()` was flagged as undefined. The join now stops
   * at a blank line, at a line that opens a new top-level statement flush at
   * column 0 (a wrapped continuation is indented; a column-0 `type`/`import`/
   * `var`/header/assignment is a new statement, and stopping there only ever
   * skips the arity check — the safe direction), and after 50 lines.
   *
   * Depth is clamped at 0: a line that STARTS with closers (the `) + ta.sma(`
   * middle of a wrap, asked about as a statement start in the second pass)
   * must not drive depth negative and end the join before its own opener —
   * that skipped the arity check on the call it opens (review finding f4).
   *
   * A header may put `=>` on its own line after the closing paren (Pine allows
   * it), so when the brackets balance and the NEXT line begins with `=>`, that
   * line is part of the statement (review finding f2 on #42).
   */
  private wrappedStatementEnd(cleanedLines: string[], start: number): number {
    const MAX_WRAP_LINES = 50;
    let depth = 0;
    for (let end = start; end < cleanedLines.length; end++) {
      const cleaned = cleanedLines[end];
      if (end > start && depth > 0) {
        if (!cleaned.trim()) return end - 1;
        if (this.startsTopLevelStatement(cleaned)) return end - 1;
        if (end - start >= MAX_WRAP_LINES) return end;
      }
      for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (ch === '(' || ch === '[') depth++;
        else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
      }
      if (depth === 0) {
        if (end + 1 < cleanedLines.length && cleanedLines[end + 1].trimStart().startsWith('=>')) {
          return end + 1;
        }
        return end;
      }
    }
    // The brackets never close (broken code) and no bound bit: the statement
    // runs to EOF. The arity check still finds no closing paren on the joined
    // text and skips.
    return cleanedLines.length - 1;
  }

  /**
   * Does this CLEANED line open a new top-level statement? Only a line flush at
   * column 0 qualifies — a wrapped continuation is indented, so an indented
   * line is never a new statement. The patterns are constructs that cannot
   * appear inside a bracketed expression (type/enum/method/import/var, the
   * script declarations, control flow) plus a same-line function header and a
   * plain assignment. A named argument at column 0 inside a wrapped call can
   * match the assignment pattern; stopping the join there only skips the arity
   * check — a missed error, never a false positive.
   */
  private startsTopLevelStatement(line: string): boolean {
    if (line.length === 0 || line[0] === ' ' || line[0] === '\t') return false;
    return (
      /^(?:export\s+)?(?:type|enum|method|import|var|varip|for|if|while|switch)\b/.test(line) ||
      /^(?:indicator|strategy|library|plot\w*|hline|bgcolor|fill|alertcondition)\s*\(/.test(line) ||
      /^[A-Za-z_][\w.]*\s*\(.*\)\s*=>/.test(line) ||
      /^[A-Za-z_]\w*\s*:?=(?!=)/.test(line)
    );
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

  /**
   * Blank the CONTENTS of every string literal, keeping the delimiters and the
   * original length.
   *
   * Length matters: this previously collapsed each literal to a two-character `""`,
   * which shifted every subsequent column left by `length - 2`. Reported columns
   * are offsets into the document the user is looking at, so a long string earlier
   * on the line put the squiggle tens of characters away from the problem.
   */
  private removeStringLiterals(line: string): string {
    return line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, match =>
      match[0] + ' '.repeat(Math.max(0, match.length - 2)) + match[match.length - 1]
    );
  }

  /**
   * Blank a trailing `//` comment, preserving length.
   *
   * Must run AFTER string blanking, so a `//` inside a string literal is already
   * neutralised and cannot truncate the line early.
   */
  private removeComments(line: string): string {
    const at = line.indexOf('//');
    if (at === -1) return line;
    return line.slice(0, at) + ' '.repeat(line.length - at);
  }

  private collectDeclaredVariables(line: string): void {
    // Statement-level declaration: `x = 1`, `float x = 1`, `var Foo x = ...`,
    // `array<float> xs = ...`, `x := 2`. Anchored at the start of the statement,
    // so a named argument inside a call can never match.
    // A line can hold several statements: a one-line body or switch arm such as
    // `cond => Foo p = src, p.x`. Split at `=>` and at commas at bracket depth 0;
    // a comma inside a call never starts a segment, so named arguments still never
    // count as declarations (review finding, 2026-09-24).
    for (const segment of this.statementSegments(line)) {
      const stmtDecl = segment.match(/^\s*(?:var\s+|varip\s+)?(?:[A-Za-z_][\w.]*(?:<[^>]*>)?\s+)?([A-Za-z_]\w*)\s*:?=(?!=)/);
      if (stmtDecl && !this.isReservedKeyword(stmtDecl[1])) this.declaredLocals.add(stmtDecl[1]);
    }
    // Tuple destructuring: `[a, b] = f()`.
    const tupleDecl = line.match(/^\s*\[([^\]]+)\]\s*=(?!=)/);
    if (tupleDecl) {
      for (const n of tupleDecl[1].split(',').map(t => t.trim())) {
        if (/^[A-Za-z_]\w*$/.test(n) && !this.isReservedKeyword(n)) {
          this.declaredLocals.add(n);
          this.declaredVariables.add(n);
        }
      }
    }
    // Loop counters: `for i = 0 to 9`.
    const forDecl = line.match(/^\s*for\s+([A-Za-z_]\w*)\s*=/);
    if (forDecl) this.declaredLocals.add(forDecl[1]);

    // Library imports bind a namespace prefix: `import user/lib/1 as ta2` binds
    // `ta2`, and the same import without `as` binds the library's last path
    // segment (`lib`). Calls like `ta2.fn()` must never be "undefined namespace".
    const importDecl = line.match(/^\s*import\s+(?:[a-zA-Z_][a-zA-Z0-9_]*\/)*([a-zA-Z_][a-zA-Z0-9_]*)\/\d+(?:\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*))?/);
    if (importDecl) {
      this.declaredImports.add(importDecl[2] || importDecl[1]);
      this.declaredVariables.add(importDecl[2] || importDecl[1]);
    }

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
          this.declaredLocals.add(iterator);
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

    // Function and method definitions: `f(params) =>`. Both the NAME and every
    // PARAMETER are declared. Collecting only the name made `st.a` inside
    // `update(State st, float v) =>` report "Undefined namespace or variable 'st'"
    // (issue #16). Parameters land in the file-wide set, so a parameter name used
    // outside its function is not flagged: a missed error, the safe direction.
    const fnDef = line.match(/^\s*(?:export\s+)?(?:method\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)\s*=>/);
    if (fnDef) {
      this.declaredVariables.add(fnDef[1]);
      for (const param of this.splitParameterList(fnDef[2])) {
        // `int n = 3` -> `int n`; `array<float> xs` -> `xs`; `series float x` -> `x`
        const decl = param.split('=')[0].trim();
        const name = decl.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        if (name && !this.isReservedKeyword(name[1])) {
          this.declaredVariables.add(name[1]);
          this.declaredLocals.add(name[1]);
        }
      }
    }
  }

  /** Statement segments of one line: split at `=>` and at depth-0 commas. */
  private statementSegments(line: string): string[] {
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

  /**
   * Split a parameter list on top-level commas; `map<string, float> m` is ONE parameter.
   * A `<` opens a generic only after `array`, `matrix`, `map` or `new` (Pine's only generics);
   * a `>` closes one only while a generic is open. So `bool up = close > open` and
   * `int n = a < b ? 1 : 2` in a default cannot unbalance the split (review finding).
   */
  private splitParameterList(list: string): string[] {
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

  private checkUndefinedNamespaces(line: string, lineNum: number): void {
    // Match namespace.member patterns
    const namespacePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = namespacePattern.exec(line)) !== null) {
      const namespace = match[1];
      const member = match[2];
      const column = match.index;

      // UDT/enum types and import aliases shadow any built-in namespace and are
      // never flagged: `Foo.new()` is a constructor, `Side.long` an enum member,
      // `ta2.fn()` a library call. declaredVariables is NOT consulted here: that
      // set deliberately over-collects (every `name=` in a call registers `name`),
      // so consulting it would let `plot(close, color=color.purplee)` — the named
      // argument "color" — exempt the misspelled `color.purplee` it assigns.
      if (this.declaredTypes.has(namespace) || this.declaredImports.has(namespace) || this.declaredLocals.has(namespace)) {
        continue;
      }

      // Flag an unknown namespace (e.g., nosuchns.value). Issue #37: there used
      // to be a `/\w+\s*=\s*$/` skip here, meant for named arguments like
      // style=plot.style_line. It also skipped every PLAIN assignment
      // (`x = xloc.bar_indexx`, `z = nosuchns.value`), so misspellings after '='
      // never reached either check below. The member check is complete enough
      // (constants + functions + built-in variables) that valid named-argument
      // values pass it, so the blanket skip is gone. declaredVariables still
      // exempts this branch: method calls on user objects (`myArray.push(x)`)
      // and field access (`st.a`) are not namespace references.
      if (!this.knownNamespaces.has(namespace) &&
          !this.declaredVariables.has(namespace) &&
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
        // A call (`math.nonexistent(10)`) is checkUndefinedFunctions' job; reporting
        // it here too put two errors on one token.
        const isCall = /^\s*\(/.test(line.slice(match.index + match[0].length));
        const isValid = isCall || this.isValidConstantOrFunction(namespace, member);

        if (!isValid) {
          // Only CONSTANT_NAMESPACES have a complete, authoritative member list
          // (constants plus, for dual-use namespaces like color/plot/strategy, the
          // functions and variables folded into NAMESPACE_CONSTANTS and
          // isValidConstantOrFunction). Namespaces whose member list is partial
          // (ta.*, request.*, syminfo.*, ...) are never member-checked: when
          // unsure whether a member exists, do not flag it.
          // An unknown member of a constant namespace is a hard compile error in
          // Pine ("cannot find symbol"), so this is an Error, not a Warning.
          if (CONSTANT_NAMESPACES.has(namespace)) {
            this.addError(
              lineNum,
              column + namespace.length + 1,
              member.length,
              `Unknown ${namespace} constant or function '${member}'`,
              Severity.Error
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
      // The regex already anchors on '?', so `match[0]` always contains one — the
      // old `beforeMatch.includes('?') || match[0].includes('?')` was constant true
      // and expressed an intent it did not implement. What actually distinguishes a
      // ternary from an unrelated ';' is a '?' BEFORE this match on the same line.
      const hasQuestionMark = beforeMatch.includes('?');

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

      // Flag only when BOTH hold: the next line opens with a semicolon, and this
      // line is not already a complete single-line ternary. The comment previously
      // said "OR" while the code said "AND" — the code is right, because a
      // self-contained ternary followed by an unrelated line is not an error.
      // The error is reported against the NEXT line, where the stray semicolon is.
      if (nextLine.startsWith(';') && !hasSingleLineTernary) {
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

    // Any constant or variable the current v6 reference documents
    // (`session.ismarket`, `label.all`, `strategy.openprofit_percent`, ...). The
    // hand lists above date from 2025; without this, 22 documented names were
    // flagged as unknown when #37 turned the member check on after '='.
    if (REFERENCE_NAMES.has(fullName)) {
      return true;
    }

    // A sub-namespace: `strategy.commission.percent`, `chart.point.new`. The regex
    // above sees only the first two segments, so accept any documented name or
    // function that continues past `namespace.member.`.
    const prefix = `${fullName}.`;
    for (const name of REFERENCE_NAMES) if (name.startsWith(prefix)) return true;
    for (const name of Object.keys(ALL_FUNCTION_SIGNATURES)) if (name.startsWith(prefix)) return true;

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
        // A declared variable, type or import alias named like a built-in namespace
        // is the user's object: `map<string, float> position = ...; position.put(..)`
        // is a method call, not an undefined `position.*` function (pre-existing false
        // positive, fixed with #37).
        const ownName = namespaceMatch &&
          (this.declaredLocals.has(namespaceMatch[1]) || this.declaredTypes.has(namespaceMatch[1]) || this.declaredImports.has(namespaceMatch[1]));
        if (namespaceMatch && !ownName && this.knownNamespaces.has(namespaceMatch[1])) {
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
    spec: any,
    wrappedLines?: string[]
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

    // The statement's lines joined into one text (issue #42). The join starts
    // with this line verbatim, so an index into the physical line means the
    // same character in the joined text; the per-line lengths are kept so an
    // offset into the join can be mapped back to its physical line (finding
    // f5 on #42).
    const joined = wrappedLines && wrappedLines.length > 1 ? wrappedLines.join(' ') : undefined;

    let match;
    while ((match = regex.exec(line)) !== null) {
      const openParenIndex = match.index + match[0].length - 1;
      let argsString = this.extractBalancedArgs(line, openParenIndex);
      let argSource = line;
      if (argsString === null && joined) {
        // The call's parens do not close on this line (issue #42): retry against
        // the whole wrapped statement.
        const fromJoined = this.extractBalancedArgs(joined, openParenIndex);
        if (fromJoined !== null) {
          argsString = fromJoined;
          argSource = joined;
        }
      }
      // null = the call's parens never close even across the wrapped statement —
      // skip count validation here to avoid false positives.
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
          // Report a bad argument on ITS physical line and column, not on the
          // call's first line (review finding f5 on #42). Arguments are
          // located in the text they were extracted from; an offset into the
          // joined statement maps back through the per-line lengths.
          let searchFrom = openParenIndex + 1;
          for (const arg of args) {
            const at = argSource.indexOf(arg, searchFrom);
            if (at !== -1) searchFrom = at + arg.length;
            const nm = arg.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)/);
            if (nm && !validNames.has(nm[1])) {
              const pos = at === -1
                ? { line: lineNum, column }
                : this.wrappedOffsetToPosition(
                    argSource === joined ? (wrappedLines as string[]) : [line],
                    at,
                    lineNum
                  );
              this.addError(
                pos.line,
                pos.column,
                nm[1].length,
                `No parameter named '${nm[1]}' in '${functionName}'`,
                Severity.Error
              );
            }
          }
        }
      }

      // Special validations. These inspect the call's ARGUMENTS, so they must
      // see the joined statement, not just the physical line the call starts
      // on: `indicator("Wrapped", timeframe_gaps=true,\n timeframe="D")` warned
      // that timeframe_gaps had no effect because "timeframe=" sat on the next
      // line (review finding f3 on #42). Columns are still resolved against
      // the physical line, falling back to the call's column when the needle
      // is on a continuation line.
      this.validateSpecialCases(line, lineNum, column, functionName, args, joined);
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

  /**
   * Map an offset into `segments.join(' ')` back to its physical line and
   * column. `segments[0]` is the statement's first line (1-based number
   * `startLineNum`); each later segment follows one inserted space.
   */
  private wrappedOffsetToPosition(
    segments: string[],
    offset: number,
    startLineNum: number
  ): { line: number; column: number } {
    let rest = offset;
    for (let k = 0; k < segments.length; k++) {
      if (rest <= segments[k].length) return { line: startLineNum + k, column: rest };
      rest -= segments[k].length + 1;
    }
    return { line: startLineNum, column: offset };
  }

  private validateSpecialCases(
    line: string,
    lineNum: number,
    column: number,
    functionName: string,
    args: string[],
    statement?: string
  ): void {
    // `statement` is the joined wrapped statement (or undefined when the call
    // fits on one line); presence checks run against it so an argument on a
    // continuation line still counts. Columns come from the physical line and
    // fall back to the call's column when the needle wrapped.
    const text = statement ?? line;

    // plotshape: check for "shape=" parameter (should be "style=")
    if (functionName === 'plotshape' && text.includes('shape=')) {
      const shapeIndex = line.indexOf('shape=');
      this.addError(
        lineNum,
        shapeIndex === -1 ? column : shapeIndex,
        6,
        'Invalid parameter "shape" for plotshape(). Did you mean "style"?',
        Severity.Error
      );
    }

    // plotchar: check for "shape=" parameter (should be "char=")
    if (functionName === 'plotchar' && text.includes('shape=')) {
      const shapeIndex = line.indexOf('shape=');
      this.addError(
        lineNum,
        shapeIndex === -1 ? column : shapeIndex,
        6,
        'Invalid parameter "shape" for plotchar(). Did you mean "char"?',
        Severity.Error
      );
    }

    // indicator/strategy: timeframe_gaps without timeframe
    if ((functionName === 'indicator' || functionName === 'strategy') &&
        text.includes('timeframe_gaps') && !text.includes('timeframe=')) {
      const index = line.indexOf('timeframe_gaps');
      this.addError(
        lineNum,
        index === -1 ? column : index,
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
