# Pine Script v6 Extension - Quick Reference Card

## 🚀 Quick Start

```bash
# Test the extension NOW:
cd Pine-Script-Extension
code .
# Press F5
# Open: examples/test-v6-features.pine
```

---

## ⌨️ Key Features & Shortcuts

| Feature | How to Use | Shortcut |
|---------|------------|----------|
| **Completions** | Type namespace + dot | `Ctrl+Space` |
| **Signature Help** | Type function + `(` | Automatic |
| **Hover Docs** | Hover over symbol | Mouse hover |
| **Format Code** | Format document | `Shift+Alt+F` |
| **Show Docs Panel** | Command palette | `Cmd+Shift+P` → "Pine: Show docs" |

---

## 📚 Namespace Cheat Sheet

```pine
//@version=6
indicator("Cheat Sheet")

// Technical Analysis - Type 'ta.'
ta.sma(close, 20)        // Simple Moving Average
ta.ema(close, 20)        // Exponential MA
ta.rsi(close, 14)        // RSI
ta.macd(close, 12, 26, 9) // MACD
ta.atr(14)               // Average True Range
ta.crossover(a, b)       // True when a crosses over b

// Math - Type 'math.'
math.max(a, b, c)        // Maximum value
math.min(a, b, c)        // Minimum value
math.abs(x)              // Absolute value
math.avg(a, b)           // Average
math.round(x, precision) // Round
math.sqrt(x)             // Square root

// Input - Type 'input.'
input.int(20, "Length")           // Integer input
input.float(1.5, "Multiplier")    // Float input
input.bool(true, "Enable")        // Boolean input
input.timeframe("15", "HTF")      // Timeframe input
input.source(close, "Source")     // Price source input
input.color(color.blue, "Color")  // Color picker

// Request - Type 'request.'
request.security(symbol, tf, expression) // Get data from another symbol/TF
request.dividends(ticker, field)         // Dividend data
request.splits(ticker, field)            // Split data
request.earnings(ticker, field)          // Earnings data

// String - Type 'str.'
str.tostring(value, format)  // Convert to string
str.format(fmt, args)        // Format string
str.upper(text)              // Uppercase
str.lower(text)              // Lowercase
str.contains(str, substr)    // Check if contains
str.split(str, separator)    // Split string

// Color - Type 'color.'
color.new(color.blue, 50)           // New color with transparency
color.rgb(255, 100, 50, 30)         // RGB color
color.from_gradient(val, min, max, c1, c2) // Gradient color

// Array - Type 'array.'
array.new_float(size, initial)  // Create float array
array.push(id, value)           // Add to end
array.get(id, index)            // Get element
array.size(id)                  // Get size
array.max(id)                   // Max value
array.sum(id)                   // Sum of elements
```

---

## 🎯 Common Patterns

### Pattern 1: Moving Average Crossover
```pine
//@version=6
indicator("MA Cross")

// Type 'input.' to see all input types
fastLen = input.int(10, "Fast")
slowLen = input.int(20, "Slow")

// Type 'ta.ema(' to see parameter hints
fast = ta.ema(close, fastLen)
slow = ta.ema(close, slowLen)

// Type 'ta.crossover(' for signature help
bullish = ta.crossover(fast, slow)
bearish = ta.crossunder(fast, slow)

// Type 'plot(' for all plot parameters
plot(fast, "Fast MA", color.blue)
plot(slow, "Slow MA", color.red)
```

### Pattern 2: RSI with Signals
```pine
//@version=6
indicator("RSI Signals")

// Hover over 'input.int' to see documentation
length = input.int(14, "RSI Length")
obLevel = input.int(70, "Overbought")
osLevel = input.int(30, "Oversold")

// Hover over 'ta.rsi' to see syntax
rsi = ta.rsi(close, length)

// Boolean conditions
overbought = rsi > obLevel
oversold = rsi < osLevel

plot(rsi, "RSI")
hline(obLevel, "OB", color.red)
hline(osLevel, "OS", color.green)
```

