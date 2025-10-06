const { Parser } = require('./dist/src/parser/parser.js');

const code = `//@version=6
indicator("Test")

f_norm(x, n) =>
    ma = ta.sma(x, n)
    na(ma) ? na : (x / ma) * 100.0

result = f_norm(close, 14)
plot(result)`;

console.log('Testing multi-line function parsing:\n');
console.log('Source code:');
console.log(code);
console.log('\n='.repeat(60));

const parser = new Parser(code);
const ast = parser.parse();

console.log('\nParsed statements:', ast.body.length);
ast.body.forEach((stmt, i) => {
  console.log(`\n[${i}] ${stmt.type}`);
  if (stmt.type === 'FunctionDeclaration') {
    console.log(`  Name: ${stmt.name}`);
    console.log(`  Params: ${stmt.params.map(p => p.name).join(', ')}`);
    console.log(`  Body statements: ${stmt.body.length}`);
    stmt.body.forEach((bodyStmt, j) => {
      console.log(`    [${j}] ${bodyStmt.type}`);
      if (bodyStmt.type === 'VariableDeclaration') {
        console.log(`        Variable: ${bodyStmt.name}`);
      }
    });
  } else if (stmt.type === 'VariableDeclaration') {
    console.log(`  Variable: ${stmt.name}`);
  } else if (stmt.type === 'ExpressionStatement') {
    console.log(`  Expression: ${stmt.expression.type}`);
  }
});
