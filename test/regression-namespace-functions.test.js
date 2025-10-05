/**
 * Regression Test: Namespace Function Validation
 *
 * Ensures that namespaced functions (input.*, ta.*, math.*, etc.) are NOT
 * incorrectly flagged when the database contains both the namespaced function
 * AND a standalone type/function with the same suffix.
 *
 * Issue: v0.3.0 regex bug caused input.bool() to match against 'bool' type,
 * resulting in false positive "Too many arguments for 'bool'"
 *
 * Fix: v0.3.1 uses negative lookbehind + type blacklist
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Create vscode mock
const vscodeModulePath = path.join(__dirname, '..', 'node_modules', 'vscode');
const vscodeIndexPath = path.join(vscodeModulePath, 'index.js');
if (!fs.existsSync(vscodeModulePath)) {
  fs.mkdirSync(vscodeModulePath, { recursive: true });
}
fs.writeFileSync(vscodeIndexPath, `module.exports = { DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 }};`);
fs.writeFileSync(path.join(vscodeModulePath, 'package.json'), JSON.stringify({ name: 'vscode', version: '1.0.0', main: 'index.js' }));

const { AccurateValidator } = require('../dist/src/parser/accurateValidator.js');
const { PINE_FUNCTIONS_MERGED } = require('../dist/v6/parameter-requirements-merged.js');

test('Regression: Namespace functions NOT flagged by suffix types', () => {
  const validator = new AccurateValidator();

  // All input.* functions - these MUST NOT be flagged
  const inputFunctions = [
    'input.bool(true, "Test")',
    'input.color(color.red, "Test")',
    'input.int(20, "Test")',
    'input.float(1.5, "Test")',
    'input.string("default", "Test")',
    'input.timeframe("15", "Test")',
    'input.source(close, "Test")',
    'input.session("0930-1600", "Test")'
  ];

  const code = `//@version=6\nindicator("Test")\n${inputFunctions.join('\n')}`;
  const errors = validator.validate(code);

  // Should have ZERO errors - all are valid functions
  const inputErrors = errors.filter(e => e.message.includes('input.'));

  assert.strictEqual(inputErrors.length, 0,
    `input.* functions should NOT error. Found: ${JSON.stringify(inputErrors)}`
  );
});

test('Regression: Type names NOT validated as functions', () => {
  const validator = new AccurateValidator();

  // These are types, NOT functions - should NOT be validated
  const typeNames = ['bool', 'int', 'float', 'string', 'color', 'array', 'matrix', 'map'];

  typeNames.forEach(typeName => {
    const code = `//@version=6\nindicator("Test")\n${typeName}(x)`;
    const errors = validator.validate(code);

    // Should only error for undefined variable 'x', NOT for type name parameter count
    const typeErrors = errors.filter(e => e.message.includes(`for '${typeName}'`));

    assert.strictEqual(typeErrors.length, 0,
      `Type '${typeName}' should NOT be validated as function`
    );
  });
});

test('Regression: Namespaced ta.* functions work correctly', () => {
  const validator = new AccurateValidator();

  const taFunctions = [
    'ta.sma(close, 20)',
    'ta.ema(close, 50)',
    'ta.crossover(close, sma)',
    'ta.highest(high, 10)',
    'ta.lowest(low, 10)'
  ];

  const code = `//@version=6\nindicator("Test")\nsma = ta.sma(close, 20)\n${taFunctions.join('\n')}`;
  const errors = validator.validate(code);

  const taErrors = errors.filter(e => e.message.includes('ta.'));

  assert.strictEqual(taErrors.length, 0,
    `ta.* functions should NOT error. Found: ${JSON.stringify(taErrors)}`
  );
});

test('Regression: Namespaced math.* functions work correctly', () => {
  const validator = new AccurateValidator();

  const mathFunctions = [
    'math.abs(-10)',
    'math.max(close, open)',
    'math.min(close, open)',
    'math.round(close)',
    'math.floor(close)',
    'math.ceil(close)'
  ];

  const code = `//@version=6\nindicator("Test")\n${mathFunctions.join('\n')}`;
  const errors = validator.validate(code);

  const mathErrors = errors.filter(e => e.message.includes('math.'));

  assert.strictEqual(mathErrors.length, 0,
    `math.* functions should NOT error. Found: ${JSON.stringify(mathErrors)}`
  );
});

test('Regression: Namespaced str.* functions work correctly', () => {
  const validator = new AccurateValidator();

  const strFunctions = [
    'str.tostring(close)',
    'str.format("{0}", close)',
    'str.length("hello")',
    'str.tonumber("123")'
  ];

  const code = `//@version=6\nindicator("Test")\n${strFunctions.join('\n')}`;
  const errors = validator.validate(code);

  const strErrors = errors.filter(e => e.message.includes('str.'));

  assert.strictEqual(strErrors.length, 0,
    `str.* functions should NOT error. Found: ${JSON.stringify(strErrors)}`
  );
});

test('Regression: Complex namespaced patterns', () => {
  const validator = new AccurateValidator();

  // Complex patterns that previously failed
  const code = `//@version=6
indicator("Test")

// All should be valid
lengthSMA = input.int(20, "SMA Length")
lengthEMA = input.int(50, "EMA Length")
useHTF = input.bool(true, "Use Higher Timeframe")
htfPeriod = input.timeframe("15", "HTF Period")
sourcePrice = input.source(close, "Price Source")
sessionTime = input.session("0930-1600", "Trading Session")
colorBull = input.color(color.green, "Bull Color")

sma20 = ta.sma(close, lengthSMA)
ema50 = ta.ema(close, lengthEMA)
crossUp = ta.crossover(close, sma20)
`;

  const errors = validator.validate(code);

  // Should have zero errors - all valid
  assert.strictEqual(errors.length, 0,
    `Complex namespace patterns should NOT error. Found: ${JSON.stringify(errors)}`
  );
});

test('Regression: Edge cases with dots and special patterns', () => {
  const validator = new AccurateValidator();

  const code = `//@version=6
indicator("Test")

// Edge case 1: Multiple dots
table1 = table.new(position.top_right, 2, 2)
table.cell(table1, 0, 0, "Test")

// Edge case 2: Chained calls
value = math.abs(math.min(close, open))

// Edge case 3: Nested parameters
formatted = str.format("Value: {0}", str.tostring(close))
`;

  const errors = validator.validate(code);

  // Should have zero errors
  assert.strictEqual(errors.length, 0,
    `Edge cases should NOT error. Found: ${JSON.stringify(errors)}`
  );
});

test('Database contains both namespaced and type names (root cause verification)', () => {
  // Verify the database structure that caused the bug

  // These should exist (namespaced functions)
  assert.ok(PINE_FUNCTIONS_MERGED['input.bool'], 'input.bool should exist');
  assert.ok(PINE_FUNCTIONS_MERGED['input.color'], 'input.color should exist');

  // These might exist (types - should be skipped by validator)
  const hasTypeEntries = PINE_FUNCTIONS_MERGED['bool'] || PINE_FUNCTIONS_MERGED['color'];

  if (hasTypeEntries) {
    console.log('⚠️  Database contains type entries (bool, color, etc.)');
    console.log('   ✅ Validator correctly skips these via typeNames blacklist');
  }
});
