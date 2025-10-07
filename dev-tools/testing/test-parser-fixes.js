#!/usr/bin/env node
/**
 * Test specific parser fixes from v0.4.4
 */

const { AccurateValidator } = require('./dist/src/parser/accurateValidator');

console.log('\n🧪 Testing v0.4.4 Parser Fixes\n');
console.log('━'.repeat(60));

// Test 1: math.round with precision parameter
console.log('\n✅ Test 1: math.round(value, precision)');
const test1 = `//@version=6
indicator("Test")
rounded = math.round(close, 2)
plot(rounded)`;

const validator1 = new AccurateValidator();
const errors1 = validator1.validate(test1);
const mathRoundErrors = errors1.filter(e => e.message.includes('math.round'));

if (mathRoundErrors.length === 0) {
  console.log('   ✅ PASS: math.round(close, 2) validates correctly');
} else {
  console.log('   ❌ FAIL: math.round still has errors:');
  mathRoundErrors.forEach(e => console.log(`      ${e.message}`));
}

// Test 2: strategy.position_size
console.log('\n✅ Test 2: strategy.position_size');
const test2 = `//@version=6
strategy("Test")
if strategy.position_size > 0
    strategy.close("Long")
if strategy.position_size < 0
    strategy.close("Short")`;

const validator2 = new AccurateValidator();
const errors2 = validator2.validate(test2);
const positionSizeErrors = errors2.filter(e => e.message.includes('position_size'));

if (positionSizeErrors.length === 0) {
  console.log('   ✅ PASS: strategy.position_size validates correctly');
} else {
  console.log('   ❌ FAIL: strategy.position_size still has errors:');
  positionSizeErrors.forEach(e => console.log(`      ${e.message}`));
}

// Test 3: Other strategy variables
console.log('\n✅ Test 3: Other strategy.* variables');
const test3 = `//@version=6
strategy("Test")
plot(strategy.equity)
plot(strategy.netprofit)
plot(strategy.position_avg_price)`;

const validator3 = new AccurateValidator();
const errors3 = validator3.validate(test3);
const strategyErrors = errors3.filter(e => e.message.includes('strategy'));

if (strategyErrors.length === 0) {
  console.log('   ✅ PASS: strategy.equity, netprofit, position_avg_price validate correctly');
} else {
  console.log('   ❌ FAIL: Some strategy variables still have errors:');
  strategyErrors.forEach(e => console.log(`      ${e.message}`));
}

console.log('\n' + '━'.repeat(60));
const totalErrors = mathRoundErrors.length + positionSizeErrors.length + strategyErrors.length;
if (totalErrors === 0) {
  console.log('✅ All v0.4.4 fixes validated successfully!\n');
  process.exit(0);
} else {
  console.log(`❌ ${totalErrors} validation issues found\n`);
  process.exit(1);
}
