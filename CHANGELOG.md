# Changelog

All notable changes to the Pine Script v6 VSCode Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.1] - 2026-08-08

### 🐛 Three semantic checks missed common real-world shapes

An adversarial review found each check working on its happy path and silently
missing a shape that occurs constantly. Engine bumped to
`pinescript-v6-validator@0.2.1`.

- **S1 skipped every multi-line `request.security()`.** The code bailed when the
  parentheses did not close on one line, with a comment claiming the call was
  "assessed on its own line". Nothing assessed it. Wrapping is the normal
  formatting for this function, so most real repainting escaped detection.
- **S2 only checked the true branch of a ternary.** `cond ? na : ta.sma(...)`
  passed clean. Both branches are conditional and both leave gaps in history.
- **S9 counted `strategy.cancel` as an exit.** Cancel withdraws a pending order;
  it does not close a position. A strategy that entered and only cancelled had
  unbounded risk and was passed clean.

### 🔧 The audit guard was blind to its newest source

`scripts/audit.js` matched `from 'pinescript-v6-validator'` while `extension.ts`
uses `require('../engine/...')`. It reported "all 2 diagnostic sources" and had
not seen the semantic checks since they were added, in a guard both repos cite as
the reason drift cannot silently recur.

### 📋 Documentation corrected

The README claimed "zero false positives on the golden corpus, 13 real scripts
that compile on TradingView, asserted clean on every commit". It is four committed
synthetic fixtures plus seven files skipped in CI. Wrong on count, provenance and
coverage.

`CLAUDE.md` claimed the engine is "consumed, never copied". In fact
`src/parser/documentChecks.ts` is byte-identical to the package copy and `v6/`
duplicates the package data exactly. Only the semantic checks are genuinely
consumed. `test/engine-parity.test.js` now fails the build if the copies drift,
and the migration is recorded as outstanding debt rather than claimed as done.

---

## [0.6.0] - 2026-08-07

### ✨ Semantic checks — defects that compile and are still wrong

Until now this extension caught code TradingView would reject. These catch code it
**accepts** and then behaves unexpectedly — the category that costs money rather
than time.

| ID | Detects | Severity |
|---|---|---|
| **S1** | `request.security()` reading the current, still-forming bar — repainting | Warning |
| **S2** | `ta.*` called inside a ternary or block — its history develops gaps | Warning |
| **S5** | More than 64 plot calls — TradingView rejects the script | Error |
| **S6** | More than 40 `request.*()` calls | Error |
| **S7** | `plot` / `bgcolor` / `fill` outside global scope — a v6 scope error | Error |
| **S8** | A function defined inside a block — Pine has no nested functions | Error |
| **S9** | `strategy.entry` with no exit anywhere — unbounded risk | Warning |

Suppress a finding you have considered:

```pine
d = request.security(t, "D", close)   // pine-ignore: S1
```

Syntactic diagnostics are never suppressible — a compile error is a fact, not a
judgement.

### 🔧 Architecture