### Pattern 3: Multi-Timeframe Analysis
```pine
//@version=6
indicator("MTF Analysis")

htf = input.timeframe("D", "Higher TF")

// Type 'request.security(' for signature help
htfClose = request.security(syminfo.tickerid, htf, close)
htfMA = request.security(syminfo.tickerid, htf, ta.sma(close, 20))

plot(htfClose, "HTF Close")
plot(htfMA, "HTF MA")
```

---

## 📖 Built-in Variables (Hover for Docs)

```pine
// Price Data
close      // Close price
open       // Open price
high       // High price
low        // Low price
volume     // Volume

// Price Shortcuts
hl2        // (high + low) / 2
hlc3       // (high + low + close) / 3
ohlc4      // (open + high + low + close) / 4

// Bar Info
bar_index       // Current bar number
last_bar_index  // Last bar number
time            // Bar time (UNIX)

// Time Components
year, month, dayofmonth, dayofweek
hour, minute, second

// Bar State (hover for when they're true)
barstate.isfirst     // First bar
barstate.islast      // Last bar
barstate.ishistory   // Historical bar
barstate.isrealtime  // Realtime bar

// Symbol Info
syminfo.ticker       // Ticker name
syminfo.tickerid     // Full ticker ID
syminfo.type         // Symbol type
syminfo.currency     // Currency

// Timeframe Info
timeframe.period      // Current TF
timeframe.isdaily     // Is daily
timeframe.isintraday  // Is intraday
```

---

## 🎨 Plotting Functions

```pine
// Basic plot - Type 'plot(' for parameters
plot(series, title, color, linewidth, style)

// Shapes - Type 'plotshape(' for all options
plotshape(condition, title, style, location, color, text)

// Candles
plotcandle(open, high, low, close, title, color)

// Horizontal line
hline(price, title, color, linestyle)

// Background color
bgcolor(color, offset, editable)

// Fill between plots
fill(plot1, plot2, color)
```

---

## ⚡ Pro Tips

1. **Type namespace + dot** to filter completions
   ```pine
   ta.     // Shows only TA functions
   input.  // Shows only input types
   ```

2. **Use signature help** for complex functions
   ```pine
   request.security(  // ← Parameters appear here
   ```

3. **Hover for instant docs** instead of opening browser
   ```pine
   close  // ← Hover to see "Close price of the current bar"
   ```

4. **Tab through parameters** in snippet completions
   ```pine
   ta.sma($1, $2)  // Tab moves to $1, then $2
   ```

5. **Use Ctrl+Space** if completions don't appear automatically

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No completions | Add `//@version=6` header |
| No signature help | Type `(` after function name |
| No hover docs | Ensure `.pine` file extension |
| Extension not active | Check file is recognized as Pine |

---

## 📊 Coverage Stats

- **240+ functions** with docs
- **63 variables** with types
- **8 namespaces** fully covered
- **50+ TA indicators**
- **Zero config** needed

---

## 🎓 Learning Path

1. **Start here**: Open `examples/test-v6-features.pine`
2. **Try typing**: `ta.` and explore functions
3. **Test signature help**: Type `ta.sma(` and see hints
4. **Read hover docs**: Hover over any function
5. **Write your script**: Create new `.pine` file
6. **Use real script**: Open your existing indicators

---

## 🔗 Quick Links

- **Test File**: `examples/test-v6-features.pine`
- **Full README**: `README-NEW.md`
- **Success Summary**: `SUCCESS-SUMMARY.md`
- **Roadmap**: `IMPLEMENTATION-ROADMAP.md`

---

## ✨ Most Useful Features

| Feature | Usage Frequency | Impact |
|---------|----------------|--------|
| Namespace completions | ⭐⭐⭐⭐⭐ | Huge |
| Signature help | ⭐⭐⭐⭐⭐ | Huge |
| Hover docs | ⭐⭐⭐⭐ | High |
| Code formatting | ⭐⭐⭐ | Medium |
| Diagnostics | ⭐⭐⭐ | Medium |

---

<div align="center">

**Press F5 to start using the extension!**

**Everything works out of the box - no configuration needed** ✨

</div>
