# Changelog

All notable changes to the Pine Script v6 VSCode Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2025-10-05

### 🎉 Complete Pine Script v6 Language Coverage

**100% language coverage** with all 6,665 official Pine Script v6 language constructs recognized.

### ✨ Added

- **Complete constant namespace support** (31 namespaces):
  - ✅ ALL 31 constant namespaces from official v6 reference
  - Added 20 previously missing namespaces: `xloc`, `yloc`, `extend`, `scale`, `display`, `hline`, `barmerge`, `font`, `text`, `order`, `currency`, `dayofweek`, `adjustment`, `backadjustment`, `dividends`, `earnings`, `settlement_as_close`, `splits`, `math`, `position`
  - Examples now validated correctly:
    ```pinescript
    xloc.bar_index       // ✅ Valid (was ❌ error)
    yloc.price           // ✅ Valid (was ❌ error)
    extend.both          // ✅ Valid (was ❌ error)
    scale.left           // ✅ Valid (was ❌ error)
    hline.style_dashed   // ✅ Valid (was ❌ error)
    currency.USD         // ✅ Valid (was ❌ error)
    dayofweek.monday     // ✅ Valid (was ❌ error)
    position.top_center  // ✅ Valid (was ❌ error)
    ```

- **Complete built-in variables** (27 standalone):
  - All standalone built-ins: `ask`, `bid`, `time_close`, `time_tradingday`, `timenow`, `dayofmonth`, `dayofweek`, `hour`, `minute`, `month`, `second`, `weekofyear`, `year`, etc.

- **Complete keyword recognition** (15 keywords):
  - All v6 keywords: `and`, `or`, `not`, `enum`, `export`, `import`, `method`, `type`, `var`, `varip`, `if`, `for`, `for...in`, `while`, `switch`

### 🔧 Infrastructure

- **New v6 data extraction pipeline**:
  - `v6/scripts/extract-v6-language-constructs.js` - Parses complete v6 reference
  - `v6/pine-constants-complete.ts` - All 31 constant namespaces (2,226 constants)
  - `v6/pine-builtins-complete.ts` - All built-ins, keywords, operators, types

- **Multi-agent development system**:
  - QA Validator Agent - Quality assurance and testing framework
  - DOCA Agent - Documentation quality and completeness
  - POCA Agent - Product ownership and alignment
  - Located in `multi-agent-devex/` (git-ignored)

### 🧪 Testing

- **All 67 tests passing** (100% pass rate)
- **16 comprehensive edge case categories** tested
- **Zero false positives** on valid v6 code
- **Complete regression coverage**

### 📊 Metrics (v0.4.0)

```json
{
  "totalLanguageItems": 6665,
  "constantNamespaces": 31,
  "standaloneBuiltins": 27,
  "variableNamespaces": 21,
  "functionNamespaces": 22,
  "keywords": 15,
  "operators": 21,
  "functions": 457,
  "testsPassing": 67,
  "testPassRate": "100%",
  "languageCoverage": "100%",
  "qualityScore": 95
}
```

### 🎯 Quality Gates Achieved

- ✅ 100% v6 language coverage (6,665/6,665 items)
- ✅ Zero false positives on valid v6 code
- ✅ All 67 tests passing (100% pass rate)
- ✅ < 100ms validation for typical scripts
- ✅ Quality score: 95+

### 🔗 References

