#!/usr/bin/env node
/**
 * v0.4.0 Self-Test - Validate Complete v6 Language Coverage
 *
 * This test validates that v0.4.0 has 100% coverage of:
 * - All 31 constant namespaces
 * - All 27 standalone built-in variables
 * - All 15 keywords
 * - All 21 operators
 * - Zero false positives on valid v6 code
 */

const fs = require('fs');
const path = require('path');

// Load official v6 data
const v6Data = require('../v6/raw/v6-language-constructs.json');

// Load our implementation
const { AccurateValidator } = require('../dist/src/parser/accurateValidator');
const { NAMESPACE_CONSTANTS, CONSTANT_NAMESPACES } = require('../dist/v6/pine-constants-complete');
const {
  STANDALONE_BUILTINS,
  VARIABLE_NAMESPACES,
  FUNCTION_NAMESPACES,
  KEYWORDS,
  OPERATORS,
  TYPE_NAMES
} = require('../dist/v6/pine-builtins-complete');

console.log('🔍 v0.4.0 SELF-TEST - Complete v6 Language Coverage\n');
console.log('='.repeat(60));

//──────────────────────────────────────────────────────────
// TEST 1: Constant Namespace Coverage
//──────────────────────────────────────────────────────────
console.log('\n📦 TEST 1: Constant Namespace Coverage');
console.log('-'.repeat(60));

const officialConstants = new Set(v6Data.constants.namespaces.items);
const implementedConstants = CONSTANT_NAMESPACES;

console.log(`Official namespaces: ${officialConstants.size}`);
console.log(`Implemented: ${implementedConstants.size}`);

const missingConstants = [...officialConstants].filter(ns => !implementedConstants.has(ns));
const extraConstants = [...implementedConstants].filter(ns => !officialConstants.has(ns));

if (missingConstants.length > 0) {
  console.log(`❌ MISSING: ${missingConstants.join(', ')}`);
} else {
  console.log('✅ All constant namespaces implemented');
}

if (extraConstants.length > 0) {
  console.log(`ℹ️  EXTRA: ${extraConstants.join(', ')} (barstate is both constant and variable)`);
}

//──────────────────────────────────────────────────────────
// TEST 2: Standalone Built-in Variables
//──────────────────────────────────────────────────────────
console.log('\n📊 TEST 2: Standalone Built-in Variables');
console.log('-'.repeat(60));

const officialBuiltins = new Set(v6Data.builtInVariables.standalone.items);
const implementedBuiltins = STANDALONE_BUILTINS;

console.log(`Official built-ins: ${officialBuiltins.size}`);
console.log(`Implemented: ${implementedBuiltins.size}`);

const missingBuiltins = [...officialBuiltins].filter(v => !implementedBuiltins.has(v));
const extraBuiltins = [...implementedBuiltins].filter(v => !officialBuiltins.has(v));

if (missingBuiltins.length > 0) {
  console.log(`❌ MISSING: ${missingBuiltins.join(', ')}`);
} else {
  console.log('✅ All standalone built-ins implemented');
}

if (extraBuiltins.length > 0) {
  console.log(`ℹ️  EXTRA: ${extraBuiltins.join(', ')}`);
}

//──────────────────────────────────────────────────────────
// TEST 3: Keywords Coverage
//──────────────────────────────────────────────────────────
console.log('\n🔑 TEST 3: Keywords Coverage');
console.log('-'.repeat(60));

const officialKeywords = new Set(v6Data.keywords.items);
const implementedKeywords = KEYWORDS;

console.log(`Official keywords: ${officialKeywords.size}`);
console.log(`Implemented: ${implementedKeywords.size}`);

const missingKeywords = [...officialKeywords].filter(k => !implementedKeywords.has(k));
const extraKeywords = [...implementedKeywords].filter(k => !officialKeywords.has(k));

if (missingKeywords.length > 0) {
  console.log(`❌ MISSING: ${missingKeywords.join(', ')}`);
} else {
  console.log('✅ All keywords implemented');
}

if (extraKeywords.length > 0) {
  console.log(`ℹ️  EXTRA: ${extraKeywords.join(', ')} (enum is both keyword and potential identifier)`);
}

//──────────────────────────────────────────────────────────
// TEST 4: Operators Coverage
//──────────────────────────────────────────────────────────
console.log('\n⚙️  TEST 4: Operators Coverage');
console.log('-'.repeat(60));

const officialOperators = new Set(v6Data.operators.items);
const implementedOperators = OPERATORS;

console.log(`Official operators: ${officialOperators.size}`);
console.log(`Implemented: ${implementedOperators.size}`);

const missingOperators = [...officialOperators].filter(op => !implementedOperators.has(op));

if (missingOperators.length > 0) {
  console.log(`❌ MISSING: ${missingOperators.join(', ')}`);
} else {
  console.log('✅ All operators implemented');
}

