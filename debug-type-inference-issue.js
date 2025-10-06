const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

const testCode = `
f_days_to_bars(days) =>
    secPerBar = timeframe.in_seconds(timeframe.period)
    secPerBar <= 0 ? 0 : math.max(0, math.round(days * 86400.0 / secPerBar))
`;

console.log('=== Testing type inference for ternary with variable ===\n');

const parser = new Parser(testCode);
const ast = parser.parse();

console.log('Function AST:');
const func = ast.body[0];
console.log('Function name:', func.name);
console.log('Function body length:', func.body.length);
console.log('\nBody statement types:');
func.body.forEach((stmt, i) => {
  console.log(`  ${i}: ${stmt.type}`);
  if (stmt.type === 'VariableDeclaration') {
    console.log(`     Variable: ${stmt.name}`);
  }
});

console.log('\n=== Running validator ===\n');

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

console.log(`Total errors: ${errors.length}`);
errors.forEach(err => {
  console.log(`  Line ${err.line}: ${err.message}`);
});