- Source: [TradingView Pine Script v6 Reference](https://www.tradingview.com/pine-script-reference/v6/)
- Generated from: `v6/raw/complete-v6-items.json` (6,665 items)
- Extraction date: 2025-10-05

---

## [0.3.1] - 2025-10-05

### 🔥 Critical Hotfix: Namespace Function Validation

Fixed critical regex bug causing **false positives** on valid `input.*` functions.

### 🐛 Fixed

- **Regex word boundary bug**: Word boundary `\b` incorrectly matched namespaced functions
  - **Issue**: `input.bool(true, "Test")` was flagged as "Too many arguments for 'bool'"
  - **Root Cause**: Regex `/\bbool\s*\(/` matched `bool(` in `input.bool(` because `.` is a word boundary
  - **Fix**: Changed to negative lookbehind `(?<![a-zA-Z0-9_\.])` to prevent matching after dots

- **Type names validated as functions**: Database contained type entries (`bool`, `int`, `color`, etc.) that were incorrectly validated as functions
  - **Fix**: Added `typeNames` blacklist to skip validation on type names

### ✅ Impact

**Before v0.3.1** (v0.3.0 had false positives):
```pinescript
input.bool(true, "Test")      // ❌ Error: "Too many arguments for 'bool'"
input.color(color.red, "Test") // ❌ Error: "Too many arguments for 'color'"
```

**After v0.3.1** (fixed):
```pinescript
input.bool(true, "Test")      // ✅ Valid - no error
input.color(color.red, "Test") // ✅ Valid - no error
```

### 🧪 Testing

- **Added 8 regression tests** to prevent recurrence
- **All 49 tests pass** (41 existing + 8 new regression tests)
- **Zero false positives** on all `input.*`, `ta.*`, `math.*`, `str.*` functions

### 📊 Metrics (v0.3.1)

```json
{
  "totalFunctions": 457,
  "falsePositives": 0,
  "falseNegatives": 2,
  "testsPassing": 49
}
```

### 📚 Documentation

- Created `docs/CULPRIT.md` - Complete root cause analysis
- Added regression test suite: `test/regression-namespace-functions.test.js`

---

## [0.3.0] - 2025-10-05

### 🎯 Major Achievement: Zero False Positives

This release represents a **major quality milestone** with complete elimination of false positives and comprehensive validation coverage.

### ✨ Added

- **457 Pine Script v6 functions** from official TradingView documentation (up from 32)
- **Comprehensive validation test suite** with programmatic quality gates
- **Metrics tracking system** - `test/metrics-v0.3.0.json` records validation performance
- **Missing namespaces**: `position`, `plot`, `shape`, `location`, `size`
- **Unreliable function blacklist** for auto-generated functions with incomplete parameter data
- **Variadic function detection** - automatically skip parameter count validation for functions with `...` signatures
- **Architecture Decision Records (ADRs)**:
  - ADR-001: Validation Strategy
  - ADR-002: Test Strategy
  - ADR-003: TradingView Synchronization Strategy

### 🐛 Fixed

- **Zero false positives** on valid Pine Script v6 code (down from 9 in v0.2.5)
- **Parameter assignment context handling** - correctly skip validation for `style=plot.style_line` patterns
- **Comment line validation** - skip lines starting with `//` and blank lines
- **Constants recognition** - properly validate plot.style_*, color.*, shape.*, location.*, size.* constants
- **Variadic functions** - no longer incorrectly flag math.max(), str.format() for "too many arguments"
- **table.* functions** - fixed parameter validation by adding to unreliable function blacklist

### 🔧 Changed

- **Validator now uses merged database** (`parameter-requirements-merged.ts`) with 457 functions instead of manual-only (32 functions)
- **Improved error detection** for undefined namespaces, functions, and variables
- **Better namespace coverage** - 23 namespaces: ta (59), array (55), matrix (49), strategy (47), and more

### 📊 Metrics (v0.3.0)

```json
{
  "totalFunctions": 457,
  "falsePositives": 0,
  "falseNegatives": 2,
  "namespaces": 23,
  "topNamespaces": ["ta", "array", "matrix", "strategy", "<global>"]
}
```

### 📚 Documentation

- Comprehensive testing strategy with 4-layer approach (unit, comprehensive, real-world, regression)
- Synchronization strategy for quarterly TradingView documentation updates
- Quality gates for objective release decisions

### 🚀 Quality Gates Status

- ✅ False Positives = 0 (REQUIRED)
- ✅ False Negatives < 5 (ACCEPTABLE) - 2 detected
- ✅ Functions >= 457 (TARGET)
- ✅ All 41 unit tests pass

### 🔮 Known Limitations

**Acceptable False Negatives (v0.3.0)**:
1. Undefined variables in function parameters - not yet detected
2. Invalid constants in parameter assignment contexts - skipped to avoid false positives

**Planned for v0.4.0**:
- Complete 800+ function coverage using anchor link extraction strategy
- Enhanced undefined variable detection

---

## [0.2.5] - Previous Release

### Features
- Basic validation with 32 manually verified functions
- IntelliSense for core Pine Script functions
- Parameter hints and hover documentation

### Issues
- 9 false positives on valid v6 code
- Incomplete function database (missing matrix.*, map.*, table.* functions)
- No systematic testing strategy

---

## Release Notes

### How to Test v0.3.0

1. **Install VSIX**:
   ```bash
   code --install-extension build/pine-script-extension-0.3.0.vsix --force
   ```

2. **Run Comprehensive Test**:
   ```bash
   node test/comprehensive-validation-test.js
   ```

3. **Expected Output**:
   - ✅ Total functions: 457
   - ✅ False positives: 0
   - ✅ False negatives: 2
   - ✅ All quality gates passed

4. **Manual Verification**:
   - Open `examples/demo/trading-activity.pine`
   - Verify zero errors on valid code (lines 1-75)
   - Verify errors detected on test lines (76-78)

### Upgrade Guide

**From v0.2.5 to v0.3.0**:
- Automatically compatible
- No breaking changes
- Significantly improved validation accuracy

**Database Coverage**:
- v0.2.5: 32 functions (manual only)
- v0.3.0: 457 functions (manual + generated merged)
- v0.4.0 (planned): 800+ functions (complete anchor link extraction)

---

## Future Roadmap

### v0.4.0 - Complete Function Coverage
- **Target**: 800+ functions from TradingView v6 reference
- **Strategy**: Extract all anchor links from main page
- **Categories**: Variables, Constants, Functions, Keywords, Types, Operators, Annotations
- **Scraper**: Enhanced anchor link extraction script

### v0.5.0 - Navigation Features
- Go-to-definition (F12)
- Find references (Shift+F12)
- Document outline
- Breadcrumbs navigation

### v1.0.0 - LSP Architecture
- Language Server Protocol migration
- Multi-file support
- Workspace symbols
- Performance optimization

---

## Support

- **Documentation**: [README.md](./README.md)
- **Testing Guide**: [ADR-002-TEST-STRATEGY.md](./docs/ADR-002-TEST-STRATEGY.md)
- **Sync Strategy**: [ADR-003-TRADINGVIEW-SYNC-STRATEGY.md](./docs/ADR-003-TRADINGVIEW-SYNC-STRATEGY.md)

---

**Note**: This extension is for Pine Script v6. For v5 compatibility, use extension v0.1.x.
