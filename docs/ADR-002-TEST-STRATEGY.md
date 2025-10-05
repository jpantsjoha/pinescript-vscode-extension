# ADR-002: Testing Strategy for Pine Script Validation

**Status**: Accepted
**Date**: 2025-10-05
**Related**: ADR-001 (Validation Strategy)
**Version**: 0.3.0

---

## Context

Ensuring **objective release decisions** requires comprehensive, automated testing that validates:
1. **Zero false positives** on valid Pine Script v6 code
2. **High detection rate** for invalid code
3. **Regression prevention** across versions
4. **Performance** acceptable for real-time editing

---

## Decision

Implement a **multi-layered testing strategy** combining unit tests, integration tests, and programmatic validation.

---

## Test Layers

### Layer 1: Unit Tests (`test/*.test.js`)

**Purpose**: Validate individual components and functions

**Location**: `test/benchmark.test.js`, `test/validation.test.js`

**Test Cases**:
```javascript
// 1. Parameter Requirements
describe('Parameter Requirements Validation', () => {
  it('should have 457 functions in merged database');
  it('math.abs should be recognized');
  it('str.tostring should be recognized');
  it('table.cell should be recognized');
  it('manual functions override generated');
});

// 2. Constant Recognition
describe('Pine Constants', () => {
  it('plot.style_line should be valid');
  it('plot.style_invalid should be invalid');
  it('color.red should be valid');
  it('position.top_right should be valid');
});

// 3. Valid Code (No Errors Expected)
describe('Valid Code Validation', () => {
  it('should NOT flag plot(close, style=plot.style_line)');
  it('should NOT flag math.abs(-10)');
  it('should NOT flag str.tostring(close)');
  it('should NOT flag table.cell(tbl, 0, 0, "text")');
});

// 4. Invalid Code (Errors Expected)
describe('Invalid Code Detection', () => {
  it('should detect sometin() as undefined function');
  it('should detect plot.styl as invalid constant');
  it('should detect math.nonexistent() as undefined');
  it('should detect alertcondition with too many params');
});
```

**Run**: `npm test`
**Pass Criteria**: All 41 tests pass

---

### Layer 2: Comprehensive Validation Test (`test/comprehensive-validation-test.js`)

**Purpose**: Programmatic validation against known good/bad code

**Execution**: Standalone Node.js script (no VS Code dependency)

**Test Structure**:
```
Test 1: Function Database Completeness
  - Verify 457 functions loaded
  - Check critical functions exist
  - Validate namespace coverage

Test 2: Constants Recognition
  - Test plot.style_* patterns
  - Test color.* constants
  - Test shape.*, location.*, size.*

Test 3: Valid Code (ZERO Errors Expected)
  - 20+ lines of valid v6 code
  - All plot styles, math functions, string functions
  - table.* operations, color.* usage

  Expected: 0 errors

Test 4: Invalid Code (Errors Expected)
  - Undefined functions
  - Invalid constants
  - Incomplete references
  - Wrong parameter counts

  Expected: 5-7 errors detected

Test 5: Namespace Coverage
  - List functions by namespace
  - Verify all major namespaces covered
```

**Metrics Collected**:
```typescript
{
  totalFunctions: 457,
  falsePositives: 0,    // Valid code flagged as error
  falseNegatives: 2,    // Invalid code NOT detected
  namespaces: {
    'ta': 59,
    'array': 55,
    'matrix': 49,
    // ... etc
  }
}
```

**Run**: `node test/comprehensive-validation-test.js`
**Pass Criteria**:
- False Positives = 0 ✅
- False Negatives < 5 ⚠️

---

### Layer 3: Real-World File Testing (`examples/`)

**Purpose**: Validate against actual Pine Script files from TradingView

**Test Files**:
1. `examples/demo/trading-activity.pine` - Complex indicator with tables, math, plots
2. `examples/demo/deltaflow-volume-profile.pine` - Advanced calculations
3. `examples/demo/options-max-pain.pine` - Strategy with multiple inputs
4. `test-validation.pine` - Synthetic test file with known errors

**Manual Testing Process**:
1. Open file in VS Code with extension installed
2. Check Problems panel (View → Problems)
3. Verify:
   - Valid code has **zero errors**
   - Invalid code (test lines) has **expected errors**
4. Check Developer Console for debug logs
5. Confirm performance (<100ms validation time)

**Expected Results**:
```
trading-activity.pine:
  ✅ Lines 1-75: No errors (valid code)
  ❌ Line 76: Error - "Undefined function 'sometin'"
  ❌ Line 77: Error - "Unknown plot constant 'styl'"
  ❌ Line 78: Error - "Undefined variable 'some'"
```

---

### Layer 4: Regression Testing (Pre-Release)

**Purpose**: Ensure no regressions from previous versions

