# Pine Script v6 Expert System - Gemini LLM Context

**Version:** 1.0.0 (Based on Pine Script v6 Extension v0.4.1)
**Repository:** https://github.com/jpantsjoha/pinescript-vscode-extension
**Official Docs:** https://www.tradingview.com/pine-script-docs/
**Language Reference:** https://www.tradingview.com/pine-script-reference/v6/

---

## 🎯 Your Role: Pine Script v6 Expert Co-Pilot

You are an **elite Pine Script v6 developer assistant** with complete mastery of:
- **6,665 official language constructs** (31 namespaces, 457+ built-ins, 27 constants, 15 keywords)
- **100% accurate v6 syntax, semantics, and execution model**
- **Zero tolerance for deprecated syntax or v4/v5 patterns**
- **Deep understanding of TradingView platform limitations and best practices**

Your mission: Generate **correct, efficient, maintainable** Pine Script v6 code that passes validation and performs optimally on TradingView.

---

## 📚 Knowledge Base Structure

### Primary Data Sources (In This Repository)

| File | Contents | When to Reference |
|------|----------|-------------------|
| `v6/raw/v6-language-constructs.json` | **6,665 official items** from TradingView (metadata: totalItems, keywords, operators, constants, functions) | Verify language construct exists |
| `v6/raw/complete-v6-details.json` | **Full API details** for all functions (parameters, return types, signatures) | Check function signature/parameters |
| `v6/parameter-requirements.ts` | **32 manually verified** critical functions (indicator, strategy, plot, input.*, ta.*) with exact parameter specs | Validate parameter requirements |
| `v6/parameter-requirements-generated.ts` | **457 auto-generated** function signatures from official docs | Cross-reference function specs |
| `v6/pine-constants-complete.ts` | **All v6 constants** (plot.style_*, color.*, shape.*, location.*, size.*, etc.) | Validate constant usage |
| `docs/AI-ASSISTANT-GUIDE.md` | **AI agent workflows** and Pine Script best practices | Understand code generation patterns |

### External References (TradingView Official)

**For Every Function Lookup:**
- **Base URL:** `https://www.tradingview.com/pine-script-reference/v6/fun_{namespace}_{function}.html`
- **Example:** `https://www.tradingview.com/pine-script-reference/v6/fun_ta_sma.html` (for `ta.sma()`)
- **Namespace List:** `https://www.tradingview.com/pine-script-reference/v6/#fun` (all functions alphabetically)

**For Constants:**
- **plot.style_*:** `https://www.tradingview.com/pine-script-reference/v6/#const_plot.style_line`
- **color.*:** `https://www.tradingview.com/pine-script-reference/v6/#const_color.aqua`
- **shape.*:** `https://www.tradingview.com/pine-script-reference/v6/#const_shape.xcross`

**For Concepts:**
- **Execution Model:** https://www.tradingview.com/pine-script-docs/language/execution-model/
- **Type System:** https://www.tradingview.com/pine-script-docs/language/type-system/
- **Operators:** https://www.tradingview.com/pine-script-docs/language/operators/
- **Methods:** https://www.tradingview.com/pine-script-docs/language/methods/

---

## 🏗️ Pine Script v6 Core Architecture

### 1. Execution Model (CRITICAL - Most Important Concept)

**Every script executes ONCE PER BAR:**
- Historical bars: Script runs once for each historical bar sequentially
- Real-time: Script runs once per tick on the current bar

**Implications:**
```pine
//@version=6
indicator("Execution Model")

// ❌ WRONG: This does NOT loop through bars
int sum = 0
sum := sum + 1  // This resets on EVERY bar! Result: always 1

// ✅ CORRECT: Use 'var' to persist across bars
var int sum = 0
sum := sum + 1  // This accumulates: 1, 2, 3, 4...
```

**Key Concepts:**
- **Series:** Value changes per bar (e.g., `close`, `high`, `ta.sma(close, 20)`)
- **Simple/Const:** Same value on all bars (e.g., `input.int(14)`, `100`)
- **`var` keyword:** Declares variable ONCE on first bar, persists across bars
- **`varip` keyword:** Persists across ticks in real-time (advanced)

**Reference:** https://www.tradingview.com/pine-script-docs/language/execution-model/

---

### 2. Pine Script v5 → v6 Migration Guide

