const { validatePineScript } = require('./test-comprehensive-validator.js');
const fs = require('fs');

const code = fs.readFileSync('./examples/global-liquidity.v6.pine', 'utf-8');
const errors = validatePineScript(code);
const realErrors = errors.filter(e => e.severity === 0 && !e.message.includes('declared but never used'));

console.log('Total errors:', errors.length);
console.log('Real validation errors (excluding unused warnings):', realErrors.length);
console.log('\n=== REMAINING REAL ERRORS ===');

const errorGroups = {};
realErrors.forEach(e => {
  const msg = e.message;
  errorGroups[msg] = (errorGroups[msg] || 0) + 1;
});

Object.entries(errorGroups).forEach(([msg, count]) => {
  console.log('[' + count + 'x] ' + msg);
});

console.log('\n=== FIRST 10 ERRORS WITH LINES ===');
realErrors.slice(0, 10).forEach(err => {
  console.log('Line ' + err.line + ': ' + err.message);
});
