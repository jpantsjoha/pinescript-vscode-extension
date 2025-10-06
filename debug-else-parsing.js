const { Lexer } = require('./dist/src/parser/lexer');
const { Parser } = require('./dist/src/parser/parser');

const testCode = `
if newSessStart
    cumPV := close * volume
    cumV  := volume
else
    cumPV := nz(cumPV) + close * volume
    cumV  := nz(cumV)  + volume
`;

console.log('=== Testing else block parsing ===\n');

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('Tokens around else:');
tokens.forEach((token, i) => {
  if (i >= 10 && i <= 25) {
    console.log(`  ${i}: ${token.type.padEnd(15)} "${token.value}" (line ${token.line}, indent: ${token.indent})`);
  }
});

console.log('\n=== Parsing AST ===\n');

const parser = new Parser(tokens);
const ast = parser.parse();

console.log('AST for if statement:');
const ifStmt = ast.body[0];
console.log(JSON.stringify(ifStmt, null, 2));