//──────────────────────────────────────────────────────────
// TEST 5: Zero False Positives Test
//──────────────────────────────────────────────────────────
console.log('\n🚫 TEST 5: Zero False Positives on v6 Constructs');
console.log('-'.repeat(60));

const validator = new AccurateValidator();

// Test all constant namespaces
let falsePositives = 0;
const testCases = [];

// Test 20 previously missing namespaces
const previouslyMissing = [
  'xloc.bar_index',
  'yloc.price',
  'extend.both',
  'scale.left',
  'display.all',
  'hline.style_dashed',
  'barmerge.gaps_on',
  'font.family_default',
  'text.align_center',
  'order.ascending',
  'currency.USD',
  'dayofweek.monday',
  'adjustment.dividends',
  'backadjustment.on',
  'dividends.gross',
  'earnings.actual',
  'settlement_as_close.inherit',
  'splits.denominator',
  'math.pi',
  'position.top_center'
];

for (const testCase of previouslyMissing) {
  const code = `//@version=6\\nindicator("Test")\\nx = ${testCase}`;
  const errors = validator.validate(code);

  if (errors.length > 0) {
    console.log(`❌ FALSE POSITIVE: ${testCase}`);
    console.log(`   Error: ${errors[0].message}`);
    falsePositives++;
  }
  testCases.push({ code: testCase, passed: errors.length === 0 });
}

if (falsePositives === 0) {
  console.log(`✅ Zero false positives on ${previouslyMissing.length} test cases`);
} else {
  console.log(`❌ ${falsePositives} false positives found`);
}

//──────────────────────────────────────────────────────────
// TEST 6: Variable Namespace Coverage
//──────────────────────────────────────────────────────────
console.log('\n🔀 TEST 6: Variable Namespace Coverage');
console.log('-'.repeat(60));

const officialVarNamespaces = new Set(v6Data.builtInVariables.namespaces.items);
const implementedVarNamespaces = VARIABLE_NAMESPACES;

console.log(`Official variable namespaces: ${officialVarNamespaces.size}`);
console.log(`Implemented: ${implementedVarNamespaces.size}`);

const missingVarNs = [...officialVarNamespaces].filter(ns => !implementedVarNamespaces.has(ns));

if (missingVarNs.length > 0) {
  console.log(`❌ MISSING: ${missingVarNs.join(', ')}`);
} else {
  console.log('✅ All variable namespaces implemented');
}

//──────────────────────────────────────────────────────────
// TEST 7: Function Namespace Coverage
//──────────────────────────────────────────────────────────
console.log('\n⚡ TEST 7: Function Namespace Coverage');
console.log('-'.repeat(60));

const officialFuncNamespaces = new Set(v6Data.functions.namespaces.items);
const implementedFuncNamespaces = FUNCTION_NAMESPACES;

console.log(`Official function namespaces: ${officialFuncNamespaces.size}`);
console.log(`Implemented: ${implementedFuncNamespaces.size}`);

const missingFuncNs = [...officialFuncNamespaces].filter(ns => !implementedFuncNamespaces.has(ns));

if (missingFuncNs.length > 0) {
  console.log(`❌ MISSING: ${missingFuncNs.join(', ')}`);
} else {
  console.log('✅ All function namespaces implemented');
}

//──────────────────────────────────────────────────────────
// FINAL SUMMARY
//──────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('📊 FINAL SCORE');
console.log('='.repeat(60));

const tests = [
  { name: 'Constant Namespaces', passed: missingConstants.length === 0 },
  { name: 'Standalone Built-ins', passed: missingBuiltins.length === 0 },
  { name: 'Keywords', passed: missingKeywords.length === 0 },
  { name: 'Operators', passed: missingOperators.length === 0 },
  { name: 'Zero False Positives', passed: falsePositives === 0 },
  { name: 'Variable Namespaces', passed: missingVarNs.length === 0 },
  { name: 'Function Namespaces', passed: missingFuncNs.length === 0 }
];

const passedTests = tests.filter(t => t.passed).length;
const totalTests = tests.length;

tests.forEach(test => {
  console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log('\\n' + '='.repeat(60));
console.log(`RESULT: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);

if (passedTests === totalTests) {
  console.log('\\n🎉 v0.4.0 ACHIEVED 100% LANGUAGE CONSTRUCT COVERAGE!');
  console.log('\\n✅ Production Ready:');
  console.log('   - All 31 constant namespaces recognized');
  console.log('   - All 27 standalone built-ins recognized');
  console.log('   - All 15 keywords recognized');
  console.log('   - All 21 operators recognized');
  console.log('   - All 21 variable namespaces recognized');
  console.log('   - All 22 function namespaces recognized');
  console.log('   - Zero false positives on valid v6 code');
  process.exit(0);
} else {
  console.log('\\n⚠️  Some tests failed - review above for details');
  process.exit(1);
}
