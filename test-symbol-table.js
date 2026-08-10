const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

const code = `//@version=6
indicator("Test")

highPrice = close
doji4price = open == close

if doji4price
    plot(highPrice)
`;

console.log('=== Testing symbol table ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Statements: ${ast.body.length}\n`);
ast.body.forEach((stmt, i) => {
  console.log(`  ${i}: ${stmt.type} ${stmt.name || ''}`);
});

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

console.log(`\nTotal errors: ${errors.length}\n`);
errors.forEach(err => {
  console.log(`Line ${err.line}: ${err.message}`);
});
