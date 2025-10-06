const { Parser } = require('./dist/src/parser/parser.js');
const fs = require('fs');

const code = fs.readFileSync('./examples/global-liquidity.v6.pine', 'utf-8');
const lines = code.split('\n');
console.log('Line 18:', lines[17]);
console.log('Line 19:', lines[18]);
console.log('Line 20:', lines[19]);
console.log('Line 21:', lines[20]);
console.log('Line 22:', lines[21]);

const parser = new Parser(code);
const ast = parser.parse();

console.log('\n=== Variable Declarations ===');
ast.body.forEach((stmt, i) => {
  if (stmt.type === 'VariableDeclaration') {
    console.log('Line ' + stmt.line + ':', stmt.name);
  }
});
