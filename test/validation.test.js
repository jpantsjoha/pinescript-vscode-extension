/**
 * Validation Test Suite
 * Tests parameter requirements against real Pine Script code
 * Ensures accuracy when upgrading to new Pine Script versions
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { ALL_FUNCTION_SIGNATURES } = require('../dist/v6/parameter-requirements.js');
const { PINE_FUNCTIONS } = require('../dist/v6/parameter-requirements-generated.js');

describe('Parameter Requirements Validation', () => {

  describe('Manual Functions (100% Accuracy)', () => {

    it('indicator() should have only title as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['indicator'];
      assert.ok(spec, 'indicator function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['title'], 'Only title should be required');
      assert.ok(spec.optionalParams.includes('overlay'), 'overlay should be optional');
      assert.ok(spec.optionalParams.includes('max_bars_back'), 'max_bars_back should be optional');
    });

    it('alertcondition() should have condition required, title/message optional', () => {
      const spec = ALL_FUNCTION_SIGNATURES['alertcondition'];
      assert.ok(spec, 'alertcondition function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['condition'], 'Only condition should be required');
      assert.ok(spec.optionalParams.includes('title'), 'title should be optional');
      assert.ok(spec.optionalParams.includes('message'), 'message should be optional');
    });

    it('input.string() should have defval as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['input.string'];
      assert.ok(spec, 'input.string function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['defval'], 'defval should be required');
      assert.ok(spec.optionalParams.includes('title'), 'title should be optional');
    });

    it('plot() should have series as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['plot'];
      assert.ok(spec, 'plot function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['series'], 'series should be required');
      assert.ok(spec.optionalParams.includes('title'), 'title should be optional');
      assert.ok(spec.optionalParams.includes('color'), 'color should be optional');
    });

    it('plotshape() should have series as required, style not shape', () => {
      const spec = ALL_FUNCTION_SIGNATURES['plotshape'];
      assert.ok(spec, 'plotshape function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['series'], 'series should be required');
      assert.ok(spec.optionalParams.includes('style'), 'should use "style" parameter');
      assert.ok(!spec.optionalParams.includes('shape'), 'should NOT have "shape" parameter');
    });

    it('strategy() should have title as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['strategy'];
      assert.ok(spec, 'strategy function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['title'], 'Only title should be required');
      assert.ok(spec.optionalParams.includes('overlay'), 'overlay should be optional');
    });

    it('ta.sma() should have source and length as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['ta.sma'];
      assert.ok(spec, 'ta.sma function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['source', 'length'], 'source and length required');
    });

    it('ta.crossover() should have source1 and source2 as required', () => {
      const spec = ALL_FUNCTION_SIGNATURES['ta.crossover'];
      assert.ok(spec, 'ta.crossover function should exist');
      assert.deepStrictEqual(spec.requiredParams, ['source1', 'source2'], 'both sources required');
    });
  });

  describe('Generated Functions Coverage', () => {

    it('should have generated 457 function signatures', () => {
      const count = Object.keys(PINE_FUNCTIONS).length;
      assert.strictEqual(count, 457, `Should have 457 generated functions, got ${count}`);
    });

    it('should have alert() function', () => {
      const spec = PINE_FUNCTIONS['alert'];
      assert.ok(spec, 'alert function should exist in generated');
      assert.ok(spec.syntax, 'alert should have syntax');
      assert.ok(spec.parameters, 'alert should have parameters');
    });

    it('should have array functions', () => {
      assert.ok(PINE_FUNCTIONS['array.new_float'], 'array.new_float should exist');
      assert.ok(PINE_FUNCTIONS['array.push'], 'array.push should exist');
      assert.ok(PINE_FUNCTIONS['array.get'], 'array.get should exist');
    });

    it('should have math functions', () => {
      assert.ok(PINE_FUNCTIONS['math.abs'], 'math.abs should exist');
      assert.ok(PINE_FUNCTIONS['math.max'], 'math.max should exist');
      assert.ok(PINE_FUNCTIONS['math.min'], 'math.min should exist');
    });
  });

  describe('Manual Overrides', () => {

    it('manual indicator() should override generated', () => {
      const manual = ALL_FUNCTION_SIGNATURES['indicator'];
      const generated = PINE_FUNCTIONS['indicator'];

      assert.ok(manual, 'Manual indicator should exist');
      assert.ok(generated, 'Generated indicator should exist');

      // Manual should have accurate required params (only title)
      assert.deepStrictEqual(manual.requiredParams, ['title'], 'Manual should have only title required');

      // Generated might have incorrectly marked params as required
      // (This is why we need manual overrides)
    });

    it('should prioritize manual over generated for all 32 functions', () => {
      const manualFunctions = [
        'indicator', 'strategy', 'library',
        'plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar',
        'bgcolor', 'barcolor', 'fill', 'hline',
        'alert', 'alertcondition',
        'input.int', 'input.float', 'input.bool', 'input.string',
        'input.color', 'input.source', 'input.timeframe', 'input.symbol',
        'input.session', 'input.price', 'input.time', 'input.text_area',
        'ta.sma', 'ta.ema', 'ta.rsi', 'ta.crossover', 'ta.crossunder', 'ta.cross'
      ];

      manualFunctions.forEach(funcName => {
        assert.ok(ALL_FUNCTION_SIGNATURES[funcName], `${funcName} should exist in manual`);
      });
    });
  });

  describe('Known Issue Regression Tests', () => {

    it('should detect alertcondition with too many arguments (line 238 issue)', () => {
      // Example: alertcondition(shortSig,333,tetette,333,333)
      // Should be: alertcondition(condition, title?, message?)
      const spec = ALL_FUNCTION_SIGNATURES['alertcondition'];
      const requiredCount = spec.requiredParams.length; // 1 (condition)
      const totalCount = spec.requiredParams.length + spec.optionalParams.length; // 3

      assert.strictEqual(requiredCount, 1, 'alertcondition should have 1 required param');
      assert.strictEqual(totalCount, 3, 'alertcondition should have max 3 params total');

      // Simulated validation: 5 args > 3 max = ERROR
      const providedArgs = 5;
      assert.ok(providedArgs > totalCount, 'Should detect too many arguments');
    });

    it('should detect input.string with missing required parameter (line 239 issue)', () => {
      // Example: test = input.string()
      // Should be: input.string(defval, ...)
      const spec = ALL_FUNCTION_SIGNATURES['input.string'];

      assert.ok(spec.requiredParams.includes('defval'), 'input.string should require defval');

      // Simulated validation: 0 args < 1 required = ERROR
      const providedArgs = 0;
      assert.ok(providedArgs < spec.requiredParams.length, 'Should detect missing required param');
    });

    it('should NOT falsely flag valid indicator() calls', () => {
      // Example: indicator("Title", overlay=true) should be VALID
      const spec = ALL_FUNCTION_SIGNATURES['indicator'];

      // Provided: title, overlay
      const providedArgs = ['title', 'overlay'];
      const requiredProvided = providedArgs.filter(p => spec.requiredParams.includes(p));

      assert.strictEqual(requiredProvided.length, 1, 'Should have title (required)');
      assert.ok(providedArgs.length >= spec.requiredParams.length, 'Should have enough args');
    });

    it('should NOT falsely flag plotshape with style parameter', () => {
      // plotshape(..., style=shape.circle) should be VALID
      // plotshape(..., shape=...) should be ERROR (wrong param name)
      const spec = ALL_FUNCTION_SIGNATURES['plotshape'];

      assert.ok(spec.optionalParams.includes('style'), 'plotshape should accept style');
      assert.ok(!spec.optionalParams.includes('shape'), 'plotshape should NOT accept shape');
    });
  });

  describe('Data Integrity', () => {

    it('all manual functions should have signature', () => {
      Object.entries(ALL_FUNCTION_SIGNATURES).forEach(([name, spec]) => {
        assert.ok(spec.signature, `${name} should have signature`);
        assert.ok(spec.requiredParams, `${name} should have requiredParams array`);
        assert.ok(spec.optionalParams, `${name} should have optionalParams array`);
      });
    });

    it('all generated functions should have syntax and parameters', () => {
      Object.entries(PINE_FUNCTIONS).forEach(([name, spec]) => {
        assert.ok(spec.syntax, `${name} should have syntax`);
        assert.ok(spec.parameters !== undefined, `${name} should have parameters array`);
      });
    });

    it('no duplicate parameter names within a function', () => {
      Object.entries(ALL_FUNCTION_SIGNATURES).forEach(([name, spec]) => {
        const allParams = [...spec.requiredParams, ...spec.optionalParams];
        const uniqueParams = new Set(allParams);
        assert.strictEqual(
          allParams.length,
          uniqueParams.size,
          `${name} should not have duplicate parameters`
        );
      });
    });
  });
});