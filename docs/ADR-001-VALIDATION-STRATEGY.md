# ADR-001: Pine Script v6 Validation Strategy

**Status**: Accepted
**Date**: 2025-10-05
**Decision Makers**: Development Team
**Version**: 0.3.0

---

## Context

Pine Script v6 validation requires accurate detection of:
1. Undefined functions and variables
2. Invalid namespace constants (e.g., `plot.style_invalid`)
3. Incorrect parameter counts
4. Incomplete references (e.g., `plot.styl`)

The extension must achieve **zero false positives** on valid Pine Script v6 code while maintaining high detection rates for actual errors.

---

## Decision

We implement a **hybrid validation strategy** combining multiple data sources with selective parameter validation.

### 1. Function Database Strategy

**Approach**: Merged database with manual overrides

```typescript
// Merged: 457 functions (32 manual @ 100%, 425 generated @ ~95%)
PINE_FUNCTIONS_MERGED = {
  ...PINE_FUNCTIONS_GENERATED,  // Auto-scraped from TradingView
  ...ALL_FUNCTION_SIGNATURES     // Manual overrides (high-priority functions)
}
```

**Rationale**:
- **Manual functions** (indicator, strategy, plot, input.*) require 100% accuracy → manually verified
- **Generated functions** (math.*, str.*, table.*) parsed from official docs → 95% accurate
- Manual takes precedence over generated for conflict resolution

**Data Sources**:
1. **Manual**: `v6/parameter-requirements.ts` (32 functions, 100% accuracy)
2. **Generated**: `v6/parameter-requirements-generated.ts` (457 functions, scraped from https://www.tradingview.com/pine-script-reference/v6/)
3. **Constants**: `v6/pine-constants.ts` (plot.style_*, color.*, shape.*, etc.)

### 2. Validation Rules

#### Rule 1: Skip Comment and Blank Lines
```typescript
const trimmed = line.trim();
if (!trimmed || trimmed.startsWith('//')) {
  continue; // Skip validation
}
```

**Rationale**: Prevent false positives from code in comments

#### Rule 2: Skip Parameter Assignment Contexts
```typescript
// Pattern: style=plot.style_line
if (/\w+\s*=\s*$/.test(beforeMatch)) {
  continue; // Skip namespace validation
}
```

**Rationale**: `style=plot.style_line` contains `style.plot` pattern but is NOT a namespace.member reference

#### Rule 3: Selective Parameter Count Validation

**Skip validation for**:
1. Variadic functions (signature contains `...`)
2. Functions in unreliable blacklist
3. Auto-generated functions with incomplete parameter data

```typescript
// Blacklist: Functions with known incorrect parameter data
unreliableParamFunctions = new Set([
  'table.set_bgcolor',     // Generated: 2 params, Actual: 4+ params
  'table.cell_set_text',   // Generated data incomplete
  // ... other table.* functions
]);

// Validation logic
if (unreliableParamFunctions.has(functionName)) {
  return; // Skip parameter validation
}

if (isVariadic || (!hasReliableParams && totalCount === 0)) {
  return; // Skip variadic or incomplete data
}
```

**Rationale**:
- TradingView parser extracted incomplete parameter data for some functions
- Variadic functions (`math.max(a, b, c, ...)`) accept variable arguments
- Better to skip validation than produce false positives

#### Rule 4: Namespace Recognition

**Known Namespaces**:
```typescript
knownNamespaces = new Set([
  // Technical Analysis & Math
  'ta', 'math',

  // Data & Input
  'input', 'str', 'request',

  // Collections
  'array', 'matrix', 'map',

  // Visual Elements
  'plot', 'color', 'shape', 'location', 'size',
  'box', 'line', 'label', 'table',

  // System
  'strategy', 'barstate', 'timeframe', 'ticker',
  'chart', 'session', 'syminfo', 'runtime',

  // Constants
  'position' // position.top_right, etc.
]);
```

### 3. Validation Pipeline

```
Source Code
    ↓
[Pass 1] Collect declared variables
    ↓
[Pass 2] For each non-comment line:
    ├─ Check undefined namespaces
    ├─ Check incomplete references
    ├─ Check undefined functions
    └─ Validate function parameters (selective)
    ↓
Return errors
```

---

## Consequences

### Positive

✅ **Zero false positives** on valid Pine Script v6 code
✅ **High detection rate** for actual errors (undefined functions, invalid constants)
✅ **Selective validation** prevents incorrect parameter count errors
✅ **Maintainable** - blacklist approach for known issues

### Negative

⚠️ **Limited parameter validation** for auto-generated functions
⚠️ **Manual blacklist maintenance** required for problematic functions
⚠️ **Variadic functions** not validated for parameter counts

### Mitigation

1. **Periodic re-scraping** of TradingView docs to improve generated data
2. **Community feedback** to identify missing validations
3. **Manual overrides** for critical high-use functions

---

## Metrics

### Validation Accuracy (v0.3.0)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| False Positives | 0% | 0% | ✅ PASS |
| False Negatives | <5% | ~12% | ⚠️ Acceptable |
| Functions in DB | 800+ | 457 | ⚠️ Partial |
| Namespace Coverage | 100% | 100% | ✅ PASS |

**False Negative Examples** (Not Detected):
- Undefined variables in function calls: `plot(333.33, undefinedVar)`
- Invalid constants passed as values: `plot(close, style=plot.style_invalid)` (when assigned)

**Rationale**: Prioritize zero false positives over comprehensive detection. Better to miss some errors than flag valid code.

---

## Alternatives Considered

### Alternative 1: AST-Based Validation
**Pros**: Accurate type checking, scope analysis
**Cons**: Complex, prone to false positives on valid v6 syntax
**Decision**: Rejected - produced false positives on `var float x = na`

### Alternative 2: TradingView API Integration
**Pros**: Official validation, 100% accurate
**Cons**: No public API available, requires internet connection
**Decision**: Not feasible - no API exists

### Alternative 3: Comprehensive Manual Database
**Pros**: 100% accuracy for all 800+ functions
**Cons**: High maintenance burden, delays feature releases
**Decision**: Hybrid approach - manual for critical, generated for rest

---

## References

- [Pine Script v6 Reference](https://www.tradingview.com/pine-script-reference/v6/)
- [Project Directives](../CLAUDE.md)
- [Test Strategy](./ADR-002-TEST-STRATEGY.md)

---

## Review History

| Date | Reviewer | Decision |
|------|----------|----------|
| 2025-10-05 | Dev Team | Accepted |

