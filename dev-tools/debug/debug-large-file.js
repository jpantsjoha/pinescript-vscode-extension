const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');
const fs = require('fs');

// Test with tun-satiroglu.pine to understand why variables aren't found
const code = fs.readFileSync('examples/demo/tun-satiroglu.pine', 'utf8');

console.log('=== Debugging Large File Variable Recognition ===\n');
console.log(`File: tun-satiroglu.pine`);
console.log(`Size: ${code.split('\n').length} lines\n`);

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Parsed statements: ${ast.body.length}\n`);

// Show statement distribution
const stmtTypes = {};
ast.body.forEach(stmt => {
  stmtTypes[stmt.type] = (stmtTypes[stmt.type] || 0) + 1;
});

console.log('Statement types:');
Object.entries(stmtTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`  ${count}x ${type}`);
});

// Find the specific variable declarations we know exist
console.log('\n=== Looking for specific variables in AST ===\n');

const varDeclarations = ast.body.filter(s => s.type === 'VariableDeclaration');
console.log(`Total VariableDeclaration statements: ${varDeclarations.length}\n`);

// Check for our problematic variables
const problematicVars = ['showindis', 'searchdiv', 'prd', 'longStopPrev', 'dontconfirm', 'repaint'];

problematicVars.forEach(varName => {
  const found = varDeclarations.find(vd => vd.name === varName);
  if (found) {
    console.log(`✓ Found '${varName}' in AST (line ${found.line})`);
  } else {
    console.log(`✗ '${varName}' NOT in VariableDeclaration statements`);
  }
});

// Now run validator and see what errors we get
console.log('\n=== Running Validator ===\n');

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

const criticalErrors = errors.filter(e => e.severity === 0);
console.log(`Total critical errors: ${criticalErrors.length}\n`);

// Check for undefined variable errors for our known variables
console.log('Undefined variable errors for known declared variables:\n');

problematicVars.forEach(varName => {
  const undefinedErrors = criticalErrors.filter(e =>
    e.message.includes(`Undefined variable '${varName}'`)
  );

  if (undefinedErrors.length > 0) {
    console.log(`❌ '${varName}': ${undefinedErrors.length} undefined error(s)`);
    undefinedErrors.forEach(err => {
      console.log(`   Line ${err.line}: ${err.message}`);
    });
  } else {
    console.log(`✓ '${varName}': No undefined errors`);
  }
});

// Summary
console.log('\n=== Summary ===\n');
const foundInAST = problematicVars.filter(v => varDeclarations.find(vd => vd.name === v)).length;
const hasErrors = problematicVars.filter(v =>
  criticalErrors.some(e => e.message.includes(`Undefined variable '${v}'`))
).length;

console.log(`Variables found in AST: ${foundInAST}/${problematicVars.length}`);
console.log(`Variables with undefined errors: ${hasErrors}/${problematicVars.length}`);

if (foundInAST > 0 && hasErrors > 0) {
  console.log('\n🔍 BUG CONFIRMED: Variables exist in AST but validator reports undefined!');
}
