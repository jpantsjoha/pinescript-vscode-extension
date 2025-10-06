const fs = require('fs');
const { Parser } = require('./dist/src/parser/parser.js');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator.js');

/**
 * Validates a string of Pine Script code.
 * @param {string} code The Pine Script code to validate.
 * @returns {Array} An array of validation error objects.
 */
function validatePineScript(code) {
  try {
    const parser = new Parser(code);
    const ast = parser.parse();
    const validator = new ComprehensiveValidator();
    return validator.validate(ast);
  } catch (e) {
    // Return parser errors in the same format as validator errors
    return [{
      line: e.loc?.line || 0,
      column: e.loc?.column || 0,
      message: e.message,
    }];
  }
}

// Original behavior: when run directly, validate a test script and print errors.
if (require.main === module) {
  const testCode = `
//@version=6
indicator("Test")

plot(ssss.adas, 33)
`;

  console.log('Running comprehensive validator on test code...');
  const errors = validatePineScript(testCode);

  console.log(`\nFound ${errors.length} validation errors:`);
  errors.forEach(err => {
    console.log(`  Line ${err.line}, Col ${err.column}: ${err.message}`);
  });
}

module.exports = { validatePineScript };
