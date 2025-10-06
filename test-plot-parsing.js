const { Parser } = require('./dist/src/parser/parser');
const fs = require('fs');

const code = fs.readFileSync('test-plot-parsing.pine', 'utf8');

console.log('=== Testing Plot Statement Parsing ===\n');
console.log(code);
console.log('\n=== Parsing ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Total statements parsed: ${ast.body.length}\n`);

ast.body.forEach((stmt, i) => {
  console.log(`${i}: Line ${stmt.line} - ${stmt.type} ${stmt.name || ''}`);
});

// Check if all variable declarations were parsed
const expectedVars = ['x', 'y', 'z', 'w'];
const foundVars = ast.body
  .filter(s => s.type === 'VariableDeclaration')
  .map(s => s.name);

console.log(`\n\nExpected variables: ${expectedVars.join(', ')}`);
console.log(`Found variables: ${foundVars.join(', ')}`);

const missing = expectedVars.filter(v => !foundVars.includes(v));
if (missing.length > 0) {
  console.log(`\n❌ Missing variables: ${missing.join(', ')}`);
  console.log('BUG: Parser skips statements after plot() calls!');
} else {
  console.log(`\n✓ All variables found`);
}
