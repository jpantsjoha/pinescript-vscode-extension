const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');
const fs = require('fs');

const code = fs.readFileSync('examples/demo/tun-satiroglu.pine', 'utf8');

console.log('=== Parsing tun-satiroglu.pine ===\n');

const parser = new Parser(code);
const ast = parser.parse();

console.log(`Total statements: ${ast.body.length}\n`);

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

console.log(`Total errors: ${errors.length}\n`);

// Group errors by type
const errorsByType = {};
errors.forEach(err => {
  if (!errorsByType[err.message.split(':')[0]]) {
    errorsByType[err.message.split(':')[0]] = [];
  }
  errorsByType[err.message.split(':')[0]].push(err);
});

console.log('=== Error Distribution ===\n');
Object.keys(errorsByType).sort((a, b) => errorsByType[b].length - errorsByType[a].length).forEach(type => {
  console.log(`[${errorsByType[type].length}x] ${type}`);
  if (errorsByType[type].length <= 3) {
    errorsByType[type].forEach(err => {
      console.log(`    Line ${err.line}: ${err.message}`);
    });
  } else {
    console.log(`    Line ${errorsByType[type][0].line}: ${errorsByType[type][0].message}`);
    console.log(`    ... (${errorsByType[type].length - 1} more)`);
  }
  console.log('');
});
