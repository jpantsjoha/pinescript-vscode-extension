const { Parser } = require('./dist/src/parser/parser');
const fs = require('fs');

const code = fs.readFileSync('examples/demo/tun-satiroglu.pine', 'utf8');
const lines = code.split('\n');

console.log('=== Checking AST Coverage ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Total source lines: ${lines.length}`);
console.log(`Total AST statements: ${ast.body.length}\n`);

// Get all statement line numbers
const stmtLines = ast.body.map(s => s.line).sort((a, b) => a - b);

console.log('First 20 statement lines:');
console.log(stmtLines.slice(0, 20).join(', '));

console.log('\n\nLast 20 statement lines:');
console.log(stmtLines.slice(-20).join(', '));

// Check for gaps in coverage
console.log('\n\n=== Checking for large gaps in coverage ===\n');

const gaps = [];
for (let i = 1; i < stmtLines.length; i++) {
  const gap = stmtLines[i] - stmtLines[i - 1];
  if (gap > 20) {
    gaps.push({
      from: stmtLines[i - 1],
      to: stmtLines[i],
      size: gap
    });
  }
}

if (gaps.length > 0) {
  console.log(`Found ${gaps.length} large gaps (>20 lines):\n`);
  gaps.forEach(gap => {
    console.log(`Lines ${gap.from}-${gap.to} (${gap.size} lines gap)`);

    // Show what's in this gap
    console.log(`  Content preview:`);
    for (let line = gap.from + 1; line < Math.min(gap.from + 5, gap.to); line++) {
      if (lines[line - 1] && lines[line - 1].trim()) {
        console.log(`    Line ${line}: ${lines[line - 1].trim().substring(0, 60)}`);
      }
    }
    console.log('');
  });

  // Check if our problematic variables are in these gaps
  const problematicLines = [181, 297, 299, 300, 306, 117];
  console.log('Checking if problematic variable lines are in gaps:\n');

  problematicLines.forEach(lineNum => {
    const inGap = gaps.find(g => lineNum > g.from && lineNum < g.to);
    if (inGap) {
      console.log(`❌ Line ${lineNum} IS in gap (${inGap.from}-${inGap.to})`);
      console.log(`   ${lines[lineNum - 1].trim().substring(0, 70)}`);
    } else {
      console.log(`✓ Line ${lineNum} NOT in gap`);
    }
  });
}
