const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{examples,test}/**/*.pine', { ignore: ['**/node_modules/**'] });

console.log('=== Detailed Type Mismatch Analysis ===\n');

const typeMismatches = [];

files.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const parser = new Parser(code);
    const ast = parser.parse();
    const validator = new ComprehensiveValidator();
    const errors = validator.validate(ast);

    errors.forEach(err => {
      if (err.message.includes('Type mismatch')) {
        typeMismatches.push({
          file: file.replace(/^examples\//, '').replace(/^test\//, ''),
          line: err.line,
          message: err.message
        });
      }
    });
  } catch (e) {
    // Skip parse errors
  }
});

console.log(`Total type mismatch errors: ${typeMismatches.length}\n`);

// Group by pattern
const patterns = {};
typeMismatches.forEach(tm => {
  // Extract pattern like "cannot apply '>' to X and Y"
  const match = tm.message.match(/cannot apply '([^']+)' to ([^ ]+) and ([^ ]+)/);
  if (match) {
    const [, op, left, right] = match;
    const pattern = `${op}: ${left} and ${right}`;
    if (!patterns[pattern]) {
      patterns[pattern] = [];
    }
    patterns[pattern].push(tm);
  } else {
    const pattern = 'Other: ' + tm.message;
    if (!patterns[pattern]) {
      patterns[pattern] = [];
    }
    patterns[pattern].push(tm);
  }
});

console.log('=== Type Mismatch Patterns (Top 20) ===\n');
Object.entries(patterns)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([pattern, errors]) => {
    console.log(`[${errors.length.toString().padStart(3)}x] ${pattern}`);

    // Show which files contribute to this pattern
    const fileCount = {};
    errors.forEach(e => {
      fileCount[e.file] = (fileCount[e.file] || 0) + 1;
    });

    Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([file, count]) => {
        console.log(`       ${file}: ${count}x`);
      });
    console.log('');
  });

// Analyze "unknown" involvement
console.log('\n=== Unknown Type Involvement ===\n');
const withUnknown = typeMismatches.filter(tm => tm.message.includes('unknown'));
const withoutUnknown = typeMismatches.filter(tm => !tm.message.includes('unknown'));

console.log(`Type mismatches involving 'unknown': ${withUnknown.length} (${((withUnknown.length / typeMismatches.length) * 100).toFixed(1)}%)`);
console.log(`Type mismatches NOT involving 'unknown': ${withoutUnknown.length} (${((withoutUnknown.length / typeMismatches.length) * 100).toFixed(1)}%)`);

console.log('\n=== Examples of non-unknown type mismatches ===\n');
withoutUnknown.slice(0, 10).forEach(tm => {
  console.log(`${tm.file}:${tm.line}: ${tm.message}`);
});
