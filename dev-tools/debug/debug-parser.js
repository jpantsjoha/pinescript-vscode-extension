const { Parser } = require('./dist/src/parser/parser.js');
const fs = require('fs');

const code = fs.readFileSync('./examples/global-liquidity.v6.pine', 'utf-8');
const parser = new Parser(code);
const ast = parser.parse();

console.log('Total statements:', ast.body.length);
console.log('\n=== First 30 statements ===');
ast.body.slice(0, 30).forEach((stmt, i) => {
  if (stmt.type === 'VariableDeclaration') {
    console.log((i+1) + '. VariableDeclaration:', stmt.name, 'varType:', stmt.varType);
  } else if (stmt.type === 'ExpressionStatement') {
    console.log((i+1) + '. ExpressionStatement');
  } else {
    console.log((i+1) + '. ' + stmt.type);
  }
});
