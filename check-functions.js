const db = require('./dist/v6/parameter-requirements-merged.js');

console.log('input.bool:', !!db.PINE_FUNCTIONS_MERGED['input.bool']);
console.log('input.color:', !!db.PINE_FUNCTIONS_MERGED['input.color']);
console.log('input.int:', !!db.PINE_FUNCTIONS_MERGED['input.int']);
console.log('input.timeframe:', !!db.PINE_FUNCTIONS_MERGED['input.timeframe']);
console.log('input.source:', !!db.PINE_FUNCTIONS_MERGED['input.source']);
console.log('input.session:', !!db.PINE_FUNCTIONS_MERGED['input.session']);
console.log('\nTotal functions:', Object.keys(db.PINE_FUNCTIONS_MERGED).length);

// List all input.* functions
const inputFuncs = Object.keys(db.PINE_FUNCTIONS_MERGED).filter(k => k.startsWith('input.'));
console.log('\nAll input.* functions:', inputFuncs.length);
console.log(inputFuncs.join(', '));
