const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');
const fs = require('fs');
const path = require('path');

// Find all .pine files
const glob = require('glob');

const files = glob.sync('{examples,test}/**/*.pine', { ignore: ['**/node_modules/**'] });

console.log('=== Comprehensive Pine Script Test Analysis ===\n');
console.log(`Found ${files.length} .pine files\n`);

const results = [];

files.forEach(file => {
  console.log(`\nAnalyzing: ${file}`);

  try {
    const code = fs.readFileSync(file, 'utf8');
    const parser = new Parser(code);
    const ast = parser.parse();

    const validator = new ComprehensiveValidator();
    const errors = validator.validate(ast);

    const criticalErrors = errors.filter(e => e.severity === 0);
    const warnings = errors.filter(e => e.severity === 1);

    // Categorize errors
    const errorTypes = {};
    criticalErrors.forEach(err => {
      const category = err.message.split(':')[0] || err.message.substring(0, 50);
      errorTypes[category] = (errorTypes[category] || 0) + 1;
    });

    results.push({
      file,
      lines: code.split('\n').length,
      statements: ast.body.length,
      errors: criticalErrors.length,
      warnings: warnings.length,
      errorTypes
    });

    console.log(`  Lines: ${code.split('\n').length}`);
    console.log(`  Statements: ${ast.body.length}`);
    console.log(`  Errors: ${criticalErrors.length}`);
    console.log(`  Warnings: ${warnings.length}`);

    if (Object.keys(errorTypes).length > 0) {
      console.log(`  Top error types:`);
      Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([type, count]) => {
          console.log(`    [${count}x] ${type}`);
        });
    }

  } catch (e) {
    console.log(`  ❌ PARSE ERROR: ${e.message}`);
    results.push({
      file,
      parseError: e.message,
      errors: -1,
      warnings: 0
    });
  }
});

console.log('\n\n=== SUMMARY ===\n');

// Overall statistics
const totalErrors = results.reduce((sum, r) => sum + (r.errors > 0 ? r.errors : 0), 0);
const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
const parseErrors = results.filter(r => r.parseError).length;

console.log(`Total files: ${results.length}`);
console.log(`Parse errors: ${parseErrors}`);
console.log(`Total validation errors: ${totalErrors}`);
console.log(`Total warnings: ${totalWarnings}`);

// Files by error count
console.log('\n=== Files by Error Count ===\n');
results
  .filter(r => !r.parseError)
  .sort((a, b) => b.errors - a.errors)
  .forEach(r => {
    const status = r.errors === 0 ? '✓' : '✗';
    console.log(`${status} ${r.file.padEnd(60)} ${r.errors.toString().padStart(4)} errors`);
  });

// Aggregate error types
console.log('\n=== Aggregate Error Types Across All Files ===\n');
const allErrorTypes = {};
results.forEach(r => {
  if (r.errorTypes) {
    Object.entries(r.errorTypes).forEach(([type, count]) => {
      allErrorTypes[type] = (allErrorTypes[type] || 0) + count;
    });
  }
});

Object.entries(allErrorTypes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([type, count]) => {
    console.log(`[${count.toString().padStart(4)}x] ${type}`);
  });

// Error concentration
console.log('\n=== Error Concentration Analysis ===\n');
const filesWith80PercentErrors = results.filter(r => !r.parseError && r.errors > 0)
  .sort((a, b) => b.errors - a.errors);

let runningTotal = 0;
const target80 = totalErrors * 0.8;
const filesFor80Percent = [];

for (const file of filesWith80PercentErrors) {
  runningTotal += file.errors;
  filesFor80Percent.push(file);
  if (runningTotal >= target80) break;
}

console.log(`80% of errors (${Math.round(target80)}) come from ${filesFor80Percent.length} file(s):`);
filesFor80Percent.forEach(f => {
  const percentage = ((f.errors / totalErrors) * 100).toFixed(1);
  console.log(`  - ${f.file}: ${f.errors} errors (${percentage}%)`);
});

// Save detailed results
fs.writeFileSync('comprehensive-test-results.json', JSON.stringify(results, null, 2));
console.log('\n\nDetailed results saved to: comprehensive-test-results.json');
