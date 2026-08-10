#!/usr/bin/env node

const { Lexer } = require('./dist/src/parser/lexer');
const { Parser } = require('./dist/src/parser/parser');

const code = `
f_norm(x, n) =>
    ma = ta.sma(x, n)
    na(ma) ? na : (x / ma) * 100.0
`;

console.log('Testing multi-line function parsing...\n');
console.log('Code:');
console.log(code);
console.log('\n--- LEXER OUTPUT ---\n');

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

// Show tokens with indentation
tokens.forEach((token, i) => {
  const indent = token.indent !== undefined ? `[indent:${token.indent}]` : '';
  console.log(`${i}: ${token.type.padEnd(15)} "${token.value}" line:${token.line} ${indent}`);
});

console.log('\n--- PARSER OUTPUT ---\n');

const parser = new Parser(tokens);
const ast = parser.parse();

console.log('AST:', JSON.stringify(ast, null, 2));

// Check function body
if (ast.body.length > 0 && ast.body[0].type === 'FunctionDeclaration') {
  const func = ast.body[0];
  console.log('\n--- FUNCTION ANALYSIS ---');
  console.log(`Function name: ${func.name}`);
  console.log(`Parameters: ${func.params.map(p => p.name).join(', ')}`);
  console.log(`Body statements: ${func.body.length}`);
  func.body.forEach((stmt, i) => {
    console.log(`  ${i}: ${stmt.type}`);
  });

  if (func.body.length < 2) {
    console.log('\n⚠️  WARNING: Expected 2 statements (variable + ternary), got', func.body.length);
    console.log('This indicates multi-line parsing is NOT working correctly!');
  } else {
    console.log('\n✅ Multi-line parsing appears to be working!');
  }
} else {
  console.log('\n❌ ERROR: No function declaration found in AST!');
}
