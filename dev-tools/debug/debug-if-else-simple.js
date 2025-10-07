const { Lexer } = require('./dist/src/parser/lexer');
const { Parser } = require('./dist/src/parser/parser');

const testCode = `if newSessStart
    cumPV := close * volume
    cumV  := volume
else
    cumPV := nz(cumPV) + close * volume
    cumV  := nz(cumV)  + volume`;

console.log('=== Parsing if/else statement ===\n');

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('Total tokens:', tokens.length);
console.log('\nTokens:');
tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.type.padEnd(15)} "${token.value.replace(/\n/g, '\\n')}" (line ${token.line}, col ${token.column})`);
});

console.log('\n=== AST ===\n');
const parser = new Parser(testCode);  // Parser expects source string, not tokens
try {
  const ast = parser.parse();
  console.log('AST body length:', ast.body.length);
  console.log('\nFirst statement:');
  console.log(JSON.stringify(ast.body[0], null, 2));
  if (ast.body.length > 1) {
    console.log('\nSecond statement:');
    console.log(JSON.stringify(ast.body[1], null, 2));
  }
} catch (e) {
  console.error('Parse error:', e.message);
  console.error(e.stack);
}
