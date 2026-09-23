# Testing Guide: Pine Script v6 Extension

Comprehensive testing strategy for maintaining accuracy across Pine Script versions.

---

## Test Suite Overview

### 1. **Validation Tests** (`test/validation.test.js`)
Unit tests for parameter requirements accuracy.

**Coverage:**
- ✅ 32 manually verified functions @ 100% accuracy
- ✅ 457 total functions including auto-generated
- ✅ Parameter requirement validation (required vs optional)
- ✅ Known regression issues (lines 238-239 from indicator.2.3.pine)
- ✅ Data integrity checks

**Run:**
```bash
npm run test:validation
```

### 2. **Benchmark Tests** (`test/benchmark.test.js`)
Real-world Pine Script code validation.

**Coverage:**
- ✅ Valid code fixtures (should NOT produce errors)
- ✅ Invalid code fixtures (should PRODUCE errors)
- ✅ Version upgrade readiness checks
- ✅ Coverage metrics for critical functions

**Run:**
```bash
npm run test:benchmark
```

### 3. **Full Test Suite**
Runs all tests including extension tests.

**Run:**
```bash
npm test
```

---

## Test Fixtures

### Valid Code (`test/fixtures/valid.pine`)
Real Pine Script v6 code that should **NOT** trigger validation errors.

**Includes:**
- Valid indicator/strategy declarations
- Valid input functions with all parameter combinations
- Valid plot/alert/ta functions
- Valid array operations
- Edge cases that should be accepted

**Purpose:**
- Prevent false positives
- Ensure legitimate code isn't flagged
- Regression testing for version upgrades

### Invalid Code (`test/fixtures/invalid.pine`)
Pine Script v6 code with **intentional errors** that validators should catch.

**Includes:**
- Missing required parameters (input.string(), indicator(), etc.)
- Too many parameters (alertcondition with 5 args vs max 3)
- Wrong parameter names (plotshape with shape= instead of style=)
- Undefined variables
- Type mismatches

**Purpose:**
- Ensure validator catches real errors
- Prevent false negatives
- Document expected error patterns

---

## Testing for Pine Script Version Upgrades

### When Pine Script v7 Releases

**Step 1: Create v7 Fixtures**
```bash
mkdir test/fixtures/v7
cp test/fixtures/valid.pine test/fixtures/v7/valid.pine
cp test/fixtures/invalid.pine test/fixtures/v7/invalid.pine
```

Update v7 fixtures with new v7 syntax/functions.

**Step 2: Download v7 Documentation**
```bash
# Update BASE_URL in v6/scripts/parse-main-page.js
const BASE_URL = 'https://www.tradingview.com/pine-script-reference/v7/';

# Run parser
node v6/scripts/parse-main-page.js

# Generate merged requirements
node v6/scripts/merge-requirements.js
```

**Step 3: Run Comparison Tests**
```bash
# Test v6 fixtures with v7 validator
npm test

# Expected outcomes:
# - v6 valid code should still be valid (backward compatibility)
# - v6 invalid code should still be invalid (no regressions)
# - New v7 features should validate correctly
```

**Step 4: Document Breaking Changes**
Create `docs/V7-MIGRATION.md` listing:
- New functions added
- Deprecated functions removed
- Parameter requirement changes
- Syntax changes

**Step 5: Update Manual Overrides**
Review `v6/parameter-requirements.ts` and add v7 functions if needed.

---

## Regression Testing Checklist

### Before Each Release

- [ ] Run full test suite: `npm test`
- [ ] Verify all tests pass (should be 100%)
- [ ] Check test coverage for new functions added
- [ ] Review any skipped/pending tests
- [ ] Test against real user code samples

### After Documentation Updates

- [ ] Re-run parser: `node v6/scripts/parse-main-page.js`
- [ ] Re-merge requirements: `node v6/scripts/merge-requirements.js`
- [ ] Run validation tests to ensure no regressions
- [ ] Rebuild extension: `npm run rebuild`

### Monthly Maintenance

- [ ] Download latest TradingView docs (may have corrections)
- [ ] Compare generated requirements with previous version
- [ ] Add any new popular functions to manual overrides
- [ ] Update test fixtures with community-reported edge cases

---

## Test Metrics

### Current Coverage (v6)

| Category | Count | Accuracy | Source |
|----------|-------|----------|--------|
| **Manual Functions** | 32 | 100% | Hand-verified from official docs |
| **Generated Functions** | 425 | ~95% | Auto-parsed from TradingView HTML |
| **Total Functions** | 457 | ~98% | Merged (manual overrides generated) |

### Critical Functions (100% Accuracy)

**Declaration:**
- indicator, strategy, library

**Plotting:**
- plot, plotshape, plotchar, plotcandle, plotbar, bgcolor, barcolor, fill, hline

