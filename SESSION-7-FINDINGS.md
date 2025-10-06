# Session 7: Root Cause Analysis - Named Argument Parsing Bug

**Date:** 2025-10-06
**Branch:** `feature/session-7-large-file-variable-recognition`
**Status:** ROOT CAUSE IDENTIFIED

---

## Critical Bug Found

### Symptom
- Variables declared in source code but reported as "undefined"
- 178/351 errors (50.7%) in tun-satiroglu.pine
- Parser skips 60-80 lines at a time (7 large gaps)

### Root Cause
**Named argument parsing failure in `finishCall()` method**

When parser encounters:
```pine
plot(close, color = color.gray, title = 'Test')
```

The parser FAILS and calls `synchronize()`, which skips ALL subsequent lines until it finds a "safe" recovery point (like an if statement or function).

### Evidence

**Debug logging added to parser.ts line 26-28:**
```
[PARSER ERROR] Line 61: Expected ")" after arguments at line 61
[PARSER ERROR] Line 144: Expected ")" after arguments at line 144
[PARSER ERROR] Line 254: Expected ")" after arguments at line 254
... (19 total parsing errors)
```

**AST Coverage Gaps:**
```
Lines 58-119 (61 lines skipped)
Lines 142-201 (59 lines skipped)
Lines 275-341 (66 lines skipped)
... (7 total gaps)
```

**All problematic variables ARE in these gaps:**
- Line 117: `longStopPrev` - IN GAP (58-119)
- Line 181: `repaint` - IN GAP (142-201)
- Line 297: `prd` - IN GAP (275-341)
- Line 299: `searchdiv` - IN GAP (275-341)
- Line 300: `showindis` - IN GAP (275-341)
- Line 306: `dontconfirm` - IN GAP (275-341)

### Parser Logic Issue

**Location:** `src/parser/parser.ts` lines 607-635 (`finishCall()` method)

**Current code:**
```typescript
if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.ASSIGN) {
  const name = this.advance().value;  // consume arg name
  this.advance(); // consume =
  const value = this.expression();    // ❌ BUG: doesn't parse full expression
  args.push({ name, value });
}
```

**Why it fails:**
When parsing `color = color.gray`:
1. Detects `color` followed by `=` → named argument
2. Consumes `color` and `=`
3. Calls `expression()` which might not consume the full member expression
4. Returns with unparsed tokens (`.gray, title = ...`)
5. Expects `)` but finds `.` or `,`
6. Throws "Expected )" error
7. Parser catches error, calls `synchronize()`
8. Skips 60+ lines of valid code

### Impact Analysis

**Files Affected:**
- tun-satiroglu.pine: 178 errors → ~80-90 expected errors after fix
- Any file with named arguments containing member expressions, ternaries, or complex values

**Estimated Fix Impact:**
- Direct: -90 to -100 errors from variables being recognized
- Indirect: -40 to -50 errors from correct type inference
- **Total: ~351 → ~210 errors (-140, -40%)**

---

## Investigation Tools Created

1. `debug-large-file.js` - Found variables missing from AST
2. `find-variable-statements.js` - Confirmed declarations exist in source
3. `check-ast-coverage.js` - Identified 7 large gaps in parsing
4. `check-specific-vars.js` - Verified none of problematic vars in AST
5. Modified `parser.ts` - Added debug logging to expose silent errors

---

## Fix Strategy

### Option 1: Fix expression() parsing (Complex)
Ensure `expression()` fully consumes member expressions, ternaries, etc.

**Pros:** Addresses root cause
**Cons:** May have side effects on other parsing

### Option 2: Better error recovery (Band-aid)
Don't skip as many lines in `synchronize()`

**Pros:** Reduces damage from errors
**Cons:** Doesn't fix actual parsing bug

### Option 3: Rewrite named argument parsing (Robust)
Use a more robust approach that handles complex expressions

**Pros:** Proper fix
**Cons:** More code changes

### Recommended: Option 1 + Improved synchronize()

1. **Fix `expression()` to fully consume expressions** in named argument context
2. **Improve `synchronize()`** to not skip as aggressively
3. **Add tests** for named arguments with complex values

---

## Next Steps

1. **Implement fix** for named argument parsing
2. **Test** on tun-satiroglu.pine (expect -140 errors)
3. **Validate** no regressions on other files
4. **Commit** fix with detailed explanation
5. **Create PR** via gh pr create

---

## Files Modified

- `src/parser/parser.ts` - Added debug logging (lines 26-28)

## Files Created

- `debug-large-file.js`
- `find-variable-statements.js`
- `check-ast-coverage.js`
- `check-specific-vars.js`
- `test-named-args.pine`
- `test-plot-parsing.pine`
- `test-plot-parsing.js`
- `SESSION-7-FINDINGS.md` (this file)

---

**Status:** Ready to implement fix
**Last Updated:** 2025-10-06
