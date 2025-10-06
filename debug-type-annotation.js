const { Lexer } = require('./dist/src/parser/lexer');
const { Parser } = require('./dist/src/parser/parser');

const testCode = `int prevRealCandleOffset = 1
bool prevIsBull = close > open
var float bullLvl = na`;

console.log('=== Testing type annotations ===\n');

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('Tokens:');
tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.type.padEnd(15)} "${token.value}" (line ${token.line})`);
});

console.log('\n=== AST ===\n');
const parser = new Parser(testCode);
try {
  const ast = parser.parse();
  console.log('AST body length:', ast.body.length);
  ast.body.forEach((stmt, i) => {
    console.log(`\nStatement ${i}:`, JSON.stringify(stmt, null, 2));
  });
} catch (e) {
  console.error('Parse error:', e.message);
  console.error(e.stack);
}
