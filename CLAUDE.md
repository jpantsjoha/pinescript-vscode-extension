# Claude Code — Pine Script v6 Extension

You are working on an **unofficial TradingView Pine Script v6 language extension for
VS Code**, published to the Marketplace as `jpantsjoha.pinescript-v6-extension`.

## The one rule that matters

**A false positive is worse than a missed error.** Users see squiggles on correct
code and uninstall. Every validation change must be proved in BOTH directions:
it silences the false positive AND still catches the real error. If you cannot
write the "still flags" test, do not ship the rule.

## Definition of Done — per task type

No task is done until its row passes. `npm run audit` mechanises most of this;
run it before claiming completion.

| Task | Done when |
|---|---|
| Fix a false positive | Reduced case added to the golden corpus **before** the fix · paired "must still flag" test · `npm test` green · `npm run audit` green |
| Add a validation rule | Paired tests both directions · rule verified against the official v6 reference **and** release notes · zero new diagnostics on the golden corpus |
| Add v6 API | Added to `MODERN_V6_FUNCTIONS` (never the generated file) with its release date · a test exercising it |
| Change packaging | `vsce package` succeeds · VSIX **extracted and the packaged code executed** · entry point resolves |
| Release | Version consistent in package.json / CHANGELOG / README / git tag · audit green · VSIX smoke-tested |
| Harness change | `npm run audit` green · hook pipe-tested on every branch · agents/skills carry frontmatter |

## Diagnostics come from MORE THAN ONE place

`AccurateValidator` is **not** the only source of squiggles. `documentChecks.ts`
runs whole-document heuristics alongside it. Both are wired into `validate-cli.js`
and `test/golden-corpus.test.js`.

This matters because it already went wrong: the document checks lived inline in
`extension.ts`, untested and invisible to the CLI, and shipped **28 false
`alertcondition` errors** across the same corpus the suite was certifying as clean.
A green test run meant nothing for half the diagnostics a user saw.

**If you add a diagnostic source, wire it into both.** `scripts/audit.js` fails the
build otherwise — that guard is the reason this cannot silently recur.

## Before you change validation logic

```bash
npm run build && npm test          # 112 tests; golden corpus must stay at 0 errors
node validate-cli.js <file.pine>   # headless single-file check
node validate-cli.js --both <f>    # diff AccurateValidator vs ComprehensiveValidator
```

`test/golden-corpus.test.js` validates real scripts that compile on TradingView.
Any error against them is a false positive by definition. When a user reports one,
add their reduced script to the corpus *before* fixing it.

## Architecture — read this before adding a validator

Four validators exist. **Only `AccurateValidator` ships.**

| File | Status |
|---|---|
| `src/parser/accurateValidator.ts` | The live validator. Regex-over-lines, no AST. |
| `src/parser/comprehensiveValidator.ts` | Imported by `extension.ts` but never called. Crashes: `ast.body is not iterable`. |
| `src/parser/validator.ts` | Imported, never called. |
| `src/parser/{parser,ast,lexer,typeSystem,symbolTable}.ts` | Feeds only the dead path. |

Consequence: `AccurateValidator` has no AST, so it cannot do type inference.
Do not attempt type-system work inside it — that needs the AST path repaired first.
Do not add a fifth validator.

## Data layer

`v6/parameter-requirements-merged.ts` = `{...GENERATED, ...MANUAL}` — manual wins.

- `parameter-requirements-generated.ts` — auto-scraped **2025-10-03**, 457 functions.
  A point-in-time crawl: anything TradingView shipped later is simply absent.
- `parameter-requirements.ts` — hand-verified overrides. Put corrections here,
  never in the generated file (a re-crawl would erase them).

**Overloads:** the scrape captured only the first signature of each overloaded
function, which is what produced the `line.new` / `label.new` / `box.new` false
positives. Overloaded functions carry an explicit `overloads` array; a call is
valid if it satisfies ANY overload. Never flatten overloads into one parameter list.

