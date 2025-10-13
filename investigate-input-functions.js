const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

// Test case: input functions should declare variables
const code = `//@version=6
indicator("Test")

// These should declare variables
showindis = input.string(defval = 'test', title = 'Show Indicator')
prd = input.int(defval = 5, title = 'Period')
dontconfirm = input(defval = false, title = 'Don\\'t Confirm')

// Use them
if prd > 0 and showindis == 'test'
    plot(close)
`;

console.log('=== Testing input function variable declarations ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Statements parsed: ${ast.body.length}\n`);

// Show each statement
ast.body.forEach((stmt, i) => {
  console.log(`Statement ${i}: ${stmt.type}`);
  if (stmt.type === 'VariableDeclaration') {
    console.log(`  Variable: ${stmt.name}`);
    console.log(`  Init type: ${stmt.init ? stmt.init.type : 'none'}`);
    if (stmt.init && stmt.init.type === 'CallExpression') {
      const callee = stmt.init.callee;
      if (callee.type === 'MemberExpression') {
        console.log(`  Callee: ${callee.object.name}.${callee.property.name}`);
      } else if (callee.type === 'Identifier') {
        console.log(`  Callee: ${callee.name}`);
      }
    }
  }
  console.log('');
});

console.log('=== Running validator ===\n');

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

const criticalErrors = errors.filter(e => e.severity === 0);
console.log(`Critical errors: ${criticalErrors.length}\n`);

criticalErrors.forEach(err => {
  console.log(`Line ${err.line}: ${err.message}`);
});

if (criticalErrors.length === 0) {
  console.log('✓ All variables recognized correctly!');
}