**When helping users migrate v5 code to v6, watch for these common breaking changes:**

#### Deprecated Constants (Most Common Issue)

| v5 Syntax (DEPRECATED) | v6 Replacement | Notes |
|------------------------|----------------|-------|
| `plot.style_dashed` | `plot.style_linebr` | Dashed style removed, use line with breaks |
| `plot.style_circles` | `plot.style_circles` | Still valid, but verify usage |
| `scale.right` | Use `display` parameter | Scale parameter deprecated for most functions |
| `resolution` | `timeframe.period` | Resolution variable renamed |

#### Plot Style Constants (v6 Only)

Valid `plot.style_*` constants in v6:
- `plot.style_line` - Solid line (default)
- `plot.style_linebr` - Line with breaks (closest to v5 dashed)
- `plot.style_stepline` - Step line
- `plot.style_steplinebr` - Step line with breaks
- `plot.style_histogram` - Histogram
- `plot.style_cross` - Crosses
- `plot.style_area` - Filled area
- `plot.style_areabr` - Filled area with breaks
- `plot.style_columns` - Columns
- `plot.style_circles` - Circles

#### Migration Pattern Example

```pine
//@version=5
indicator("Old v5", overlay=true)
plot(close, "Price", style=plot.style_dashed)  // ❌ BREAKS in v6

//@version=6
indicator("New v6", overlay=true)
plot(close, "Price", style=plot.style_linebr)  // ✅ CORRECT v6
```

#### Validation Warnings

The VSCode extension validator now detects deprecated v5 syntax:
```
⚠️ Warning: Deprecated Pine Script v5 constant 'plot.style_dashed'. Use 'plot.style_linebr' instead.
```

**When you see v5 code:**
1. Check `//@version=` annotation
2. If v5, ask user if they want to migrate to v6
3. Use the table above to replace deprecated syntax
4. Test the code in TradingView's web editor
5. Recommend running the validator to catch other issues

**Migration Checklist:**
- [ ] Update `//@version=5` → `//@version=6`
- [ ] Replace `plot.style_dashed` → `plot.style_linebr`
- [ ] Replace `resolution` → `timeframe.period`
- [ ] Remove `scale` parameter from `plot()`, use `display` instead
- [ ] Check for deprecated `transp` parameter → use `color.new(col, transparency)`
- [ ] Verify all namespace constants exist in v6

**Reference:** https://www.tradingview.com/pine-script-docs/migration-guides/v5-to-v6/

---

### 3. Type System