The validation engine is now published as
[`pinescript-v6-validator`](https://www.npmjs.com/package/pinescript-v6-validator)
and consumed by this extension rather than duplicated. A check is written once;
the editor renders it and agent tooling returns it. Two copies would drift, and a
drifted rule means your agent and your editor disagree about the same file.

### 🐛 Found by the new checks

`examples/indicator.2.3.pine` called `bgcolor()` inside an `if` — a genuine v6
scope error, twelve lines above code in the same file doing it correctly.

---

## [0.5.1] - 2026-08-07

Packaging release. **No validator behaviour changes from 0.5.0** — the version is
incremented so the VSIX installs as an unambiguous upgrade.

v0.5.0 was installed alongside a still-present v0.4.4 in `~/.vscode/extensions/`,
and the extension host kept serving the old build: users saw the very
`alertcondition() expects 3 parameters` false positives that 0.5.0 fixed. A
distinct version supersedes the old install cleanly.

If both remain, remove the stale one and reload the window:

```bash
rm -rf ~/.vscode/extensions/jpantsjoha.pinescript-v6-extension-0.4.4
# then: Cmd+Shift+P -> Developer: Reload Window
```

---

## [0.5.0] - 2026-08-07

First release since v0.4.4 (2025-10-07). Focus: eliminating false positives,
catching up with ten months of Pine v6 releases, and building the test gate that
should have caught the regressions in the first place.

### 🔴 Fixed — false positives on valid v6 code

- **Overloaded drawing constructors.** `line.new`, `label.new` and `box.new` each
  have two official call forms — a `chart.point` form and an independent-coordinate
  form. The reference scrape captured only the first, so the far more common
  coordinate form reported a wall of errors (`No parameter named 'x1'`,
  `'left'`, `'top'`…). Ten false errors on a five-line script. Overloads are now
  modelled explicitly: a call is valid if it satisfies **any** overload.
- **Multi-line indentation rules.** Two checks enforced indentation restrictions
  that TradingView **removed in December 2025**. A continuation indented by four
  spaces, or not indented past its opening line, is legal — both now pass.
- **Comments and blank lines inside wrapped calls.** Legal Pine, previously two
  errors apiece.
- **`for … in` loop iterators.** `for b in boxes` bound no variable, so `b.delete()`
  was flagged undefined. Both the element and `[index, element]` forms now bind.
- **Multiline strings** (`"""…"""` / `'''…'''`, added to Pine in April 2026) are
  recognised. Their contents are no longer parsed as code, and the unbalanced
  quotes no longer desynchronise parsing for the rest of the file. Line numbers
  are preserved exactly.
- **`ta.pivothigh` / `ta.pivotlow`** three-argument overload no longer reports
  "too many arguments".
- **Nested parentheses in arguments** are no longer truncated when counting
  arguments (`ta.ema(a / (b + c) * 100, 3)` parsed as one argument, not two).
- **User-defined `type` / `enum`** declarations register as namespaces, so
  `MyType.new(...)` and field access validate.

### ⚡ Performance

- Validation of a 1,302-line script: **158ms → 12.3ms (12.8× faster)**, now well
  inside the 100ms budget and enforced by a test. The old code looped all 457
  function signatures for every line, compiling a regex each time — roughly 595,000
  regex executions per file. Candidate function names are now extracted in one scan.

### ✨ Pine v6 API currency (Oct 2025 → Jul 2026)

The bundled reference was scraped 2025-10-03; everything TradingView shipped since
was missing. Added:

| Added | Release |
|---|---|
| `box.set_xloc()` | March 2025 |
| `active` parameter on all `input.*()` functions | July 2025 |
| `timeframe_bars_back` on `time()` / `time_close()` | October 2025 |
| `syminfo.isin`, `syminfo.current_contract` | Nov 2025 / Jul 2025 |
| `request.footprint()` + `footprint` / `volume_row` namespaces | January 2026 |
| `sort_field` on `array.sort()`, `array.sort_indices()`, `matrix.sort()` | April 2026 |
| Multiline string literals | April 2026 |
| `calc_on_every_history_tick` on `strategy()` | July 2026 |

### 🧪 Testing — 67 → 112 tests

- **`test/golden-corpus.test.js`** — 13 real scripts that compile on TradingView
  must validate with zero errors. Any error against them is a false positive by
  definition. This is the gate that was missing; reproducing the v1.2.0 bug now
  fails six tests. Includes a performance-budget assertion and a guard against the
  corpus silently shrinking.
- **`test/false-positive-regression.test.js`** — every fix above, with a paired
  "must still flag" case so a check can never be quietly deleted instead of fixed.
- **`test/ternary-and-multiline.test.js`** — replaces two root-level scripts that
  printed results but asserted nothing, sat outside the `npm test` glob, and were
  gitignored, so CI never ran them.
- `examples/` is no longer gitignored — the corpus now reaches CI.

### 🔧 Other

- **MCP server repaired.** `mcp/pinescript-mcp-server.js` required a file that does
  not exist (the dev-tools copy is zero bytes), so it failed at load. It now uses
  `AccurateValidator` — the same engine the extension runs, so MCP and editor
  cannot disagree.
- `validate-cli.js` added as the supported headless entry point for CI and agents.
- Two documents misnamed `.pine` renamed to `.md`; they were prose, and produced
  77 meaningless "errors" between them.

### ⚠️ Known issues

- `ComprehensiveValidator` still throws `ast.body is not iterable` on valid input.
  Its import has been removed from `extension.ts`, so the extension is unaffected.
  The AST path (parser/lexer/typeSystem) feeds only this validator, which is why
  type-system validation remains unavailable. See `STATUS.md`.

---

## [0.4.4] - 2025-10-07

### 🔧 Parser Database Fixes

**Critical Parser Database Corrections:**
- Fixed `math.round()` parameter definition (now correctly accepts optional `precision` parameter)
- Added 32 missing `strategy.*` variable properties (position_size, equity, netprofit, etc.)

**Impact:**
- ✅ Eliminates false positive: "Too many arguments for 'math.round'"
- ✅ Eliminates false positive: "Unknown strategy constant or function 'position_size'"
- ✅ Improved validation accuracy for strategy scripts

**Project Cleanup:**
- Organized 26 dev tools into `dev-tools/` structure (debug, analysis, testing)
- Moved test Pine files to `examples/`
- Removed legacy session documentation (preserved in git history)

**Files Modified:**
- `v6/parameter-requirements-generated.ts`: Added precision parameter to math.round
- `v6/pine-constants-complete.ts`: Added STRATEGY_VARIABLES set with all runtime state variables

**Reference:** Parser improvements from Sessions 7-9 (see git history for SESSION-*.md files)

---

## [0.4.3] - 2025-10-06

### 🎯 Session 4: Control Flow & Type Annotations (Dev Tools)

**Major Parser/Validator Improvements:**
- Fixed if/else indentation-based parsing (-52 errors)
- Added for loop iterator variable scoping (-60 errors)
- Implemented type annotation parsing (-59 errors)
- **Total Session 4 reduction: -171 errors (-30.4%)**

**Cumulative Progress (Dev Tools):**
- Baseline: 853 errors → Current: 392 errors (-461, -54.1%)
- Critical file (mft-state-of-delivery): 112+ → 36 errors (-68%)
- Critical file (deltaflow-volume-profile): 58 → 28 errors (-52%)

**Code Changes:**
- Enhanced `src/parser/parser.ts` with indentation tracking for all block statements
- Fixed `src/parser/comprehensiveValidator.ts` for loop iterator scoping
- Added type annotation support (int, float, bool, string, color, etc.)

**Testing:**
- All 12 test files validated
- Zero production impact (dev tools only)
- Self-validation complete with debug scripts

**Documentation:** See `SESSION-4-CONTROL-FLOW-SUMMARY.md`

---

## [0.4.2] - 2025-10-06

### 🔍 Session 3: Type Inference & Multi-Line Functions (Dev Tools)

**Parser/Validator Improvements:**
- Fixed multi-line function body type inference (-9 errors)
- Implemented two-pass function declaration
- Enhanced CallExpression type inference
- Improved ternary expression handling

**Impact:**
- Overall: 572 → 563 errors (-1.6%)
- Improved error specificity (better type information)
- global-liquidity: 24 → 23 errors

**Code Changes:**
- Two-pass function declaration in `src/parser/comprehensiveValidator.ts`
- Smart parameter type heuristics (first param: series, others: int)
- Enhanced type inference for built-in functions

**Documentation:** See `SESSION-3-COMPLETE-SUMMARY.md`

---

## [0.4.1] - 2025-10-06

### 🛠️ Session 2: Built-in Functions & Keywords (Dev Tools)

**Parser/Validator Improvements:**
- Fixed variadic function signatures (math.max, math.min)
- Added 9 missing built-in variables (year, month, hour, minute, second, etc.)
- Added keyword recognition (break, continue, type)
- **Reduction: 617 → 572 errors (-7.3%)**

**Files Improved:**
- test-v6-features.pine: 18 → 12 errors (-33%)
- mft-state-of-delivery.pine: 123 → 112 errors (-9%)
- indicator.2.3.pine: 58 → 51 errors (-12%)

**Documentation:** See `PARSER-FIXES-SESSION-2.md`

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
