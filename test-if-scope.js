const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

// Test: variable declared at top level, used in if statement
const code = `//@version=6
indicator("Test")

showindis = input.string(defval = 'Full', title = 'Show Names')

if barstate.isfirst
    x = showindis == 'Full' ? 'MACD' : 'M'
    plot(close)
`;

console.log('=== Testing if scope with input variable ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Statements: ${ast.body.length}\n`);

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

const criticalErrors = errors.filter(e => e.severity === 0);
console.log(`Critical errors: ${criticalErrors.length}\n`);

criticalErrors.forEach(err => {
  console.log(`Line ${err.line}: ${err.message}`);
});

if (criticalErrors.length > 0 && criticalErrors.some(e => e.message.includes('showindis'))) {
  console.log('\n❌ FOUND THE BUG: showindis not accessible in if scope!');
} else {
  console.log('\n✓ showindis correctly accessible in if scope');
}
