const { Parser } = require('./dist/src/parser/parser');
const fs = require('fs');

const code = fs.readFileSync('examples/demo/tun-satiroglu.pine', 'utf8');
const lines = code.split('\n');

console.log('=== Finding how variables are declared in source ===\n');

const problematicVars = ['showindis', 'searchdiv', 'prd', 'longStopPrev', 'dontconfirm', 'repaint'];

// Find lines where these variables are declared
problematicVars.forEach(varName => {
  console.log(`\n'${varName}':`);

  lines.forEach((line, i) => {
    // Match: varName = ...
    const pattern = new RegExp(`^${varName}\\s*=`, '');
    if (pattern.test(line.trim())) {
      console.log(`  Line ${i + 1}: ${line.trim().substring(0, 80)}...`);
    }
  });
});

// Now parse and check what statement types these lines create
console.log('\n\n=== Parsing and checking statement types ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Total statements: ${ast.body.length}\n`);

// Find statements around the lines where we found declarations
const declarationLines = {
  'showindis': 300,
  'searchdiv': 299,
  'prd': 297,
  'longStopPrev': 117,
  'dontconfirm': 306,
  'repaint': 181
};

Object.entries(declarationLines).forEach(([varName, lineNum]) => {
  // Find statement(s) that contain this line
  const stmt = ast.body.find(s =>
    s.line === lineNum || (s.line <= lineNum && s.line + 10 >= lineNum)
  );

  if (stmt) {
    console.log(`'${varName}' (line ${lineNum}):`);
    console.log(`  Statement type: ${stmt.type}`);
    console.log(`  Statement line: ${stmt.line}`);

    if (stmt.type === 'VariableDeclaration') {
      console.log(`  Variable name: ${stmt.name}`);
    } else if (stmt.type === 'ExpressionStatement') {
      console.log(`  Expression type: ${stmt.expression.type}`);
      if (stmt.expression.type === 'AssignmentExpression') {
        console.log(`  Left: ${stmt.expression.left.name}`);
        console.log(`  Operator: ${stmt.expression.operator}`);
      }
    } else if (stmt.type === 'IfStatement') {
      console.log(`  ⚠️  Variable declaration inside if statement?`);
    }
  } else {
    console.log(`'${varName}' (line ${lineNum}): ❌ Statement not found in AST`);
  }
  console.log('');
});
