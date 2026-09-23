# Pine Script v6 Validator Enhancement Roadmap

**Archived 2026-09-22.** Superseded by [`ROADMAP.md`](../../ROADMAP.md) at the repo
root. The "Current ~70% → target 95% TradingView parity" figures below were never
measured — no corpus, no TradingView error archive, no parity script ever existed —
treat every percentage in this document as unsupported. Kept for its gap analysis,
which is still an accurate description of what `AccurateValidator` does and does not
check.

**Date**: 2025-10-15
**Version**: 2.0.0 (Comprehensive Validation)
**Based on**: GEMINI.md Pine Script v6 Expert System (now `docs/guides/ai-assistant-context.md`)

---

## 🎯 Executive Summary

The current **AccurateValidator** (v1.0) only validates:
- ✅ Function signatures and parameter counts
- ✅ Namespace references
- ✅ Undefined variables
- ✅ Ternary operator syntax (just added)

But it **DOES NOT** validate:
- ❌ Multi-line statement continuation
- ❌ Execution model violations (var/varip usage)
- ❌ Type system mismatches (series vs simple)
- ❌ Control flow syntax (if/for/while structure)
- ❌ Expression syntax beyond ternary operators
- ❌ Pine Script v6 specific language rules

**Goal**: Build a **comprehensive Pine Script v6 validator** that catches 95%+ of errors that TradingView's compiler catches, BEFORE the user tests in TradingView.

---

## 📊 Current Validator Architecture

### What It Does (Semantic Analysis)
```
AccurateValidator (v1.0)
├── Function signature validation
│   ├── Parameter count checking
│   ├── Required vs optional parameters
│   └── Parameter name validation
├── Namespace validation
│   ├── Known namespace checking (31 namespaces)
│   ├── Member existence validation
│   └── Function name validation (457+ functions)
├── Variable declaration tracking
│   ├── Declaration collection
│   ├── Undefined variable detection
│   └── Reserved keyword checking
└── NEW: Ternary operator syntax
    ├── Semicolon vs colon detection
    ├── Multi-line ternary validation
    └── Nested ternary checking
```

### What It Doesn't Do (Syntax & Language Rules)
- ❌ **Statement continuation**: Multi-line function calls, expressions
- ❌ **Execution model**: var/varip correctness, series behavior
- ❌ **Type system**: series/simple/const compatibility
- ❌ **Control flow**: if/else/switch/for/while syntax
- ❌ **Expression parsing**: Binary operators, method calls, array access
- ❌ **Pine v6 specific rules**: Platform limits, anti-repainting patterns

---

## 🔍 Validation Gap Analysis

### Gap 1: Multi-Line Statement Continuation ⚠️ HIGH PRIORITY

**TradingView Error Observed**:
```
Line 20: Syntax error at input "end of line without line continuation"

strategyMode = input.string("Risk-Averse", "Strategy Mode",
                            options=["Risk-Averse", "Balanced", "Aggressive"])
```

**What's Missing**:
- No validation of multi-line function call formatting
- No check for proper indentation/continuation
- No detection of incomplete parameter lists

**Implementation Needed**:
```typescript
private checkMultiLineFunctionCalls(lines: string[], lineNum: number, lineIndex: number): void {
  // Check if line ends with comma (function call continuation)
  // Validate next line is properly indented
  // Ensure no orphaned parameters
  // Detect incomplete function calls
}
```

**Priority**: 🔴 CRITICAL - Causes compilation failure
**Complexity**: MEDIUM
**Estimated Effort**: 2-3 hours

---

### Gap 2: Ternary Operator Validation ✅ PARTIALLY COMPLETE

**Status**: ✅ Semicolon detection implemented (2025-10-15)

**Still Missing**:
- Complex nested ternaries with multiple levels
- Ternary operators inside array/object literals
- Edge cases with parentheses

**Next Steps**:
- Add more test cases
- Handle edge cases
- Improve error messages

**Priority**: 🟡 MEDIUM - Already 80% complete
**Complexity**: LOW
**Estimated Effort**: 1 hour

---

### Gap 3: Execution Model Validation ❌ NOT IMPLEMENTED

**From GEMINI.md - Critical Concept**:
> Every script executes ONCE PER BAR. Without `var`, variables reset on EVERY bar.

**Common Errors to Detect**:

1. **Accumulator without var**:
```pine
// ❌ WRONG (should warn)
int sum = 0
sum := sum + 1  // Always 1, resets every bar

// ✅ CORRECT
var int sum = 0
sum := sum + 1  // Accumulates properly
```