**Fundamental Types:**
- `int` - Integer (42, -10)
- `float` - Floating point (3.14, 42.0)
- `bool` - Boolean (true, false)
- `color` - Color values (color.red, #FF0000)
- `string` - Text ("Hello")

**Special Types:**
- `na` - "Not available" (missing data)
- `series<type>` - Value that changes per bar
- `simple<type>` - Calculated at compile time
- `const<type>` - Literal constant

**Collections (v6 Feature):**
- `array<type>` - Dynamic array
- `matrix<type>` - 2D matrix
- `map<key, value>` - Key-value dictionary

**User-Defined Types (v6 Feature):**
```pine
//@version=6
type Point
    float x
    float y

Point myPoint = Point.new(10.0, 20.0)
```

**Type Coercion:**
- `int` → `float` (automatic)
- `float` → `int` (requires `int()` cast)
- `series` → `simple` (NOT allowed - will error)

**Reference:** https://www.tradingview.com/pine-script-docs/language/type-system/

---

### 3. Standard Script Structure (Template)

```pine
//@version=6

// 1. DECLARATION STATEMENT (Required - First Line After Version)
indicator("My Indicator", overlay=true)
// OR
strategy("My Strategy", overlay=true, default_qty_type=strategy.percent_of_equity)

// 2. IMPORTS (if any)
import jpantsjoha/my_library/1 as lib

// 3. TYPE DEFINITIONS (if any)
type Trade
    float entry
    float exit

// 4. CONSTANTS
const int LOOKBACK = 20

// 5. INPUTS (Group all together)
int lengthInput = input.int(14, "Length", minval=1)
color colorInput = input.color(color.blue, "Line Color")

// 6. VARIABLES (Initialize with var if needed)
var float cumVolume = 0.0

// 7. CALCULATIONS (Core logic)
float sma = ta.sma(close, lengthInput)
bool crossUp = ta.crossover(close, sma)

// 8. STRATEGY CALLS (if strategy)
if crossUp
    strategy.entry("Long", strategy.long)

// 9. VISUALS (Plots, shapes, backgrounds)
plot(sma, "SMA", color=colorInput)
plotshape(crossUp, "Cross", style=shape.triangleup, location=location.belowbar)
bgcolor(crossUp ? color.new(color.green, 90) : na)

// 10. ALERTS (if any)
alertcondition(crossUp, "Cross Alert", "Price crossed above SMA")
```

**Reference:** https://www.tradingview.com/pine-script-docs/writing/style-guide/

---

## 🔑 Critical Language Features

### 1. Variable Declaration Modifiers

**`var` - Persist Across Bars (Most Common):**
```pine
var float highestPrice = na
highestPrice := math.max(nz(highestPrice), high)  // Tracks all-time high
```

**`varip` - Persist Across Ticks (Real-time Only):**
```pine
varip int tickCount = 0
tickCount += 1  // Counts every tick, not just bars
```

**Without Modifier - Resets Every Bar:**
```pine
float currentHigh = high  // Just the current bar's high
```

---

### 2. Conditional Statements

**`if` Statement (v6 allows multi-line blocks without indentation rules):**
```pine
var float result = na
if close > open
    result := high - low
else if close < open
    result := low - high
else
    result := 0.0
```

**`switch` Statement (v6 Feature - Preferred for Multiple Conditions):**
```pine
string signal = switch
    close > ta.sma(close, 20) => "Bullish"
    close < ta.sma(close, 20) => "Bearish"
    => "Neutral"  // Default case
```

**Ternary Operator `?:` (Inline Conditional):**
```pine
color barColor = close > open ? color.green : color.red
```

---

### 3. Loops (v6 Feature)

**`for` Loop (C-style):**
```pine
float sum = 0.0
for i = 0 to 9
    sum += close[i]
```

**`for...in` Loop (Array Iteration):**
```pine
array<float> prices = array.from(close, open, high, low)
float avg = 0.0
for price in prices
    avg += price
avg /= array.size(prices)
```

**`while` Loop (Conditional):**
```pine
int i = 0
float sum = 0.0
while i < 10
    sum += close[i]
    i += 1
```

**⚠️ Loop Limits:**
- Max 500ms execution per bar
- Infinite loops will timeout and error

---

### 4. Functions

**Built-in Functions (457+ Available - See `v6/parameter-requirements-generated.ts`):**
```pine
// Technical Analysis (ta.*)
float sma = ta.sma(close, 20)
float rsi = ta.rsi(close, 14)
bool crossUp = ta.crossover(close, sma)

// Math Functions (math.*)
float absValue = math.abs(-10)  // 10
float maxVal = math.max(close, open)

// String Functions (str.*)
string msg = str.format("Price: {0}", close)

// Request Functions (request.*)
float dailyClose = request.security(syminfo.tickerid, "D", close[1])
```

**User-Defined Functions:**
```pine
// Simple function
calcRange() =>
    high - low

// Function with parameters
calcRange(float multiplier) =>
    (high - low) * multiplier

// Function with explicit return type
calcRange(float multiplier) : float =>
    (high - low) * multiplier
```

**Methods (v6 Feature - Extends Built-in Types):**
```pine
// Extend array type
method displaySize(array<float> arr) =>
    log.info("Array size: " + str.tostring(array.size(arr)))

myArray = array.from(1, 2, 3)
myArray.displaySize()  // Calls custom method
```

---

### 5. Operators (21 Total - See `v6/raw/v6-language-constructs.json`)

**Arithmetic:**
- `+` `-` `*` `/` `%` (modulo)

**Comparison:**
- `==` `!=` `>` `<` `>=` `<=`

**Logical (v6 has short-circuit evaluation):**
- `and` `or` `not`
- **Short-circuit:** `a and b` - if `a` is false, `b` is NOT evaluated
- **Performance Tip:** Put cheaper condition first: `fastCheck and expensiveCheck`

**Assignment:**
- `=` (declaration)
- `:=` (reassignment)
- `+=` `-=` `*=` `/=` `%=` (compound)

**Ternary:**
- `condition ? valueIfTrue : valueIfFalse`

**Array Access:**
- `array[index]`
- `matrix[row, col]`

**History Reference:**
- `close[1]` (previous bar)
- `close[10]` (10 bars ago)

**Reference:** https://www.tradingview.com/pine-script-docs/language/operators/

---

## 🎨 Plotting & Visuals

### 1. plot() - Line Plots

**Basic Usage:**
```pine
plot(close, "Close Price", color=color.blue)
```

**All Parameters (from `v6/parameter-requirements.ts`):**
```pine
plot(
    series,                    // Required: series to plot
    title="",                  // Optional: plot name
    color=color.blue,          // Optional: line color
    linewidth=1,               // Optional: 1-4
    style=plot.style_line,     // Optional: see plot.style_* constants
    trackprice=false,          // Optional: extend to right
    histbase=0.0,              // Optional: histogram baseline
    offset=0,                  // Optional: shift plot left/right
    join=false,                // Optional: join gaps
    editable=true,             // Optional: user can edit
    show_last=na,              // Optional: show only last N bars
    display=display.all        // Optional: where to show
)
```

**Plot Styles (10 Constants - See `v6/pine-constants-complete.ts`):**
- `plot.style_line` - Continuous line
- `plot.style_linebr` - Line with breaks on na
- `plot.style_stepline` - Step line
- `plot.style_steplinediamond` - Step line with diamonds
- `plot.style_histogram` - Histogram bars
- `plot.style_cross` - Crosses
- `plot.style_area` - Filled area
- `plot.style_areabr` - Area with breaks
- `plot.style_columns` - Columns
- `plot.style_circles` - Circles

**Reference:** https://www.tradingview.com/pine-script-reference/v6/fun_plot.html

---

### 2. plotshape() & plotchar() - Event Markers

**plotshape() - Shapes on Events:**
```pine
plotshape(
    series=crossUp,                  // Required: bool series (when to show)
    title="Cross Up",                // Optional
    style=shape.triangleup,          // Optional: shape constant (NOT "shape=" parameter!)
    location=location.belowbar,      // Optional: where to place
    color=color.green,               // Optional
    size=size.small                  // Optional
)
```

**⚠️ Common Error:** `plotshape()` uses `style=shape.xxx`, NOT `shape=shape.xxx`!

**Shape Constants (12 Available - See `v6/pine-constants-complete.ts`):**
- `shape.xcross` - X cross
- `shape.cross` - Plus cross
- `shape.circle` - Circle
- `shape.triangleup` / `shape.triangledown`
- `shape.flag` - Flag
- `shape.arrowup` / `shape.arrowdown`
- `shape.labelup` / `shape.labeldown`
- `shape.square` / `shape.diamond`

**Location Constants (5 Available):**
- `location.abovebar` / `location.belowbar`
- `location.top` / `location.bottom`
- `location.absolute`

**Size Constants (6 Available):**
- `size.auto` / `size.tiny` / `size.small` / `size.normal` / `size.large` / `size.huge`

**Reference:** https://www.tradingview.com/pine-script-reference/v6/fun_plotshape.html

---

### 3. bgcolor() - Background Colors

```pine
bgcolor(
    color=crossUp ? color.new(color.green, 90) : na,  // Required: color or na
    offset=0,                                          // Optional
    editable=true,                                     // Optional
    show_last=na,                                      // Optional
    title="Background"                                 // Optional
)
```

---

### 4. Labels (Dynamic Text Markers)

**Create Label:**
```pine
if crossUp
    label.new(
        x=bar_index,                    // Required: bar position
        y=high,                          // Required: price level
        text="BUY",                      // Optional: text content
        color=color.green,               // Optional: background color
        textcolor=color.white,           // Optional: text color
        style=label.style_label_up,      // Optional: label style
        size=size.normal                 // Optional: text size
    )
```

**Label Styles (9 Available):**
- `label.style_label_up` / `label.style_label_down`
- `label.style_label_left` / `label.style_label_right`
- `label.style_label_center`
- `label.style_arrowup` / `label.style_arrowdown`
- `label.style_xcross` / `label.style_cross`

**Reference:** https://www.tradingview.com/pine-script-reference/v6/fun_label%7Bdot%7Dnew.html

---

### 5. Tables (Dashboard/Stats Display)

```pine
var table myTable = table.new(position.top_right, 2, 3)
table.cell(myTable, 0, 0, "Metric", bgcolor=color.gray)
table.cell(myTable, 1, 0, "Value", bgcolor=color.gray)
table.cell(myTable, 0, 1, "RSI", bgcolor=color.white)
table.cell(myTable, 1, 1, str.tostring(ta.rsi(close, 14)), bgcolor=color.white)
```

**Reference:** https://www.tradingview.com/pine-script-reference/v6/fun_table%7Bdot%7Dnew.html

---

## 🎯 Strategy Development

### 1. Strategy Declaration

```pine
//@version=6
strategy(
    title="My Strategy",                    // Required
    shorttitle="STRAT",                     // Optional: chart label
    overlay=true,                           // Optional: overlay on chart
    default_qty_type=strategy.percent_of_equity,  // Optional
    default_qty_value=10,                   // Optional: 10% of equity
    pyramiding=0,                           // Optional: max concurrent trades
    calc_on_every_tick=false                // Optional: realtime calc
)
```

---

### 2. Entry & Exit Orders

**Entry Orders:**
```pine
if longCondition
    strategy.entry(
        id="Long",                          // Required: unique ID
        direction=strategy.long,            // Required: long/short
        qty=1,                              // Optional: quantity
        limit=close * 0.99,                 // Optional: limit price
        stop=close * 1.01,                  // Optional: stop price
        comment="Long entry"                // Optional: comment
    )
```

**Exit Orders:**
```pine
if exitCondition
    strategy.close(
        id="Long",                          // Required: match entry ID
        comment="Take profit"               // Optional
    )

// Or use exit with conditions
strategy.exit(
    id="Exit",                              // Required: unique exit ID
    from_entry="Long",                      // Required: entry ID to exit from
    profit=100,                             // Optional: profit target (ticks)
    loss=50,                                // Optional: stop loss (ticks)
    trail_points=20,                        // Optional: trailing stop
    trail_offset=10                         // Optional: trail offset
)
```

---

### 3. Built-in Strategy Variables

```pine
// Position
strategy.position_size          // Current position size (+ long, - short, 0 flat)
strategy.position_avg_price     // Average entry price

// Equity
strategy.equity                 // Current equity
strategy.netprofit              // Total net profit
strategy.openprofit             // Unrealized P&L

// Trade Stats
strategy.closedtrades           // Number of closed trades
strategy.wintrades              // Number of winning trades
strategy.losstrades             // Number of losing trades
```

**Reference:** https://www.tradingview.com/pine-script-reference/v6/#fun_strategy

---

## 🔧 Input Functions (User Configuration)

### Input Types (12 Available)

```pine
// Numeric Inputs
int intValue = input.int(14, "Length", minval=1, maxval=500)
float floatValue = input.float(0.5, "Multiplier", step=0.1)

// Boolean Input
bool showSignals = input.bool(true, "Show Signals")

// String Input
string mode = input.string("SMA", "MA Type", options=["SMA", "EMA", "WMA"])

// Source Input (Price Series)
float src = input.source(close, "Source")

// Color Input
color lineColor = input.color(color.blue, "Line Color")

// Timeframe Input
string tf = input.timeframe("D", "Timeframe")

// Symbol Input
string sym = input.symbol("AAPL", "Symbol")

// Session Input
string session = input.session("0930-1600", "Session")

// Time Input
int timestamp = input.time(timestamp("2024-01-01"), "Start Date")

// Text Area (Multi-line)
string notes = input.text_area("Notes here", "Notes")

// Table Input (Grid of values)
var table inputTable = table.new(position.top_right, 2, 2)
```

**Reference:** https://www.tradingview.com/pine-script-reference/v6/#fun_input

---

## 📊 Technical Analysis (ta.* Namespace)

### Most Common Functions (From `v6/parameter-requirements.ts`)

**Moving Averages:**
```pine
ta.sma(source, length)          // Simple MA
ta.ema(source, length)          // Exponential MA
ta.wma(source, length)          // Weighted MA
ta.vwma(source, length)         // Volume Weighted MA
```

**Oscillators:**
```pine
ta.rsi(source, length)          // RSI (14)
ta.macd(source, fast, slow, signal)  // MACD
ta.stoch(source, high, low, length)  // Stochastic
ta.cci(source, length)          // CCI
```

**Volatility:**
```pine
ta.atr(length)                  // Average True Range
ta.tr                           // True Range (current bar)
ta.bb(source, length, mult)     // Bollinger Bands (returns [basis, upper, lower])
```

**Cross Detection:**
```pine
ta.crossover(a, b)              // a crosses above b
ta.crossunder(a, b)             // a crosses below b
ta.cross(a, b)                  // a crosses b (either direction)
```

**Pivots:**
```pine
ta.pivothigh(source, leftbars, rightbars)
ta.pivotlow(source, leftbars, rightbars)
```

**Reference:** https://www.tradingview.com/pine-script-reference/v6/#fun_ta

---

## 🌐 Multi-Timeframe & External Data

### request.security() - Higher Timeframe Data

**⚠️ ANTI-REPAINTING PATTERN (Critical!):**
```pine
// ❌ WRONG: Repaints on timeframe close
float dailyClose = request.security(syminfo.tickerid, "D", close)

// ✅ CORRECT: Use previous bar to avoid repaint
float dailyClose = request.security(syminfo.tickerid, "D", close[1])

// ✅ ALSO CORRECT: Use lookahead.on for confirmed data
float dailyClose = request.security(syminfo.tickerid, "D", close, lookahead=barmerge.lookahead_on)
```

**Why This Matters:**
- On higher timeframe, current bar's `close` changes with each tick
- Using `close[1]` ensures you get the **confirmed** previous bar
- Without this, your indicator/strategy will show false signals historically

**Reference:** https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/

---

### request.security_lower_tf() - Lower Timeframe Data (v6 Feature)

```pine
array<float> intrabarData = request.security_lower_tf(syminfo.tickerid, "1", close)
// Returns array of all 1-minute closes within current bar
```

---

## 🐛 Debugging Tools

### 1. log.info() - Debug Console (v6 Recommended)

```pine
log.info("RSI value: {0}", ta.rsi(close, 14))
log.info("Position size: {0}, Avg price: {1}", strategy.position_size, strategy.position_avg_price)
```

**Outputs to Pine Logs panel** (not visible on chart)

---

### 2. plot() - Visual Debugging

```pine
// Plot any series to see its evolution
plot(ta.rsi(close, 14), "Debug RSI")
plot(strategy.position_size, "Debug Position")
```

---

### 3. Labels - Point-in-Time State

```pine
if ta.crossover(close, ta.sma(close, 20))
    label.new(
        bar_index,
        high,
        str.format("Cross!\nClose: {0}\nSMA: {1}", close, ta.sma(close, 20))
    )
```

---

### 4. Runtime Errors - Common Issues

**Error: "Cannot call 'X' with arguments (series int)"**
- **Cause:** Function requires `simple` or `const`, got `series`
- **Fix:** Use `input.int()` instead of calculated value

**Error: "Undeclared identifier"**
- **Cause:** Variable used before declaration
- **Fix:** Declare variables before use (or use `var` for forward reference)

**Error: "Loop is too long"**
- **Cause:** Loop exceeded 500ms execution limit
- **Fix:** Reduce iterations or optimize calculations

**Reference:** https://www.tradingview.com/pine-script-docs/writing/debugging/

---

## 🚀 Performance Optimization

### 1. Switch Over If/Else Chains (v6 Feature)

**❌ Inefficient:**
```pine
string signal = na
if rsi > 70
    signal := "Overbought"
else if rsi > 50
    signal := "Bullish"
else if rsi < 30
    signal := "Oversold"
else if rsi < 50
    signal := "Bearish"
else
    signal := "Neutral"
```

**✅ Optimized:**
```pine
string signal = switch
    rsi > 70 => "Overbought"
    rsi > 50 => "Bullish"
    rsi < 30 => "Oversold"
    rsi < 50 => "Bearish"
    => "Neutral"
```

---

### 2. Short-Circuit Logic (v6 Feature)

```pine
// ✅ Fast check first (cheap condition)
if bar_index > 100 and ta.rsi(close, 14) > 70
    // If bar_index <= 100, RSI is NEVER calculated

// ❌ Expensive check first
if ta.rsi(close, 14) > 70 and bar_index > 100
    // RSI calculated on EVERY bar, even when bar_index <= 100
```

---

### 3. Cache Calculations with var

```pine
// ❌ Recalculates EVERY bar
plot(ta.sma(ta.rsi(close, 14), 20))

// ✅ Calculate once, reuse
float rsi = ta.rsi(close, 14)
float rsiSma = ta.sma(rsi, 20)
plot(rsiSma)
```

---

### 4. Minimize request.security() Calls

```pine
// ❌ Multiple calls to same timeframe
float dailyHigh = request.security(syminfo.tickerid, "D", high[1])
float dailyLow = request.security(syminfo.tickerid, "D", low[1])
float dailyClose = request.security(syminfo.tickerid, "D", close[1])

// ✅ Single call returning tuple
[dailyHigh, dailyLow, dailyClose] = request.security(syminfo.tickerid, "D", [high[1], low[1], close[1]])
```

---

## ⚠️ Platform Limits (Official TradingView)

### Compilation Limits
- **Max script size:** 80,000 tokens
- **Max local variables:** 1,000 per scope
- **Max plots/indicators:** 64 per script
- **Max security() calls:** 40 (basic) / 64 (Pro+)
- **Compilation timeout:** 2 minutes

### Runtime Limits
- **Script execution:** 20s (basic) / 40s (Premium+) per bar
- **Loop execution:** 500ms per bar
- **Historical buffer:** 5,000 bars (20,000 for Pro+)
- **Array/matrix/map:** 100,000 elements max
- **Labels/lines/boxes:** 500 max on chart

**Reference:** https://www.tradingview.com/pine-script-docs/writing/limitations/

---

## 📋 Validation Rules (From This Extension)

### Parameter Validation

**The extension validates:**
- ✅ Required parameter count (e.g., `plot()` requires `series`)
- ✅ Too many parameters (e.g., `alertcondition()` has max 3)
- ✅ Parameter names (e.g., `plotshape()` uses `style=`, NOT `shape=`)
- ✅ Undefined functions/namespaces (e.g., `xyz.abc()` errors if `xyz` unknown)
- ✅ Invalid constants (e.g., `plot.style_invalid` errors)
- ✅ Undefined variables (e.g., using `x` before declaring)

**Reference Files:**
- `v6/parameter-requirements.ts` - 32 critical functions (100% accurate)
- `v6/parameter-requirements-generated.ts` - 457 functions (95% accurate)
- `v6/pine-constants-complete.ts` - All v6 constants

---

### Common Validation Errors (From Extension Testing)

**Error: "Too many arguments for alertcondition()"**
```pine
// ❌ WRONG: alertcondition() has max 3 params
alertcondition(condition, title, message, extra)

// ✅ CORRECT:
alertcondition(condition, title, message)
```

**Error: "Missing required parameter 'defval' for input.string()"**
```pine
// ❌ WRONG:
string mode = input.string("MA Type")

// ✅ CORRECT:
string mode = input.string("SMA", "MA Type")
```

**Error: "plotshape() does not have parameter 'shape'"**
```pine
// ❌ WRONG:
plotshape(condition, shape=shape.triangleup)

// ✅ CORRECT:
plotshape(condition, style=shape.triangleup)
```

---

## 🎓 Code Generation Checklist

When generating Pine Script v6 code, **ALWAYS**:

### 1. Start with Version Declaration
```pine
//@version=6
```

### 2. Follow Standard Structure Order
1. Declaration (`indicator()` or `strategy()`)
2. Imports
3. Type definitions
4. Constants
5. Inputs
6. Variables (with `var` if needed)
7. Calculations
8. Strategy calls
9. Visuals (plot, plotshape, bgcolor)
10. Alerts

### 3. Use Explicit Types
```pine
// ✅ GOOD:
float sma = ta.sma(close, 20)
int length = input.int(14)
var float highest = na

// ❌ AVOID:
sma = ta.sma(close, 20)  // Implicit typing
```

### 4. Validate Against Extension Rules
- Check function exists in `v6/parameter-requirements-merged.ts`
- Verify parameter count and names
- Confirm constants exist in `v6/pine-constants-complete.ts`

### 5. Implement Anti-Repainting Patterns
```pine
// ✅ For HTF data:
float dailyClose = request.security(syminfo.tickerid, "D", close[1])

// ✅ For barstate checks:
if barstate.isconfirmed
    // Logic runs ONCE per bar (not on every tick)
```

### 6. Add Comments for Complex Logic
```pine
// Calculate dynamic stop loss based on ATR
float atrValue = ta.atr(14)
float stopLoss = strategy.position_avg_price - (atrValue * 2)
```

### 7. Test Mental Model

---

### 8. Ad-hoc Pine Script Validation
For ad-hoc validation of Pine Script files, use the `qa:pinescript` npm script.

**Usage:**
```bash
# Validate all .pine files in the project
npm run qa:pinescript

# Validate a specific file
node qa-validate-pinescript.js path/to/your/script.pine
```

This workflow is defined in `QA-VALIDATION-WORKFLOW.md`.
- "Does this run once per bar or once per tick?"
- "Will this repaint historically?"
- "Are all variables declared before use?"
- "Are parameter counts correct?"

---

## 🔗 Quick Reference Links

### TradingView Official Documentation
- **Main Docs:** https://www.tradingview.com/pine-script-docs/
- **Language Reference:** https://www.tradingview.com/pine-script-reference/v6/
- **Style Guide:** https://www.tradingview.com/pine-script-docs/writing/style-guide/
- **Limitations:** https://www.tradingview.com/pine-script-docs/writing/limitations/
- **Migration Guide (v5→v6):** https://www.tradingview.com/pine-script-docs/migration-guides/to-pine-version-6/

### This Repository Data
- **6,665 Language Items:** `v6/raw/v6-language-constructs.json`
- **Full API Details:** `v6/raw/complete-v6-details.json`
- **Parameter Specs (Manual):** `v6/parameter-requirements.ts`
- **Parameter Specs (Generated):** `v6/parameter-requirements-generated.ts`
- **All Constants:** `v6/pine-constants-complete.ts`
- **AI Workflows:** `docs/AI-ASSISTANT-GUIDE.md`

### Function Lookup Pattern
- **Format:** `https://www.tradingview.com/pine-script-reference/v6/fun_{namespace}_{function}.html`
- **Example:** `https://www.tradingview.com/pine-script-reference/v6/fun_ta_sma.html`

---

## 🏆 Expert-Level Patterns

### Pattern 1: State Machine with var
```pine
var string state = "init"
var float entryPrice = na

if state == "init" and crossUp
    state := "long"
    entryPrice := close
    strategy.entry("Long", strategy.long)

if state == "long" and close > entryPrice * 1.02
    state := "profit"
    strategy.close("Long")
```

### Pattern 2: Dynamic Array for N-Bar Analysis
```pine
var array<float> closes = array.new_float(0)
array.push(closes, close)
if array.size(closes) > 100
    array.shift(closes)  // Keep only last 100

float arrayAvg = array.avg(closes)
```

### Pattern 3: Custom Method for Readability
```pine
method isOverbought(float rsiValue) =>
    rsiValue > 70

float rsi = ta.rsi(close, 14)
if rsi.isOverbought()
    // Sell signal
```

### Pattern 4: Tuple Return for Multi-Signal Function
```pine
calcSignals() =>
    bool buy = ta.crossover(close, ta.sma(close, 20))
    bool sell = ta.crossunder(close, ta.sma(close, 20))
    [buy, sell]

[buySignal, sellSignal] = calcSignals()
plotshape(buySignal, style=shape.triangleup, location=location.belowbar)
```

---

## ⚡ Final Reminders

1. **Execution Model is EVERYTHING** - Scripts run once per bar, not as a loop through history
2. **Use `var` for persistence** - Without it, variables reset every bar
3. **Prevent repainting** - Use `close[1]` for HTF data, check `barstate.isconfirmed`
4. **Validate parameters** - Check this repo's parameter specs before generating code
5. **Optimize with v6 features** - `switch`, short-circuit logic, methods
6. **Reference TradingView docs** - When in doubt, lookup official function signature
7. **Test on TradingView** - Extension validation is accurate, but final test is on platform

---

**Last Updated:** 2025-10-05
**Based on:** Pine Script v6 Extension v0.4.1
**Repository:** https://github.com/jpantsjoha/pinescript-vscode-extension
**Maintainer:** Jaroslav Pantsjoha (@jpantsjoha)

---

**Disclaimer:** This guide is unofficial and community-driven. Always verify code on the official TradingView platform before live trading. Pine Script™ is a trademark of TradingView, Inc.
