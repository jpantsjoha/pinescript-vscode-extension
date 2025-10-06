const { Parser } = require('./dist/src/parser/parser.js');

const testCode = `
//@version=6
indicator("Test")

f_mSeries(sym) =>
    sym == "" ? na : request.security(sym, "M", close)

sUSM2 = f_mSeries("FRED:M2SL")
`;

console.log('Parsing test code...');
try {
  const parser = new Parser(testCode);
  const ast = parser.parse();
  console.log('Statements:', ast.body.length);
  ast.body.forEach((stmt, i) => {
    console.log((i+1) + '.', stmt.type, stmt.type === 'VariableDeclaration' ? '- ' + stmt.name : '');
  });
} catch (e) {
  console.error('Parse error:', e.message);
}
