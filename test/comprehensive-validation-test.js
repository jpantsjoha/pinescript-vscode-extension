#!/usr/bin/env node

/**
 * Comprehensive Validation Test
 * Programmatically tests the validator against known good and bad code
 * to identify root causes of false positives and false negatives
 */

const fs = require('fs');
const path = require('path');

// Create vscode mock module file
const vscodeModulePath = path.join(__dirname, '..', 'node_modules', 'vscode');
const vscodeIndexPath = path.join(vscodeModulePath, 'index.js');

// Create mock vscode module
const vscodeContent = `
module.exports = {
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  }
};
`;

// Ensure directory exists and write mock
if (!fs.existsSync(vscodeModulePath)) {
  fs.mkdirSync(vscodeModulePath, { recursive: true });
}
fs.writeFileSync(vscodeIndexPath, vscodeContent);

// Also create package.json for the mock
const packageJsonPath = path.join(vscodeModulePath, 'package.json');
fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'vscode', version: '1.0.0', main: 'index.js' }));

// Now require the modules
const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');
const { PINE_FUNCTIONS_MERGED } = require('../dist/v6/parameter-requirements-merged.js');
const { isValidNamespaceMember } = require('../dist/v6/pine-constants.js');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('  Comprehensive Validation Test - Root Cause Analysis');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Test 1: Verify function database completeness
console.log('📊 TEST 1: Function Database Completeness\n');
const allFunctions = Object.keys(PINE_FUNCTIONS_MERGED);
console.log(`Total functions in PINE_FUNCTIONS_MERGED: ${allFunctions.length}`);

// Check critical functions
const criticalFunctions = [
  'math.abs', 'math.max', 'math.min', 'math.round',
  'str.tostring', 'str.format', 'str.length',
  'table.cell', 'table.new', 'table.set_bgcolor',
  'plot', 'indicator', 'strategy',
  'ta.sma', 'ta.ema', 'ta.crossover'
];

