const fs = require('fs');
const path = require('path');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

console.log('=== Analyzing Remaining Parsing Errors ===\n');

const filePath = path.join(__dirname, 'examples/demo/tun-satiroglu.pine');
const code = fs.readFileSync(filePath, 'utf-8');

const validator = new ComprehensiveValidator();
const result = validator.validate(code, filePath);

// Filter for parsing errors only
const parsingErrors = result.errors.filter(e => {
  const msg = e.message.toLowerCase();
  return msg.includes('expected') || msg.includes('unexpected');
});

console.log(`Total errors: ${result.errors.length}`);
console.log(`Parsing errors: ${parsingErrors.length}\n`);

// Group by error type
const errorGroups = {};
parsingErrors.forEach(error => {
  const key = error.message.replace(/Line \d+: /, '');
  if (!errorGroups[key]) {
    errorGroups[key] = [];
  }
  errorGroups[key].push(error.line);
});

console.log('=== PARSING ERRORS BY TYPE ===\n');
Object.entries(errorGroups)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([errorType, lines]) => {
    console.log(`${errorType} (${lines.length} occurrences)`);
    console.log(`  Lines: ${lines.join(', ')}`);
    console.log('');
  });

// Show code context for each unique error type
console.log('=== CODE CONTEXT FOR EACH ERROR TYPE ===\n');
const codeLines = code.split('\n');

const seenErrorTypes = new Set();
parsingErrors.forEach(error => {
  const errorType = error.message.replace(/Line \d+: /, '');

  if (!seenErrorTypes.has(errorType)) {
    seenErrorTypes.add(errorType);
    const lineNum = error.line - 1; // 0-indexed

    console.log(`Error: ${errorType}`);
    console.log(`Line ${error.line}:`);

    // Show context: 2 lines before, error line, 2 lines after
    for (let i = Math.max(0, lineNum - 2); i <= Math.min(codeLines.length - 1, lineNum + 2); i++) {
      const marker = i === lineNum ? '>>>' : '   ';
      console.log(`${marker} ${String(i + 1).padStart(4)}: ${codeLines[i]}`);
    }
    console.log('');
  }
});
