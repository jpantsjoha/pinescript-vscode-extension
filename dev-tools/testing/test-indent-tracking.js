const { Lexer } = require('./dist/src/parser/lexer.js');

const code = `f_norm(x, n) =>
    ma = ta.sma(x, n)
    result = x / ma
    result`;

console.log('Testing indentation tracking:\n');
console.log('Source code:');
console.log(code);
console.log('\nTokens with indentation:');

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

tokens.forEach((token, i) => {
  if (token.type !== 'NEWLINE' && token.type !== 'WHITESPACE' && token.type !== 'EOF') {
    const indent = token.indent !== undefined ? token.indent : 0;
    const prefix = '  '.repeat(Math.floor(indent / 2));
    console.log(`${prefix}[${i}] ${token.type.padEnd(15)} "${token.value}" (indent: ${indent}, line: ${token.line})`);
  }
});
