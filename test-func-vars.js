const { Parser } = require('./dist/src/parser/parser.js');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator.js');
const code = `//@version=6
indicator('Test')
f_norm(x, n) => x * 2
nUSM2 = f_norm(10, 5)
plot(nUSM2)
`;
const parser = new Parser(code);
const ast = parser.parse();
console.log('Statements:', ast.body.length);
ast.body.forEach(stmt => {
  console.log('  -', stmt.type, stmt.name || '');
});

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);
console.log('\nTotal errors:', errors.length);
const realErrors = errors.filter(e => e.severity === 0 && !e.message.includes('never used'));
console.log('Critical errors:', realErrors.length);
realErrors.forEach(e => {
  console.log('  -', e.message);
});