**Input:**
- input.int, input.float, input.bool, input.string, input.color, input.source, input.timeframe, input.symbol, input.session, input.price, input.time, input.text_area

**Alerts:**
- alert, alertcondition

**Technical Analysis:**
- ta.sma, ta.ema, ta.rsi, ta.crossover, ta.crossunder, ta.cross

---

## Known Issues & Test Cases

### Issue #1: Lines 238-239 from indicator.2.3.pine

**Original Problem:**
```pine
alertcondition(shortSig,333,tetette,333,333)  // Line 238 - TOO MANY ARGS
test = input.string()                          // Line 239 - MISSING REQUIRED PARAM
```

**Test Coverage:**
- ✅ `test/validation.test.js` - "should detect alertcondition with too many arguments"
- ✅ `test/validation.test.js` - "should detect input.string with missing required parameter"
- ✅ `test/fixtures/invalid.pine` - Both patterns included

**Expected Behavior:**
- Line 238: ERROR - "alertcondition() expects max 3 parameters, got 5"
- Line 239: ERROR - "input.string() missing required parameter 'defval'"

### Issue #2: plotshape parameter name

**Original Problem:**
```pine
plotshape(..., shape=shape.circle)  // WRONG - should be 'style'
```

**Test Coverage:**
- ✅ `test/validation.test.js` - "should NOT falsely flag plotshape with style parameter"
- ✅ `test/fixtures/invalid.pine` - Wrong parameter name example

**Expected Behavior:**
- ERROR - "plotshape() parameter 'shape' is invalid. Did you mean 'style'?"

---

## Adding New Tests

### For New Pine Script Functions

1. **Add to manual requirements** (`v6/parameter-requirements.ts`) if critical
2. **Add test case** to `test/validation.test.js`:
   ```javascript
   it('myNewFunction() should have correct params', () => {
     const spec = ALL_FUNCTION_SIGNATURES['myNewFunction'];
     assert.deepStrictEqual(spec.requiredParams, ['param1']);
     assert.ok(spec.optionalParams.includes('param2'));
   });
   ```
3. **Add to fixtures**:
   - `test/fixtures/valid.pine` - Valid usage example
   - `test/fixtures/invalid.pine` - Invalid usage example

### For New Error Patterns

1. **Document in invalid.pine** with `// ERROR:` comment
2. **Add benchmark test** to `test/benchmark.test.js`
3. **Run tests** to ensure detection works

---

## Continuous Integration

### GitHub Actions Workflow (Future)

```yaml
name: Test Pine Script Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run test:validation
      - run: npm run test:benchmark
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests before commit..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi

echo "✅ Tests passed. Proceeding with commit."
```

---

## Debugging Failed Tests

### Test Fails After Documentation Update

**Possible causes:**
- TradingView changed parameter requirements
- Parser misinterpreted HTML structure
- Function was deprecated/renamed

**Solution:**
1. Check official docs: https://www.tradingview.com/pine-script-reference/v6/
2. Compare manual vs generated requirements
3. Add manual override if auto-parse is incorrect
4. Update test expectations if change is intentional

### False Positive in Validation

**Possible causes:**
- Manual requirements are too strict
- Missing optional parameter marker

**Solution:**
1. Review official TradingView Pine Editor behavior
2. Test in actual TradingView chart
3. Update `v6/parameter-requirements.ts` if manual is wrong
4. Add test case to prevent regression

### False Negative (Missing Error)

**Possible causes:**
- Validator not checking this pattern
- Parameter requirements are too lenient

**Solution:**
1. Add error case to `test/fixtures/invalid.pine`
2. Verify should be caught
3. Update validator logic if needed
4. Add test assertion to prevent regression

---

## Test Maintenance Schedule

| Frequency | Task |
|-----------|------|
| **Every Commit** | Run `npm test` |
| **Before Release** | Run full suite + manual QA |
| **Monthly** | Update docs, re-parse, check for new functions |
| **Pine Script Major Version** | Create new fixtures, comparison tests, migration guide |
| **Quarterly** | Review test coverage, add community-reported edge cases |

---

## Success Criteria

✅ **All tests pass** (0 failures)
✅ **Coverage >= 95%** for critical functions
✅ **No false positives** on valid.pine fixture
✅ **All intentional errors caught** in invalid.pine fixture
✅ **Build succeeds** (`npm run rebuild` completes)
✅ **VSIX package size** < 2MB (currently ~950KB)

---

## Resources

- **TradingView Reference**: https://www.tradingview.com/pine-script-reference/v6/
- **Pine Script Docs**: https://www.tradingview.com/pine-script-docs/
- **Node.js Test Runner**: https://nodejs.org/api/test.html
- **VS Code Extension Testing**: https://code.visualstudio.com/api/working-with-extensions/testing-extension

---

**Last Updated:** 2025-01-04
**Pine Script Version:** v6
**Test Suite Version:** 1.0.0
