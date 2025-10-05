// Pine Script v6 Lexer/Tokenizer
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOL = 'BOOL',
  COLOR = 'COLOR',

  // Identifiers and Keywords
  IDENTIFIER = 'IDENTIFIER',
  KEYWORD = 'KEYWORD',

  // Operators
  ASSIGN = 'ASSIGN',           // =, :=
  PLUS = 'PLUS',               // +
  MINUS = 'MINUS',             // -
  MULTIPLY = 'MULTIPLY',       // *
  DIVIDE = 'DIVIDE',           // /
  MODULO = 'MODULO',           // %
  COMPARE = 'COMPARE',         // ==, !=, <, >, <=, >=
  LOGICAL = 'LOGICAL',         // and, or, not
  TERNARY = 'TERNARY',         // ?

  // Delimiters
  LPAREN = 'LPAREN',           // (
  RPAREN = 'RPAREN',           // )
  LBRACKET = 'LBRACKET',       // [
  RBRACKET = 'RBRACKET',       // ]
  COMMA = 'COMMA',             // ,
  DOT = 'DOT',                 // .
  COLON = 'COLON',             // :
  ARROW = 'ARROW',             // =>

  // Special
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT',
  ANNOTATION = 'ANNOTATION',   // //@version=6
  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  length: number;
}

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'break', 'continue', 'return',
  'var', 'varip', 'const',
  'true', 'false', 'na',
  'export', 'import', 'as',
  'switch', 'case', 'default',
  'and', 'or', 'not',
  'int', 'float', 'bool', 'string', 'color', 'line', 'label',
  'box', 'table', 'array', 'matrix', 'map',
  'series', 'simple', 'input',
]);

const BUILTIN_FUNCTIONS = new Set([
  'indicator', 'strategy', 'library',
  'plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar',
  'hline', 'bgcolor', 'barcolor', 'fill',
  'label', 'line', 'box', 'table',
  'alert', 'alertcondition',
]);

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      this.scanToken();
    }
    this.addToken(TokenType.EOF, '', 0);
    return this.tokens;
  }

  private scanToken(): void {
    const start = this.pos;
    const startColumn = this.column;
    const char = this.advance();

    switch (char) {
      case ' ':
      case '\t':
      case '\r':
        // Skip whitespace
        break;

      case '\n':
        this.addToken(TokenType.NEWLINE, '\n', 1);
        this.line++;
        this.column = 1;
        break;

      case '(':
        this.addToken(TokenType.LPAREN, '(', 1);
        break;
      case ')':
        this.addToken(TokenType.RPAREN, ')', 1);
        break;
      case '[':
        this.addToken(TokenType.LBRACKET, '[', 1);
        break;
      case ']':
        this.addToken(TokenType.RBRACKET, ']', 1);
        break;
      case ',':
        this.addToken(TokenType.COMMA, ',', 1);
        break;
      case '.':
        this.addToken(TokenType.DOT, '.', 1);
        break;
      case '?':
        this.addToken(TokenType.TERNARY, '?', 1);
        break;

      case '+':
        this.addToken(TokenType.PLUS, '+', 1);
        break;
      case '-':
        this.addToken(TokenType.MINUS, '-', 1);
        break;
      case '*':
        this.addToken(TokenType.MULTIPLY, '*', 1);
        break;
      case '%':
        this.addToken(TokenType.MODULO, '%', 1);
        break;

      case '/':
        if (this.peek() === '/') {
          this.scanComment();
        } else if (this.peek() === '*') {
          this.scanBlockComment();
        } else {
          this.addToken(TokenType.DIVIDE, '/', 1);
        }
        break;

      case ':':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.ASSIGN, ':=', 2);
        } else {
          this.addToken(TokenType.COLON, ':', 1);
        }
        break;

      case '=':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.COMPARE, '==', 2);
        } else if (this.peek() === '>') {
          this.advance();
          this.addToken(TokenType.ARROW, '=>', 2);
        } else {
          this.addToken(TokenType.ASSIGN, '=', 1);
        }
        break;

      case '!':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.COMPARE, '!=', 2);
        }
        break;

      case '<':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.COMPARE, '<=', 2);
        } else {
          this.addToken(TokenType.COMPARE, '<', 1);
        }
        break;

      case '>':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.COMPARE, '>=', 2);
        } else {
          this.addToken(TokenType.COMPARE, '>', 1);
        }
        break;

      case '"':
      case "'":
        this.scanString(char);
        break;

      default:
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char)) {
          this.scanIdentifier();
        }
        break;
    }
  }

  private scanComment(): void {
    const start = this.pos - 1;
    const startColumn = this.column - 1;

    // Check for annotation (//@version=6)
    if (this.peek() === '@') {
      while (this.peek() !== '\n' && !this.isAtEnd()) {
        this.advance();
      }
      const value = this.source.substring(start, this.pos);
      this.addToken(TokenType.ANNOTATION, value, value.length);
      return;
    }

    // Regular comment
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.advance();
    }
    const value = this.source.substring(start, this.pos);
    this.addToken(TokenType.COMMENT, value, value.length);
  }

  private scanBlockComment(): void {
    const start = this.pos - 1;
    this.advance(); // consume *

    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance(); // *
        this.advance(); // /
        break;
      }
      if (this.peek() === '\n') {
        this.line++;
        this.column = 0;
      }
      this.advance();
    }

    const value = this.source.substring(start, this.pos);
    this.addToken(TokenType.COMMENT, value, value.length);
  }

  private scanString(quote: string): void {
    const start = this.pos - 1;

    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\\') {
        this.advance(); // Skip escape char
        this.advance(); // Skip next char
      } else {
        if (this.peek() === '\n') {
          this.line++;
          this.column = 0;
        }
        this.advance();
      }
    }

    if (!this.isAtEnd()) {
      this.advance(); // Closing quote
    }

    const value = this.source.substring(start, this.pos);
    this.addToken(TokenType.STRING, value, value.length);
  }

  private scanNumber(): void {
    const start = this.pos - 1;

    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // .
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    // Scientific notation
    if (this.peek() === 'e' || this.peek() === 'E') {
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = this.source.substring(start, this.pos);
    this.addToken(TokenType.NUMBER, value, value.length);
  }

  private scanIdentifier(): void {
    const start = this.pos - 1;

    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      this.advance();
    }

    const value = this.source.substring(start, this.pos);

    // Check for keywords
    if (KEYWORDS.has(value)) {
      this.addToken(TokenType.KEYWORD, value, value.length);
    } else if (value === 'true' || value === 'false') {
      this.addToken(TokenType.BOOL, value, value.length);
    } else if (value === 'na') {
      this.addToken(TokenType.KEYWORD, value, value.length);
    } else {
      this.addToken(TokenType.IDENTIFIER, value, value.length);
    }
  }

  private advance(): string {
    const char = this.source.charAt(this.pos);
    this.pos++;
    this.column++;
    return char;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.pos);
  }

  private peekNext(): string {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.pos + 1);
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private addToken(type: TokenType, value: string, length: number): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - length,
      length,
    });
  }
}