console.log('\n✓ Checking critical functions:');
criticalFunctions.forEach(func => {
  const exists = !!PINE_FUNCTIONS_MERGED[func];
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${func}: ${exists ? 'FOUND' : 'MISSING'}`);
});

// Test 2: Verify constants recognition
console.log('\n\n📊 TEST 2: Constants Recognition\n');
const criticalConstants = [
  { namespace: 'plot', member: 'style_line' },
  { namespace: 'plot', member: 'style_linebr' },
  { namespace: 'plot', member: 'style_histogram' },
  { namespace: 'plot', member: 'style_invalid' }, // Should be false
  { namespace: 'color', member: 'red' },
  { namespace: 'color', member: 'new' },
  { namespace: 'shape', member: 'circle' },
  { namespace: 'location', member: 'abovebar' },
];

console.log('✓ Checking constant recognition:');
criticalConstants.forEach(({ namespace, member }) => {
  const isValid = isValidNamespaceMember(namespace, member);
  const expected = member !== 'style_invalid';
  const status = (isValid === expected) ? '✅' : '❌';
  console.log(`  ${status} ${namespace}.${member}: ${isValid ? 'VALID' : 'INVALID'} (expected: ${expected ? 'VALID' : 'INVALID'})`);
});

// Test 3: Validate known VALID code (should produce ZERO errors)
console.log('\n\n📊 TEST 3: Valid Code Validation (Should Produce ZERO Errors)\n');

const validCode = `//@version=6
indicator("Test")

// Valid plot styles
plot(close, style=plot.style_line)
plot(close, style=plot.style_linebr)
plot(close, style=plot.style_histogram)
plot(close, style=plot.style_area)

// Valid math functions
absValue = math.abs(-10)
maxValue = math.max(close, open)
minValue = math.min(close, open)
rounded = math.round(close)

// Valid string functions
text = str.tostring(close)
formatted = str.format("{0}", close)
length = str.length("hello")

// Valid table functions
mytable = table.new(position.top_right, 2, 2)
table.cell(mytable, 0, 0, "Value")
table.set_bgcolor(mytable, 0, 0, color.red)

// Valid color usage
myColor = color.new(color.red, 50)
myRgb = color.rgb(255, 0, 0)

// Valid ta functions
sma20 = ta.sma(close, 20)
ema20 = ta.ema(close, 20)
crossUp = ta.crossover(close, sma20)
`;

const validator = new AccurateValidator();
const validErrors = validator.validate(validCode);

console.log(`Errors found in VALID code: ${validErrors.length}`);
if (validErrors.length > 0) {
  console.log('\n❌ FALSE POSITIVES DETECTED:\n');
  validErrors.forEach((err, idx) => {
    console.log(`  ${idx + 1}. Line ${err.line}: ${err.message}`);
    // Extract the actual code line
    const lines = validCode.split('\n');
    const codeLine = lines[err.line - 1];
    console.log(`     Code: ${codeLine.trim()}`);
    console.log();
  });
} else {
  console.log('✅ No false positives - all valid code passes!\n');
}

// Test 4: Validate known INVALID code (should produce errors)
console.log('\n📊 TEST 4: Invalid Code Validation (Should Produce Errors)\n');

const invalidCode = `//@version=6
indicator("Test")
sometin()
plot.styl
plot(333.33, someUndefinedVar)
math.nonexistent(10)
plot(close, style=plot.style_invalid)
str.invalid("test")
alertcondition(true, "title", "message", "extra")
`;

const invalidErrors = validator.validate(invalidCode);

console.log(`Errors found in INVALID code: ${invalidErrors.length}`);

// Expected errors (lines updated to match actual code without comments)
const expectedErrors = [
  { line: 3, pattern: /sometin|undefined function/i, description: 'Undefined function sometin()' },
  { line: 4, pattern: /plot\.styl|unknown.*styl/i, description: 'Invalid constant plot.styl' },
  { line: 5, pattern: /someUndefinedVar|undefined variable/i, description: 'Undefined variable someUndefinedVar' },
  { line: 6, pattern: /math\.nonexistent|undefined function/i, description: 'Undefined function math.nonexistent' },
  { line: 7, pattern: /style_invalid|unknown.*constant/i, description: 'Invalid constant style_invalid' },
  { line: 8, pattern: /str\.invalid|undefined function/i, description: 'Undefined function str.invalid' },
  { line: 9, pattern: /alertcondition|too many|parameters/i, description: 'Too many parameters for alertcondition' }
];

console.log('\n✓ Expected errors:');
expectedErrors.forEach((expected, idx) => {
  const foundError = invalidErrors.find(e =>
    e.line === expected.line && expected.pattern.test(e.message)
  );
  const status = foundError ? '✅' : '❌';
  const lines = invalidCode.split('\n');
  const codeLine = lines[expected.line - 1];
  console.log(`  ${status} Line ${expected.line}: ${expected.description}`);
  console.log(`     Code: ${codeLine.trim()}`);
  if (foundError) {
    console.log(`     ✓ Detected: ${foundError.message}`);
  } else {
    console.log(`     ✗ NO ERROR DETECTED (FALSE NEGATIVE)`);
  }
  console.log();
});

// Check for unexpected errors
const unexpectedErrors = invalidErrors.filter(err =>
  !expectedErrors.some(expected => expected.line === err.line)
);

if (unexpectedErrors.length > 0) {
  console.log('\n⚠️  UNEXPECTED ERRORS (May be valid):\n');
  unexpectedErrors.forEach((err, idx) => {
    console.log(`  ${idx + 1}. Line ${err.line}: ${err.message}`);
  });
}

// Test 5: Namespace function coverage
console.log('\n\n📊 TEST 5: Namespace Coverage Analysis\n');

const namespaces = {};
allFunctions.forEach(func => {
  if (func.includes('.')) {
    const namespace = func.split('.')[0];
    namespaces[namespace] = (namespaces[namespace] || 0) + 1;
  } else {
    namespaces['<global>'] = (namespaces['<global>'] || 0) + 1;
  }
});

console.log('Functions by namespace:');
Object.entries(namespaces)
  .sort((a, b) => b[1] - a[1])
  .forEach(([ns, count]) => {
    console.log(`  ${ns.padEnd(20)} ${count.toString().padStart(4)} functions`);
  });

// Summary
console.log('\n\n═══════════════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════\n');

const falsePositives = validErrors.length;
const falseNegatives = expectedErrors.filter((expected, idx) =>
  !invalidErrors.some(e => e.line === expected.line)
).length;

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`Extension Version: ${version}`);
console.log(`Total functions in database: ${allFunctions.length}`);
console.log(`False Positives (valid code flagged as error): ${falsePositives}`);
console.log(`False Negatives (invalid code not detected): ${falseNegatives}`);

// Validation metrics
const metrics = {
  version: version,
  testDate: new Date().toISOString().split('T')[0],
  totalFunctions: allFunctions.length,
  falsePositives: falsePositives,
  falseNegatives: falseNegatives,
  namespaces: Object.keys(namespaces).length,
  topNamespaces: Object.entries(namespaces)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ns, count]) => ({ namespace: ns, functions: count }))
};

// Save metrics to file
const metricsFile = path.join(__dirname, `metrics-v${version}.json`);
fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
console.log(`\n📊 Metrics saved to: ${metricsFile}`);

// Quality gates check
const qualityGates = {
  falsePositivesZero: falsePositives === 0,
  falseNegativesLow: falseNegatives < 5,
  functionsComplete: allFunctions.length >= 457
};

console.log('\n📋 Quality Gates:');
console.log(`  ${qualityGates.falsePositivesZero ? '✅' : '❌'} False Positives = 0 (REQUIRED)`);
console.log(`  ${qualityGates.falseNegativesLow ? '✅' : '❌'} False Negatives < 5 (ACCEPTABLE)`);
console.log(`  ${qualityGates.functionsComplete ? '✅' : '❌'} Functions >= 457 (TARGET)`);

const allGatesPassed = Object.values(qualityGates).every(v => v === true);

if (allGatesPassed) {
  console.log('\n✅ ALL QUALITY GATES PASSED - Ready for release!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME QUALITY GATES FAILED - Review output above\n');
  process.exit(1);
}
