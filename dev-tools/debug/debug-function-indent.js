const { Lexer } = require('./dist/src/parser/lexer.js');

const code = `f_norm(x, n) =>
    ma = ta.sma(x, n)
    na(ma) ? na : x`;

const lexer = new Lexer(code);
const tokens = lexer.tokenize().filter(t => t.type !== 'NEWLINE' && t.type !== 'WHITESPACE');

console.log('Tokens with indentation for function:');
tokens.forEach((t, i) => {
  const indent = t.indent !== undefined ? t.indent : 0;
  console.log(`[${i}] ${t.type.padEnd(15)} '${t.value}' (indent: ${indent}, line: ${t.line})`);
});

// Now parse it
const { Parser } = require('./dist/src/parser/parser.js');
const parser = new Parser(code);
const ast = parser.parse();

console.log('\nFunction body:');
const func = ast.body.find(s => s.type === 'FunctionDeclaration');
if (func) {
  console.log(`  Statements in body: ${func.body.length}`);
  func.body.forEach((stmt, i) => {
    console.log(`  [${i}] ${stmt.type}`);
  });
}