2. **varip in non-realtime context**:
```pine
// ❌ WRONG (should warn)
varip int tickCount = 0  // Only works in realtime
```

3. **Reassignment without :=**:
```pine
// ❌ WRONG
float price = close
price = close * 2  // Should be price := close * 2
```

**Implementation Needed**:
```typescript
private checkExecutionModel(lines: string[], lineNum: number): void {
  // Detect accumulator patterns without var
  // Warn about varip usage (advanced feature)
  // Check for proper reassignment syntax (:= vs =)
  // Validate series behavior understanding
}
```

**Priority**: 🟡 MEDIUM - Causes logic errors, not compilation errors
**Complexity**: HIGH (requires semantic analysis)
**Estimated Effort**: 4-6 hours

---

### Gap 4: Type System Validation ❌ NOT IMPLEMENTED

**From GEMINI.md - Type Coercion Rules**:
```
- int → float (automatic)
- float → int (requires int() cast)
- series → simple (NOT allowed - will error)
```

**Common Errors to Detect**:

1. **Series passed where simple required**:
```pine
// ❌ WRONG
int length = ta.sma(close, 14)  // ta.sma returns series, but length parameter must be simple
```

2. **Missing type cast**:
```pine
// ❌ WRONG
int value = 3.14  // float → int requires cast

// ✅ CORRECT
int value = int(3.14)
```

**Implementation Needed**:
```typescript
private checkTypeCompatibility(line: string, lineNum: number): void {
  // Track variable types (int/float/bool/string/color)
  // Detect series vs simple mismatches
  // Validate function return type usage
  // Check for required type casts
}
```

**Priority**: 🔴 HIGH - Causes compilation errors
**Complexity**: VERY HIGH (requires full type inference engine)
**Estimated Effort**: 10-15 hours (Major feature)

---

### Gap 5: Control Flow Syntax ❌ NOT IMPLEMENTED

**Missing Validation**:
- `if` statement structure
- `for` loop syntax (to/from, step)
- `while` loop conditions
- `switch` statement format
- Block indentation (optional but recommended)

**Common Errors**:

1. **Malformed if statement**:
```pine
// ❌ WRONG
if condition
result = value  // Missing colon or indentation issue
```

2. **Invalid for loop**:
```pine
// ❌ WRONG
for i = 0; i < 10; i++  // Wrong syntax (C-style not allowed)

// ✅ CORRECT
for i = 0 to 9
```

**Implementation Needed**:
```typescript
private checkControlFlowSyntax(lines: string[], lineNum: number): void {
  // Validate if/else structure
  // Check for/while loop syntax
  // Validate switch statement format
  // Detect missing/extra tokens
}
```

**Priority**: 🟡 MEDIUM - Less common, but causes compilation errors
**Complexity**: MEDIUM
**Estimated Effort**: 3-4 hours

---

### Gap 6: Expression Parsing ❌ NOT IMPLEMENTED

**Missing Validation**:
- Binary operator usage (+, -, *, /, %, and, or)
- Method call syntax (.methodName())
- Array/matrix access ([index], [row, col])
- History reference operators (close[1], high[10])
- Parentheses matching

**Common Errors**:

1. **Invalid operator usage**:
```pine
// ❌ WRONG
bool result = 5 and 10  // 'and' requires bool operands
```

2. **Malformed method call**:
```pine
// ❌ WRONG
myArray.size  // Missing parentheses

// ✅ CORRECT
array.size(myArray)
```

**Implementation Needed**:
```typescript
private checkExpressionSyntax(line: string, lineNum: number): void {
  // Validate operator types (bool and/or, numeric +/-)
  // Check method call syntax
  // Validate array/history access
  // Ensure balanced parentheses
}
```

**Priority**: 🟢 LOW - Most users get this right
**Complexity**: HIGH (requires expression parser)
**Estimated Effort**: 6-8 hours

---

### Gap 7: Pine v6 Specific Rules ❌ NOT IMPLEMENTED

**From GEMINI.md - Platform Limits**:
- Max 64 plots per script
- Max 40 security() calls
- Max 500ms per loop
- Max 80,000 tokens per script

**Implementation Needed**:
```typescript
private checkPlatformLimits(text: string): void {
  // Count plot() calls (max 64)
  // Count request.security() calls (max 40)
  // Warn about potential loop timeout
  // Estimate script token count
}
```

**Priority**: 🟢 LOW - Advanced users only
**Complexity**: LOW
**Estimated Effort**: 2 hours

---

### Gap 8: Anti-Repainting Patterns ❌ NOT IMPLEMENTED

