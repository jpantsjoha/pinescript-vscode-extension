// Simple Pine Script Parser (focused on function call validation)
import { Token, TokenType, Lexer } from './lexer';
import * as AST from './ast';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

  constructor(source: string) {
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize().filter(t =>
      t.type !== TokenType.WHITESPACE &&
      t.type !== TokenType.COMMENT &&
      t.type !== TokenType.NEWLINE
    );
  }

  parse(): AST.Program {
    const body: AST.Statement[] = [];

    while (!this.isAtEnd()) {
      try {
        const stmt = this.statement();
        if (stmt) body.push(stmt);
      } catch (e) {
        // Skip to next statement on error
        this.synchronize();
      }
    }

    return {
      type: 'Program',
      body,
      line: 1,
      column: 1,
    };
  }

  private statement(): AST.Statement | null {
    // Skip annotations
    if (this.check(TokenType.ANNOTATION)) {
      this.advance();
      return null;
    }

    // Variable declaration: var/varip/const name = expr  or  name = expr
    if (this.match([TokenType.KEYWORD, ['var', 'varip', 'const']])) {
      return this.variableDeclaration(this.previous().value as any);
    }

    // Check if it's an identifier followed by = (variable declaration without var)
    if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.ASSIGN) {
      return this.variableDeclaration(null);
    }

    // Expression statement (function calls, etc.)
    return this.expressionStatement();
  }

  private variableDeclaration(varType: 'var' | 'varip' | 'const' | null): AST.VariableDeclaration {
    const token = this.consume(TokenType.IDENTIFIER, 'Expected variable name');

    let init: AST.Expression | null = null;
    if (this.match(TokenType.ASSIGN)) {
      init = this.expression();
    }

    return {
      type: 'VariableDeclaration',
      name: token.value,
      varType,
      init,
      line: token.line,
      column: token.column,
    };
  }

  private expressionStatement(): AST.ExpressionStatement {
    const expr = this.expression();
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line,
      column: expr.column,
    };
  }

  private expression(): AST.Expression {
    return this.ternary();
  }

  private ternary(): AST.Expression {
    let expr = this.logicalOr();

    if (this.match(TokenType.TERNARY)) {
      const consequent = this.expression();
      this.consume(TokenType.COLON, 'Expected ":" in ternary expression');
      const alternate = this.expression();

      return {
        type: 'TernaryExpression',
        condition: expr,
        consequent,
        alternate,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private logicalOr(): AST.Expression {
    let expr = this.logicalAnd();

    while (this.match([TokenType.KEYWORD, ['or']])) {
      const operator = this.previous().value;
      const right = this.logicalAnd();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private logicalAnd(): AST.Expression {
    let expr = this.comparison();

    while (this.match([TokenType.KEYWORD, ['and']])) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private comparison(): AST.Expression {
    let expr = this.addition();

    while (this.match(TokenType.COMPARE)) {
      const operator = this.previous().value;
      const right = this.addition();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private addition(): AST.Expression {
    let expr = this.multiplication();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.multiplication();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private multiplication(): AST.Expression {
    let expr = this.unary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value;
      const right = this.unary();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
      };
    }

    return expr;
  }

  private unary(): AST.Expression {
    if (this.match(TokenType.MINUS) || this.match([TokenType.KEYWORD, ['not']])) {
      const operator = this.previous().value;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator,
        argument: right,
        line: this.previous().line,
        column: this.previous().column,
      };
    }

    return this.postfix();
  }

  private postfix(): AST.Expression {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        // Function call
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        // Member access
        const property = this.consume(TokenType.IDENTIFIER, 'Expected property name');
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: { type: 'Identifier', name: property.value, line: property.line, column: property.column },
          line: expr.line,
          column: expr.column,
        };
      } else if (this.match(TokenType.LBRACKET)) {
        // Array/index access
        const index = this.expression();
        this.consume(TokenType.RBRACKET, 'Expected "]"');
        expr = {
          type: 'IndexExpression',
          object: expr,
          index,
          line: expr.line,
          column: expr.column,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: AST.Expression): AST.CallExpression {
    const args: AST.CallArgument[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        // Check for named argument: name = value
        if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.ASSIGN) {
          const name = this.advance().value;
          this.advance(); // consume =
          const value = this.expression();
          args.push({ name, value });
        } else {
          // Positional argument
          const value = this.expression();
          args.push({ value });
        }
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, 'Expected ")" after arguments');

    return {
      type: 'CallExpression',
      callee,
      arguments: args,
      line: callee.line,
      column: callee.column,
    };
  }

  private primary(): AST.Expression {
    // Literals
    if (this.match(TokenType.NUMBER)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: parseFloat(token.value),
        raw: token.value,
        line: token.line,
        column: token.column,
      };
    }

    if (this.match(TokenType.STRING)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: token.value,
        raw: token.value,
        line: token.line,
        column: token.column,
      };
    }

    if (this.match(TokenType.BOOL)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: token.value === 'true',
        raw: token.value,
        line: token.line,
        column: token.column,
      };
    }

    if (this.match([TokenType.KEYWORD, ['na']])) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: 'na',
        raw: 'na',
        line: token.line,
        column: token.column,
      };
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER) || this.match(TokenType.KEYWORD)) {
      const token = this.previous();
      return {
        type: 'Identifier',
        name: token.value,
        line: token.line,
        column: token.column,
      };
    }

    // Grouping
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ")" after expression');
      return expr;
    }

    // Array literal
    if (this.match(TokenType.LBRACKET)) {
      const elements: AST.Expression[] = [];
      if (!this.check(TokenType.RBRACKET)) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      const closeBracket = this.consume(TokenType.RBRACKET, 'Expected "]"');
      return {
        type: 'ArrayExpression',
        elements,
        line: closeBracket.line,
        column: closeBracket.column,
      };
    }

    throw new Error(`Unexpected token: ${this.peek().value}`);
  }

  // Utility methods
  private match(...types: (TokenType | [TokenType, string[]])[]): boolean {
    for (const type of types) {
      if (Array.isArray(type)) {
        const [tokenType, values] = type;
        if (this.check(tokenType) && values.includes(this.peek().value)) {
          this.advance();
          return true;
        }
      } else {
        if (this.check(type)) {
          this.advance();
          return true;
        }
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token | null {
    if (this.current + 1 >= this.tokens.length) return null;
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at line ${this.peek().line}`);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      // Look for statement boundaries
      if (this.previous().type === TokenType.NEWLINE) return;

      switch (this.peek().type) {
        case TokenType.KEYWORD:
          if (['if', 'for', 'while', 'var', 'varip', 'const'].includes(this.peek().value)) {
            return;
          }
          break;
      }

      this.advance();
    }
  }
}
