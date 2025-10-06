const { Parser } = require('./dist/src/parser/parser');
const fs = require('fs');

const code = fs.readFileSync('examples/demo/tun-satiroglu.pine', 'utf8');

const parser = new Parser(code);
const ast = parser.parse();

console.log('=== Checking for specific variable declarations ===\n');

// Variables that SHOULD be in the AST (lines 82-117, before first if statement)
const shouldExist = [
  { name: 'Length', line: 82 },
  { name: 'xPrice', line: 83 },
  { name: 'length', line: 103 },
  { name: 'mult', line: 104 },
  { name: 'src', line: 105 },
  { name: 'wicks', line: 106 },
  { name: 'atr', line: 110 },
  { name: 'highPrice', line: 112 },
  { name: 'lowPrice', line: 113 },
  { name: 'doji4price', line: 114 },
  { name: 'longStop', line: 116 },
  { name: 'longStopPrev', line: 117 }
];

const varDecls = ast.body.filter(s => s.type === 'VariableDeclaration');

console.log(`Total VariableDeclaration statements in AST: ${varDecls.length}\n`);

shouldExist.forEach(({ name, line }) => {
  const found = varDecls.find(v => v.name === name);
  if (found) {
    console.log(`✓ '${name}' (line ${line}) found at AST line ${found.line}`);
  } else {
    console.log(`❌ '${name}' (line ${line}) NOT FOUND in AST`);
  }
});

// Show what IS at those statement indices
console.log('\n\n=== Statements around line 119 (first if statement after gap) ===\n');

ast.body.forEach((stmt, i) => {
  if (stmt.line >= 100 && stmt.line <= 125) {
    console.log(`${i}: Line ${stmt.line} - ${stmt.type} ${stmt.name || ''}`);
  }
});
