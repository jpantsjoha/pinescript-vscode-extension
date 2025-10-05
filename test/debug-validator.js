#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the validator (CommonJS)
const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');

// Read test file
const testFile = path.join(__dirname, '..', 'test-validation.pine');
const code = fs.readFileSync(testFile, 'utf-8');

console.log('🧪 Testing Validator on test-validation.pine\n');
console.log('=' .repeat(70));

// Create validator and run
const validator = new AccurateValidator();
const errors = validator.validate(code);

console.log(`\n📊 Total Errors Found: ${errors.length}\n`);

if (errors.length === 0) {
  console.log('✅ No errors detected (may be wrong if invalid code exists!)\n');
} else {
  console.log('Errors:\n');
  errors.forEach((err, idx) => {
    console.log(`${idx + 1}. Line ${err.line}, Col ${err.column}: ${err.message}`);
    console.log(`   Severity: ${err.severity === 0 ? 'Error' : err.severity === 1 ? 'Warning' : 'Info'}`);
    console.log();
  });
}

console.log('=' .repeat(70));
console.log('\n📝 Expected Errors (from test-validation.pine):');
console.log('   Line 14: sometin() - undefined function');
console.log('   Line 15: plot.styl - incomplete reference');
console.log('   Line 16: some - undefined variable');
console.log('   Line 17: math.nonexistent - undefined function');
console.log('   Line 18: plot.style_invalid - invalid constant');

console.log('\n📝 Should NOT flag as errors:');
console.log('   Lines 5-11: All valid v6 syntax');