**Currency:** `MODERN_V6_FUNCTIONS` in `parameter-requirements.ts` carries API added
after the scrape. Check the [release notes](https://www.tradingview.com/pine-script-docs/release-notes/)
before assuming a symbol is invalid — the dataset lags TradingView.

## Validating Pine syntax rules

Verify against official docs before encoding a rule. Rules get *removed* too: the
December 2025 release dropped indentation restrictions for wrapped lines, so the
old "continuation must be indented further" check became a false-positive generator.

## Agents

Role definitions live in `.claude/agents/` (`qa-validator`, `documentation`,
`product-owner`, `publisher`). They are prose context documents — read the relevant
one before that kind of work.

## Git

Feature branches only, never commit to `main`. Do **not** add AI/Claude
co-author trailers to commits (see `.claude/COMMIT-GUIDELINES.md`).

---

# Pine Script v6 VSCode Extension - Project Directives

## 🎯 Project Mission

Build a **professional-grade Pine Script v6 IDE extension** for VS Code that provides:
- **100% accurate** parameter validation based on official TradingView documentation
- **Intelligent IntelliSense** with 457+ built-in functions
- **Real-time diagnostics** catching undefined variables, functions, and invalid constants
- **Zero false positives** - only report actual errors, never valid v6 syntax

---

## 📚 Official Pine Script v6 References

### Core Documentation
- **Main Docs**: https://www.tradingview.com/pine-script-docs/
- **Language Reference**: https://www.tradingview.com/pine-script-reference/v6/
- **Writing Guide**: https://www.tradingview.com/pine-script-docs/writing/
- **Style Guide**: https://www.tradingview.com/pine-script-docs/writing/style-guide/
- **Limitations**: https://www.tradingview.com/pine-script-docs/writing/limitations/

### Visual Elements
- **Plots**: https://www.tradingview.com/pine-script-docs/visuals/plots/
- **Colors**: https://www.tradingview.com/pine-script-docs/visuals/colors/
- **Shapes & Locations**: Referenced in plotshape/plotchar documentation

---

## 🏗️ Architecture Principles

### 1. Validation Strategy: **Hybrid Approach**
**Why**: Balance between accuracy and performance

- ✅ **Regex-based validation** (AccurateValidator)
  - Fast parameter count checking
  - Official TradingView parameter requirements
  - Undefined variable/function/namespace detection
  - Pine Script v6 constant validation

- ❌ **NOT AST-based** (ComprehensiveValidator disabled)
  - Reason: Produces false positives on valid v6 code
  - Example: Incorrectly flags `var float cumPV = na` as error

### 2. Data Sources (Accuracy Priority)

**Manual Overrides (100% Accuracy)**
- File: `v6/parameter-requirements.ts`
- Functions: 32 critical functions (indicator, strategy, plot, input.*, ta.*)
- Source: Hand-verified against official docs

**Auto-Generated (95% Accuracy)**
- File: `v6/parameter-requirements-generated.ts`
- Functions: 457 functions from TradingView main page
- Source: Parsed from https://www.tradingview.com/pine-script-reference/v6/

**Merged Strategy**
- File: `v6/parameter-requirements-merged.ts`
- Manual takes precedence over generated
- Overall accuracy: ~98%

### 3. Constants Recognition

**Pine Script v6 Constants** (`v6/pine-constants.ts`)
- plot.style_* (10 constants): line, linebr, stepline, area, histogram, etc.
- color.* (17 built-ins + 7 functions): red, blue, new(), rgb(), etc.
- shape.* (12 constants): circle, triangleup, triangledown, etc.
- location.* (5 constants): abovebar, belowbar, top, bottom, absolute
- size.* (6 constants): tiny, small, normal, large, huge, auto
- line.style_*, label.style_*, table.*, barstate.*

**Critical**: The validator MUST recognize these as valid:
```pine
plot(close, style=plot.style_line)  // ✅ Valid
color.new(color.red, 50)            // ✅ Valid
plotshape(cond, location=location.abovebar, shape=shape.triangleup)  // ✅ Valid
```

---

## ⚠️ Known Limitations & Constraints

### Compilation Limits (From Official Docs)
- **Max script size**: 80,000 tokens
- **Max variables per scope**: 1,000
- **Max plots**: 64 per script
- **Max security calls**: 40 (64 for Pro)
- **Compilation timeout**: 2 minutes

### Runtime Limits
- **Script execution**: 20s (basic) / 40s (other accounts)
- **Loop execution**: 500ms per bar
- **Historical buffer**: 5,000 bars (10,000 for built-ins)
- **Array/matrix/map size**: 100,000 elements

### Extension Validation Scope
**What We Validate** ✅
- Parameter count (too few/too many)
- Undefined functions and namespaces
- Undefined variables
- Invalid constants (plot.style_*, color.*, etc.)
- Wrong parameter names (shape= vs style= in plotshape)


---


### Script Organization (Recommended Order)
1. License
2. `//@version=6`
3. Declaration statement (indicator/strategy)
4. Import statements
5. Constant declarations
6. Inputs
7. Function declarations
8. Calculations
9. Strategy calls
10. Visuals (plot, plotshape, etc.)
11. Alerts

### Code Style
- **Spacing**: Spaces around operators, after commas
- **Line wrapping**: Non-four-space indentation for readability
- **Typing**: Explicit types recommended (but not required)
- **Comments**: Document complex logic

---

## 🔧 Development Guidelines

### Testing Strategy
1. **Unit Tests** (`test/validation.test.js`)
   - Parameter requirements accuracy
   - Manual vs generated function specs
   - No duplicate parameters

2. **Benchmark Tests** (`test/benchmark.test.js`)
   - Real Pine Script code validation
   - Valid code should NOT produce errors
   - Invalid code MUST produce errors

3. **Fixtures** (`test/fixtures/`)
   - `valid.pine`: All valid v6 syntax (should pass)
   - `invalid.pine`: Known errors (should fail)

### Adding New Validation Rules
1. Check official docs first
2. Add to `v6/parameter-requirements.ts` (manual) if critical
3. Update tests in `test/fixtures/invalid.pine`
4. Add test case in `test/benchmark.test.js`
5. Run `npm test` - must pass 100%

### Handling False Positives
**DO NOT** mark valid v6 code as errors!

**Examples of Valid Code (Must Pass)**:
```pine
var float cumPV = na                    // ✅ Valid - can assign na to typed var
plot(close, style=plot.style_linebr)   // ✅ Valid - plot.style_linebr exists
color.rgb(255, 0, 0)                    // ✅ Valid - color.rgb() function
someVar.tostring()                      // ✅ Valid - if someVar declared
```

---

## 📦 Build & Release Process

### Build Commands
```bash
npm run clean           # Remove dist/ and build/*.vsix
npm run build           # TypeScript compilation
npm test                # Run all tests (must pass)
npm run package         # Create VSIX in build/
npm run rebuild         # Full rebuild with tests
```

### Installation Scripts
```bash
./scripts/install-dev.sh    # Symlink for development
./scripts/install-vsix.sh   # Install from VSIX (auto-detects latest)
./scripts/reload.sh         # Quick rebuild
./scripts/uninstall.sh      # Clean removal
```

### Version Bump Process
1. Update `package.json` version
2. Run `npm run rebuild` (build + test + package)
3. Test VSIX with real Pine Script files
4. Check: No false positives on valid v6 code
5. Install and reload VSCode
6. Verify validation works on examples/

---

## 🐛 Common Issues & Solutions

### Issue: "plot.style_line is undefined"
**Cause**: Constants not recognized by validator
**Fix**: Ensure `v6/pine-constants.ts` imported in validator
**Check**: `isValidNamespaceMember('plot', 'style_line')` returns true

### Issue: "Valid code shows errors"
**Cause**: False positive from validator
**Fix**:
1. Add to `test/fixtures/valid.pine`
2. Update validator logic to skip this case
3. Ensure tests pass

### Issue: "Undefined function not caught"
**Cause**: Function in ALL_FUNCTION_SIGNATURES
**Fix**: Check `v6/parameter-requirements-merged.ts`

---


## 📝 Critical Reminders

1. **ALWAYS** test with real Pine Script v6 examples before release
2. **NEVER** mark official v6 syntax as errors (check docs first!)
3. **UPDATE** tests when adding new validation rules
4. **VERIFY** constants exist in official docs before flagging as invalid
5. **MAINTAIN** 100% test pass rate before packaging VSIX
6. **REFERENCE** official TradingView docs for all validation decisions

---

## 📞 Support & Resources

- **Extension Issues**: GitHub Issues (when published)
- **Pine Script Questions**: TradingView Community
- **Official Docs**: https://www.tradingview.com/pine-script-docs/
- **Test Examples**: `examples/` directory

---

**Last Updated**: 2025-10-04 (v0.2.5)
**Maintainer**: Pine Script Extension Team: JP
**License**: MIT

// Marketplace publishing
Task({
  subagent_type: "general-purpose",
  description: "Publish extension v0.X.Y",
  prompt: `You are the VSCode Extension Publisher Agent. Read .claude/agents/publisher.md for your complete publishing workflow.

Publish extension version 0.X.Y:
1. Verify quality gates (tests, build, self-tests)
2. Bump version in package.json
3. Update CHANGELOG.md
4. Create git tag vX.Y.Z
5. Trigger GitHub Actions publish workflow
6. Monitor and verify marketplace publication

Return publish status and verification results.`
});