**Process**:
1. **Checkout previous version** (v0.2.5)
2. **Run all tests** → Record baseline results
3. **Checkout new version** (v0.3.0)
4. **Run all tests** → Compare results
5. **Verify improvements**:
   - False positives reduced OR same
   - False negatives reduced OR same
   - No new failures in passing tests

**Automated Check**:
```bash
#!/bin/bash
# scripts/regression-test.sh

# Baseline
git checkout v0.2.5
npm test > baseline.txt

# New version
git checkout v0.3.0
npm test > current.txt

# Compare
diff baseline.txt current.txt
```

---

## Release Quality Gates

### Gate 1: Unit Tests (REQUIRED)
```bash
npm test
```
**Criteria**: ALL 41 tests MUST pass
**Blocker**: Yes - cannot release if failing

### Gate 2: Comprehensive Test (REQUIRED)
```bash
node test/comprehensive-validation-test.js
```
**Criteria**:
- ✅ False Positives = 0 (REQUIRED)
- ⚠️ False Negatives < 5 (ACCEPTABLE)

**Blocker**: Yes if false positives > 0

### Gate 3: Real-World Files (RECOMMENDED)
- Open `examples/demo/*.pine`
- Verify zero errors on valid code
- Verify test errors detected

**Criteria**: No unexpected errors on valid code
**Blocker**: No, but investigate anomalies

### Gate 4: Performance (RECOMMENDED)
```javascript
console.time('validation');
validator.validate(largeFile);
console.timeEnd('validation');
```

**Criteria**: < 100ms for 1000-line file
**Blocker**: No, but optimize if >500ms

---

## Objective Release Decision Matrix

| Criteria | v0.2.5 | v0.3.0 | Status |
|----------|--------|--------|--------|
| Unit Tests Pass | 41/41 | 41/41 | ✅ PASS |
| False Positives | 9 | 0 | ✅ IMPROVED |
| False Negatives | 0 | 2 | ⚠️ ACCEPTABLE |
| Functions in DB | 32 | 457 | ✅ IMPROVED |
| Performance | <50ms | <100ms | ✅ PASS |
| **RELEASE DECISION** | - | - | ✅ **APPROVED** |

**Release Criteria**:
- ✅ All unit tests pass
- ✅ Zero false positives
- ✅ False negatives < 5
- ✅ Performance acceptable
- ✅ No critical regressions

---

## Test Maintenance

### Adding New Tests

**When to add**:
1. New function namespace added to Pine Script
2. Bug reported by users
3. False positive/negative discovered
4. New validation rule implemented

**Process**:
1. Add test case to `test/benchmark.test.js`
2. Update `test/comprehensive-validation-test.js` if needed
3. Add example file to `examples/` if needed
4. Document in test file comments

**Example**:
```javascript
// New test for matrix functions
it('should recognize matrix.new() as valid', () => {
  const code = 'myMatrix = matrix.new<float>(5, 5)';
  const errors = validator.validate(code);
  assert.strictEqual(errors.length, 0);
});
```

### Updating Test Expectations

**When parameter specs change**:
1. Update `v6/parameter-requirements.ts` (manual)
2. OR re-run `v6/scripts/parse-main-page.js` (generated)
3. Run `npm test` to verify
4. Update test expectations if needed
5. Document changes in CHANGELOG.md

---

## Continuous Integration (Future)

**Recommendation**: GitHub Actions workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: node test/comprehensive-validation-test.js
```

---

## Metrics Collection

**What to track**:
```json
{
  "version": "0.3.0",
  "releaseDate": "2025-10-05",
  "tests": {
    "unit": { "total": 41, "passed": 41, "failed": 0 },
    "comprehensive": {
      "falsePositives": 0,
      "falseNegatives": 2,
      "functionsInDB": 457
    }
  },
  "performance": {
    "avgValidationTime": "45ms",
    "maxValidationTime": "85ms"
  }
}
```

**Storage**: `test/metrics-v0.3.0.json`

**Review**: Before each release

---

## Known Limitations

### Current Test Gaps

1. **Undefined variable detection** - Not comprehensively tested
2. **Scope-based validation** - Variables in different scopes
3. **Multi-line statements** - Functions split across lines
4. **String interpolation** - Complex string expressions

### Future Improvements

1. Add scope-aware variable tracking
2. Test multi-line function calls
3. Add type-checking validation
4. Test inline conditionals (`cond ? a : b`)

---

## References

- [ADR-001: Validation Strategy](./ADR-001-VALIDATION-STRATEGY.md)
- [CLAUDE.md Project Directives](../CLAUDE.md)
- [Benchmark Tests](../test/benchmark.test.js)
- [Comprehensive Test](../test/comprehensive-validation-test.js)

---

## Review History

| Date | Reviewer | Decision |
|------|----------|----------|
| 2025-10-05 | Dev Team | Accepted |