**From GEMINI.md - Critical Pattern**:
```pine
// ❌ WRONG: Repaints on timeframe close
float dailyClose = request.security(syminfo.tickerid, "D", close)

// ✅ CORRECT: Use previous bar to avoid repaint
float dailyClose = request.security(syminfo.tickerid, "D", close[1])
```

**Implementation Needed**:
```typescript
private checkAntiRepaintingPatterns(line: string, lineNum: number): void {
  // Detect request.security without [1] or lookahead parameter
  // Warn about barstate usage without isconfirmed check
  // Flag realtime calculation issues
}
```

**Priority**: 🟡 MEDIUM - Important for strategy accuracy
**Complexity**: MEDIUM
**Estimated Effort**: 2-3 hours

---

## 🎯 Implementation Priority Matrix

| Gap | Priority | Complexity | Effort | Impact | Order |
|-----|----------|------------|--------|--------|-------|
| Multi-Line Continuation | 🔴 CRITICAL | MEDIUM | 2-3h | HIGH | **1st** |
| Type System | 🔴 HIGH | VERY HIGH | 10-15h | HIGH | **2nd** |
| Ternary Operator (complete) | 🟡 MEDIUM | LOW | 1h | MEDIUM | **3rd** |
| Anti-Repainting | 🟡 MEDIUM | MEDIUM | 2-3h | HIGH | **4th** |
| Execution Model | 🟡 MEDIUM | HIGH | 4-6h | MEDIUM | **5th** |
| Control Flow | 🟡 MEDIUM | MEDIUM | 3-4h | MEDIUM | **6th** |
| Expression Parsing | 🟢 LOW | HIGH | 6-8h | LOW | 7th |
| Platform Limits | 🟢 LOW | LOW | 2h | LOW | 8th |

---

## 📋 Phase 1: Critical Fixes (Week 1)

### Milestone 1.1: Multi-Line Continuation (Day 1-2)
**Goal**: Catch the `input.string()` multi-line error

**Tasks**:
1. Implement `checkMultiLineFunctionCalls()`
2. Add tests for multi-line function calls
3. Validate against FlashCrash strategy file
4. Update validator to v1.1.0

**Deliverable**: Validator catches TradingView's "end of line without line continuation" error

---

### Milestone 1.2: Type System Foundation (Day 3-7)
**Goal**: Basic type tracking and validation

**Tasks**:
1. Build type inference engine
   - Track variable declarations with types
   - Infer function return types
   - Handle series vs simple types
2. Implement type compatibility checks
3. Add type coercion validation
4. Create comprehensive type system tests

**Deliverable**: Validator catches series/simple mismatches

---

## 📋 Phase 2: Important Enhancements (Week 2)

### Milestone 2.1: Anti-Repainting Detection
**Goal**: Help users write non-repainting code

**Tasks**:
1. Detect `request.security()` without [1]
2. Check for `lookahead` parameter
3. Validate `barstate.isconfirmed` usage
4. Add warnings with fix suggestions

**Deliverable**: Validator warns about potential repainting issues

---

### Milestone 2.2: Execution Model Validation
**Goal**: Catch var/varip mistakes

**Tasks**:
1. Detect accumulator patterns
2. Validate var keyword usage
3. Check := vs = usage
4. Warn about series behavior

**Deliverable**: Validator helps users understand Pine execution model

---

## 📋 Phase 3: Complete Coverage (Week 3+)

### Remaining Gaps
- Control flow syntax validation
- Expression parsing
- Platform limits checking
- Advanced edge cases

---

## 🤖 Dedicated Pine Script v6 QA Specialist Subagent

### Purpose
Create an **autonomous QA agent** specifically trained on Pine Script v6 rules from GEMINI.md that can:
1. Review Pine Script code for errors
2. Suggest fixes based on best practices
3. Validate against TradingView platform rules
4. Generate test cases
5. Audit validator effectiveness

### Architecture
```
PineScriptQAAgent (Task Tool)
├── Knowledge Base: GEMINI.md (1107 lines)
├── Validation Rules: v6/parameter-requirements-merged.ts
├── Test Suite: Regression tests from TradingView errors
├── Fix Patterns: Common error → fix mappings
└── Audit Mode: Compare validator output vs TradingView results
```

### Implementation
```typescript
// .claude/tasks/pinescript-qa-agent.ts
export const pineScriptQAAgent = {
  type: "general-purpose",
  prompt: `
You are a Pine Script v6 QA specialist with deep knowledge of:
- GEMINI.md (complete v6 language rules)
- All 6,665 language constructs
- TradingView platform limitations
- Common error patterns and fixes

