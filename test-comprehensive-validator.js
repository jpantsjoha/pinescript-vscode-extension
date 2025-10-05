// Quick test of ComprehensiveValidator
const fs = require('fs');
const { Parser } = require('./dist/src/parser/parser.js');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator.js');

const code = `
//@version=6
indicator("Test")

plot(ssss.adas, 33)
`;

try {
  const parser = new Parser(code);
  const ast = parser.parse();
  console.log('AST parsed successfully');
  console.log('AST body length:', ast.body.length);

  const validator = new ComprehensiveValidator();
  const errors = validator.validate(ast);

  console.log(`\nFound ${errors.length} validation errors:`);
  errors.forEach(err => {
    console.log(`  Line ${err.line}, Col ${err.column}: ${err.message}`);
  });
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}
