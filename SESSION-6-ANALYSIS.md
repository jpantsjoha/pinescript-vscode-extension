# Session 6 Analysis - Variable Declaration & Scoping Issues

**Date:** 2025-10-06
**Current Errors:** 351
**Actual Problem:** Variable declarations not being recognized (not user-defined function return types)

---

## Problem Re-Analysis

### Original Priority 5 Assumption (WRONG)
- **Assumed:** User-defined functions return `unknown`, causing cascading errors
- **Reality:** User-defined function return type inference ALREADY WORKS (tested with test-func-return-types.pine)

### Actual Root Cause (CORRECT)

**tun-satiroglu.pine has 178 errors, analysis shows:**
1. **60x "Type mismatch: cannot apply '>' to unknown and int"**
   - Variables like `longStop`, `doji4price`, `highPrice`, `lowPrice` have `unknown` type
   - These are simple variable declarations: `doji4price = open == close and open == low and open == high`
   - Parser/validator not recognizing these declarations

2. **Many "Undefined variable" errors**
   - Variables `showindis` (13x), `searchdiv` (8x), `longStopPrev` (5x), etc.
   - These ARE declared in the file but not being found by symbol table

---

## Root Cause Investigation

### Test Case 1: Simple Variable Declaration
```pine
doji4price = open == close and open == low and open == high
```
**Result:** Variable declared, but might not be recognized in if statement context

### Test Case 2: Variable Reassignment
```pine
longStop = src - atr
if longStop > 0
    longStop := longStopPrev
```
**Problem:** `longStop` declared outside if block, reassigned inside with `:=`

### Test Case 3: Ternary Assignments
```pine
highPrice = wicks ? high : close
lowPrice = wicks ? low : close
```
**Problem:** Variables assigned from ternary expressions not getting correct types

---

## Hypothesis: Multi-Line Parsing vs Inline Declarations

Looking at lines 112-125 in tun-satiroglu.pine:
```pine
112: highPrice = wicks ? high : close
113: lowPrice = wicks ? low : close
114: doji4price = open == close and open == low and open == high
115:
116: longStop = src - atr
117: longStopPrev = nz(longStop[1], longStop)
118:
119: if longStop > 0
120:     if doji4price          // ❌ ERROR: Undefined variable 'doji4price'
121:         longStop := longStopPrev  // ❌ ERROR: Undefined variable 'longStopPrev'
```

**The pattern:**
- Variables declared at top level (lines 112-117)
- Used inside if statement (lines 120-121)
- NOT FOUND by validator

---

## Debugging Steps

### Step 1: Check if variables are being collected
Run test to see if `collectDeclarations()` is finding these variables:
```javascript
const ast = parser.parse(code);
const validator = new ComprehensiveValidator();
// Add logging to see what's in symbol table
```

### Step 2: Check scope handling
- Are top-level declarations in global scope?
- Does if-statement create new scope that can't see parent variables?
- Is there an issue with scope lookup?

### Step 3: Check if-statement parsing
- Are if-statement bodies being parsed correctly?
- Are variables inside if blocks looking up parent scope?

---

## Likely Issues

### Issue 1: Two-Pass Not Covering All Statements
In `comprehensiveValidator.ts`, `collectDeclarations` only runs on:
- `VariableDeclaration` statements
- `FunctionDeclaration` statements

But in Pine Script, ANY expression can be a statement:
```pine
doji4price = open == close  // This is an ExpressionStatement, not VariableDeclaration!
```

The parser might be treating `doji4price = ...` as an **ExpressionStatement** (with an assignment expression), not a **VariableDeclaration**.

### Issue 2: Assignment vs Declaration
Pine Script doesn't distinguish between declaration and assignment syntactically:
```pine
x = 5         // First use: declaration
x := 10       // Reassignment
```

The parser needs to:
1. Recognize `=` on first use as declaration
2. Recognize `:=` as reassignment
3. Add first-use variables to symbol table

---

## Solution Strategy

### Phase A: Fix Variable Declaration Recognition (HIGH IMPACT)
**Problem:** `x = value` treated as ExpressionStatement, not VariableDeclaration

**Fix:** In `collectDeclarations()`, handle ExpressionStatement with AssignmentExpression:
```typescript
private collectDeclarations(statement: Statement): void {
  if (statement.type === 'VariableDeclaration') {
    // existing logic
  } else if (statement.type === 'ExpressionStatement') {
    const expr = statement.expression;
    if (expr.type === 'AssignmentExpression' && expr.operator === '=') {
      // This is a variable declaration!
      const varName = expr.left.name;
      const varType = this.inferExpressionType(expr.right);
      this.symbolTable.define({
        name: varName,
        type: varType,
        // ...
      });
    }
  } else if (statement.type === 'FunctionDeclaration') {
    // existing logic
  }
}
```

**Expected Impact:** -80 to -100 errors (most "Undefined variable" errors)

### Phase B: Better Type Inference for Complex Expressions
**Problem:** Variables assigned from complex expressions get `unknown` type

**Examples:**
```pine
doji4price = open == close and open == low and open == high  // Should be: bool
highPrice = wicks ? high : close   // Should be: series<float>
longStop = src - atr               // Should be: series<float>
```

**Fix:** Enhance `inferExpressionType()` for:
1. Binary logical expressions (`and`, `or`) → `bool` or `series<bool>`
2. Ternary expressions with known types
3. Binary arithmetic with built-in variables

**Expected Impact:** -30 to -50 errors (type mismatch errors)

### Phase C: Fix Scope Lookup in Nested Blocks
**Problem:** Variables declared in parent scope not visible in if/while/for blocks

**Fix:** Ensure `symbolTable.lookup()` searches parent scopes correctly

**Expected Impact:** -10 to -20 errors

---

## Revised Priority 5 Plan

### Target: 351 → ~250 errors (-101, -28.8%)

| Phase | Description | Expected Reduction | Remaining |
|-------|-------------|-------------------|-----------|
| Start | Current state | - | 351 |
| A | Fix variable declaration recognition | -80 | 271 |
| B | Better type inference for expressions | -40 | 231 |
| C | Fix scope lookup | -10 | 221 |
| **Total** | **Session 6** | **-130** | **~221** |

---

## Testing Strategy

### Test 1: Simple Variable Declaration
```pine
//@version=6
indicator("Test")
x = 5
y = x + 10
plot(y)
```
Should have 0 errors.

### Test 2: Variable in If Statement
```pine
//@version=6
indicator("Test")
flag = close > open
if flag
    plot(close)
```
Should have 0 errors.

### Test 3: Complex Expression Assignment
```pine
//@version=6
indicator("Test")
doji = open == close and open == low
if doji
    bgcolor(color.yellow)
```
Should have 0 errors, `doji` should be typed as `series<bool>`.

---

## Next Steps

1. Add logging to `collectDeclarations()` to see what's being collected
2. Check AST structure for `x = 5` (is it ExpressionStatement or VariableDeclaration?)
3. Implement Phase A fix
4. Test on tun-satiroglu.pine
5. Implement Phases B & C if needed

---

**Status:** Analysis complete, ready to implement Phase A

**Last Updated:** 2025-10-06