Your mission:
1. Analyze provided Pine Script code
2. Identify syntax, semantic, and best practice violations
3. Compare AccurateValidator output against actual TradingView errors
4. Suggest specific fixes with line numbers
5. Generate regression test cases for validator

Use GEMINI.md as your authoritative reference for all v6 rules.
`,
  tools: ["Read", "Grep", "Glob", "Write"]
};
```

### Usage
```bash
# Review a Pine Script file
claude task pinescript-qa-agent "Review examples/FlashCrashDetection/FlashCrashStrategy.pine"

# Audit validator effectiveness
claude task pinescript-qa-agent "Compare validator output vs TradingView errors for FlashCrashStrategy.pine"

# Generate test cases
claude task pinescript-qa-agent "Generate regression tests for multi-line function call errors"
```

---

## 🧪 Comprehensive Test Suite

### Test Categories

1. **Syntax Tests** (100 cases)
   - Multi-line statements
   - Ternary operators
   - Control flow
   - Expression syntax

2. **Semantic Tests** (50 cases)
   - Type mismatches
   - Undefined variables
   - Namespace errors
   - Function parameter errors

3. **Execution Model Tests** (30 cases)
   - var/varip usage
   - Series behavior
   - Reassignment syntax

4. **Best Practice Tests** (20 cases)
   - Anti-repainting patterns
   - Performance optimization
   - Platform limits

5. **Regression Tests** (TradingView Error Archive)
   - Real errors caught by TradingView
   - Each with: error file, TradingView error message, expected validator output

### Test Structure
```
tests/validator/
├── syntax/
│   ├── multi-line-function-calls.test.ts
│   ├── ternary-operators.test.ts
│   ├── control-flow.test.ts
│   └── expressions.test.ts
├── semantic/
│   ├── type-system.test.ts
│   ├── namespaces.test.ts
│   └── variables.test.ts
├── execution-model/
│   ├── var-usage.test.ts
│   └── series-behavior.test.ts
├── best-practices/
│   ├── anti-repainting.test.ts
│   └── performance.test.ts
└── regression/
    ├── tradingview-errors-archive.json
    └── regression.test.ts
```

---

## 📈 Success Metrics

### Validation Accuracy
- **Target**: 95% match with TradingView compiler
- **Current**: ~70% (function signatures, namespaces only)
- **Phase 1 Goal**: 85% (add multi-line + type system)
- **Phase 2 Goal**: 90% (add anti-repainting + execution model)
- **Phase 3 Goal**: 95% (complete coverage)

### Error Detection Rate
- **True Positives**: Errors caught by both validator and TradingView
- **False Positives**: Errors caught by validator but accepted by TradingView
- **False Negatives**: Errors missed by validator but caught by TradingView
- **True Negatives**: Valid code accepted by both

**Target Rates**:
- True Positive Rate: > 95%
- False Positive Rate: < 5%
- False Negative Rate: < 5%

### User Experience
- **Validation Speed**: < 100ms for average script (238 lines)
- **Error Message Quality**: Clear, actionable, with line numbers
- **Fix Suggestions**: Provide corrected code when possible

---

## 🚀 Next Steps

### Immediate (This Session)
1. ✅ Document comprehensive validation gaps (this document)
2. ⏳ Implement multi-line function call validation
3. ⏳ Test against FlashCrash strategy with known TradingView errors
4. ⏳ Update validator version to 1.1.0

### Short-term (This Week)
5. Implement type system foundation
6. Create Pine Script QA specialist subagent
7. Build regression test suite with TradingView error archive
8. Release validator v1.2.0 with type system

### Medium-term (Next 2-3 Weeks)
9. Complete anti-repainting detection
10. Implement execution model validation
11. Add control flow syntax checking
12. Release validator v2.0.0 (comprehensive validation)

### Long-term (Ongoing)
13. Continuously add regression tests from user reports
14. Maintain parity with TradingView compiler updates
15. Expand QA agent capabilities
16. Build validator performance dashboard

---

## 📚 References

- **GEMINI.md**: Pine Script v6 Expert System (1107 lines)
- **TradingView Docs**: https://www.tradingview.com/pine-script-docs/
- **Language Reference**: https://www.tradingview.com/pine-script-reference/v6/
- **Extension Repo**: https://github.com/jpantsjoha/pinescript-vscode-extension
- **Validator Source**: `src/parser/accurateValidator.ts`

---

**Status**: 📝 PLANNING COMPLETE - READY FOR IMPLEMENTATION
**Next Action**: Implement multi-line function call validation (Gap 1)
**Owner**: Development Team
**Timeline**: 3-week phased rollout
**Version Target**: v2.0.0 (Comprehensive Validation)
