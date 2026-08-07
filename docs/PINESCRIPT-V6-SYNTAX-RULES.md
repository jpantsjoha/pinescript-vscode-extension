# Pine Script v6 — Syntax & Style Reference

> **Canonical source of truth** for all AI agents, linters, and workflows in this project.
> Cross-referenced from: `.CLAUDE.md`, `GEMINI.md`, `.agent/rules/pinescript-v6.md`

**Official Sources:**
- [Pine Script Docs](https://www.tradingview.com/pine-script-docs/)
- [v6 Language Reference](https://www.tradingview.com/pine-script-reference/v6/)
- [v5 → v6 Migration Guide](https://www.tradingview.com/pine-script-docs/migration-guides/v5-to-v6/)
- [codenamedevan/pinescriptv6](https://github.com/codenamedevan/pinescriptv6) — LLM-optimized reference

---

## 1. Script Structure (Required Order)

Every `.pine` file **must** follow this section order:

```pine
//@version=6                           // 1. Version annotation (REQUIRED, first line)

indicator("Title", overlay=true)       // 2. Declaration (indicator or strategy)

import user/library/1 as lib           // 3. Imports

type MyType                            // 4. Type definitions
    float value

const int LOOKBACK = 20                // 5. Constants

int len = input.int(14, "Length")      // 6. Inputs (grouped together)

myFunc(float x) =>                     // 7. Function definitions
    x * 2

var float state = 0.0                  // 8. Variables (var/varip declarations)

float sma = ta.sma(close, len)        // 9. Calculations

if condition                           // 10. Strategy calls (if strategy)
    strategy.entry("Long", strategy.long)

plot(sma, "SMA", color=color.blue)    // 11. Visuals (plot, plotshape, bgcolor, tables)

alertcondition(cond, "Alert", "Msg")  // 12. Alerts
```

---

## 2. Multi-line Syntax Rules

### ⚠️ CRITICAL: No trailing whitespace after continuation operators

TradingView's compiler throws **"Syntax error at input 'end of line without line continuation'"** when a line ends with an operator followed by trailing spaces before the newline.

```pine
// ❌ WRONG — trailing space after `+` causes syntax error
htf_score = (a * 0.3) +·
            (b * 0.3) +·
            (c * 0.4)

// ✅ CORRECT — collapse to single line
htf_score = (a * 0.3) + (b * 0.3) + (c * 0.4)

// ✅ ALSO CORRECT — use intermediate variables
part_a = a * 0.3
part_b = b * 0.3
part_c = c * 0.4
htf_score = part_a + part_b + part_c
```

### Best practice: Prefer single-line expressions or intermediate variables

If a line exceeds ~120 characters, break into named intermediate variables instead of multi-line continuation. This avoids continuation bugs and improves readability.

---

## 3. `ta.*` Consistency Rule

### ⚠️ CRITICAL: All `ta.*` functions must execute on EVERY bar

TradingView requires that `ta.*` functions are called on every bar for consistent results. They **must not** be called conditionally inside `if` blocks or ternary operators.

```pine
// ❌ WRONG — ta.sma called conditionally, inconsistent execution
k = cond_a ? ta.sma(k0, 3) : cond_b ? ta.sma(k0, 4) : ta.sma(k0, smoothK)

// ✅ CORRECT — all ta.sma calls execute every bar, then select result
k_fast = ta.sma(k0, 3)
k_med  = ta.sma(k0, 4)
k_slow = ta.sma(k0, smoothK)
k = cond_a ? k_fast : cond_b ? k_med : k_slow
```

This applies to: `ta.sma`, `ta.ema`, `ta.rsi`, `ta.atr`, `ta.stoch`, `ta.macd`, `ta.crossover`, `ta.crossunder`, `ta.bb`, `ta.dmi`, and **all** `ta.*` functions.

---

## 4. `request.security()` Best Practices

### Cache in variables — never inline duplicate calls

```pine
// ❌ WRONG — same security call duplicated (wastes budget, risks inconsistency)
trend = math.abs((close_htf - request.security(sym, tf, ta.sma(close, 50))) / request.security(sym, tf, ta.sma(close, 50))) * 100

// ✅ CORRECT — cache the security call
htf_sma50 = request.security(sym, tf, ta.sma(close, 50))
trend = nz(htf_sma50, 0) != 0 ? math.abs((close_htf - htf_sma50) / htf_sma50) * 100 : 0
```

### Anti-repainting: Use `[1]` for higher timeframe data

```pine
// ❌ WRONG — repaints on current bar close
daily_close = request.security(syminfo.tickerid, "D", close)

// ✅ CORRECT — uses previous bar's confirmed close
daily_close = request.security(syminfo.tickerid, "D", close[1])
```

### Division-by-zero guards

Always wrap security-derived divisions with `nz()`:

```pine
htf_val = request.security(syminfo.tickerid, htf, ta.sma(close, 50))
ratio = nz(htf_val, 0) != 0 ? (close - htf_val) / htf_val : 0
```

### Budget: Max 40 calls (64 for Pro/Premium)

Count all `request.security()` calls in your script. Exceeding the limit causes a compilation error.

---

## 5. Function Definition Rules

### Typed parameters and return types

```pine
// Simple function
calcRange() =>
    high - low

// Typed parameters
calcRange(float multiplier) =>
    (high - low) * multiplier

// Explicit return type
calcRange(float multiplier) : float =>
    (high - low) * multiplier
```

### Tuple returns

```pine
[diplus, diminus, adx] = ta.dmi(14, 14)
```

### Single-line function body for ternary chains

```pine
// ❌ WRONG — multi-line ternary in function body can cause continuation errors
myColor(int h) =>
    h >= 7 ? color.green : h >= 4 ? color.orange :
    h >= 2 ? color.red : color.purple

// ✅ CORRECT — single-line ternary chain
myColor(int h) =>
    h >= 7 ? color.green : h >= 4 ? color.orange : h >= 2 ? color.red : color.purple
```

---

## 6. Constants Registry

### Plot Styles (`plot.style_*`)

| Constant | Description |
|----------|-------------|
| `plot.style_line` | Continuous line (default) |
| `plot.style_linebr` | Line with breaks on `na` |
| `plot.style_stepline` | Step line |
| `plot.style_steplinebr` | Step line with breaks |
| `plot.style_steplinediamond` | Step line with diamonds |
| `plot.style_histogram` | Histogram bars |
| `plot.style_cross` | Crosses |
| `plot.style_area` | Filled area |
| `plot.style_areabr` | Area with breaks |
| `plot.style_columns` | Columns |
| `plot.style_circles` | Circles |

### Shape Constants (`shape.*`)

`shape.xcross` · `shape.cross` · `shape.circle` · `shape.triangleup` · `shape.triangledown` · `shape.flag` · `shape.arrowup` · `shape.arrowdown` · `shape.labelup` · `shape.labeldown` · `shape.square` · `shape.diamond`

### Location Constants (`location.*`)

`location.abovebar` · `location.belowbar` · `location.top` · `location.bottom` · `location.absolute`

### Size Constants (`size.*`)

`size.auto` · `size.tiny` · `size.small` · `size.normal` · `size.large` · `size.huge`

### Color Constants (`color.*`)

`color.aqua` · `color.black` · `color.blue` · `color.fuchsia` · `color.gray` · `color.green` · `color.lime` · `color.maroon` · `color.navy` · `color.olive` · `color.orange` · `color.purple` · `color.red` · `color.silver` · `color.teal` · `color.white` · `color.yellow`

**Color functions:** `color.new(color, transp)` · `color.rgb(r, g, b, transp)` · `color.from_gradient()`

---

## 7. Plotting Rules

### `plotshape()` — uses `style=`, NOT `shape=`

```pine
// ❌ WRONG — common error
plotshape(cond, shape=shape.triangleup)

// ✅ CORRECT
plotshape(cond, style=shape.triangleup, location=location.belowbar)
```

### Transparency — use `color.new()`, NOT `transp` parameter

```pine
// ❌ WRONG (deprecated)
bgcolor(color.green, transp=90)

// ✅ CORRECT
bgcolor(color.new(color.green, 90))
```

---

## 8. Variable Declaration

| Modifier | Behaviour | Use Case |
|----------|-----------|----------|
| *(none)* | Recalculated every bar | Current bar calculations |
| `var` | Initialized once on first bar, persists | Accumulating state across bars |
| `varip` | Persists across real-time ticks | Tick-level tracking |

### `na` initialization

```pine
var float highestPrice = na
highestPrice := math.max(nz(highestPrice), high)
```

---

## 9. Platform Limits

| Limit | Value |
|-------|-------|
| Max script size | 80,000 tokens |
| Max variables per scope | 1,000 |
| Max plots | 64 per script |
| Max `request.security()` calls | 40 (64 Pro/Premium) |
| Compilation timeout | 2 minutes |
| Script execution | 20s (basic) / 40s (other) |
| Loop execution | 500ms per bar |
| Historical buffer | 5,000 bars (10,000 built-ins) |
| Array/matrix/map size | 100,000 elements |

---

## 10. v5 → v6 Migration Checklist

- [ ] Update `//@version=5` → `//@version=6`
- [ ] Replace `plot.style_dashed` → `plot.style_linebr`
- [ ] Replace `resolution` → `timeframe.period`
- [ ] Remove `scale` parameter → use `display` instead
- [ ] Replace `transp` parameter → `color.new(col, transparency)`
- [ ] Verify all namespace constants exist in v6
- [ ] Check `study()` → `indicator()`

---

## 11. Common Pitfalls Summary

| Pitfall | Root Cause | Fix |
|---------|-----------|-----|
| "end of line without line continuation" | Trailing whitespace after `+`/`:` before newline | Collapse to single line or use intermediate variables |
| "ta.sma should be called on each calculation" | `ta.*` called inside ternary/if | Extract all `ta.*` calls to run unconditionally |
| Division by zero on `request.security()` result | Security call returns `na` on first bars | Wrap with `nz(val, 0) != 0 ? ...` guard |
| Duplicate security calls waste budget | Same `request.security()` inlined multiple times | Cache in a variable |
| `plotshape` "Unknown parameter 'shape'" | Using `shape=` instead of `style=` | Use `style=shape.triangleup` |
| Repainting on higher timeframe data | Using current bar close from security | Use `close[1]` in security expression |
| "Undefined variable" after `if` block | Variable only assigned inside `if` | Declare with `var` or assign default before `if` |

---

## 12. Validation Commands

```bash
# Build the extension (required before validation)
npm run build

# Validate all example .pine files
node dev-tools/testing/validate-all-examples.js

# Validate a specific file
node dev-tools/testing/qa-validate-pinescript.js examples/myfile.pine

# Full QA pass
npm test
```

---

*Last updated: 2026-02-15 · Applies to Pine Script v6 only*
