const { Parser } = require('./dist/src/parser/parser');

const code = `//@version=6
indicator("Test")
x = 5
y = x + 10
`;

console.log('=== Parsing simple variable declarations ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Total statements: ${ast.body.length}\n`);

ast.body.forEach((stmt, i) => {
  console.log(`Statement ${i}: ${stmt.type}`);
  if (stmt.type === 'ExpressionStatement') {
    console.log(`  Expression: ${stmt.expression.type}`);
    if (stmt.expression.type === 'AssignmentExpression') {
      console.log(`    Left: ${stmt.expression.left.name}`);
      console.log(`    Operator: ${stmt.expression.operator}`);
      console.log(`    Right: ${stmt.expression.right.type}`);
    } else if (stmt.expression.type === 'CallExpression') {
      console.log(`    Callee: ${stmt.expression.callee.name}`);
    }
  } else if (stmt.type === 'VariableDeclaration') {
    console.log(`  Variable: ${stmt.name}`);
    console.log(`  VarType: ${stmt.varType}`);
  }
  console.log('');
});
