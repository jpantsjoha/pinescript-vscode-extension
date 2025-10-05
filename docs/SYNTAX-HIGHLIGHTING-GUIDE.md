# Pine Script v6 - Syntax Highlighting Guide

**Version:** 0.2.0
**Enhanced:** 2025-10-03

---

## 🎨 **What's New - Professional Color Coding**

The TextMate grammar has been **completely rewritten** to provide **JavaScript/TypeScript-quality** syntax highlighting with rich, semantic color coding.

---

## ✨ **Enhanced Features**

### **1. Annotations** (NEW)
Pine Script annotations now have distinct coloring:

```pine
//@version=6  // ← Annotation in special color
//@strategy_alert_message {{strategy.order.alert_message}}
//@description This is my strategy
```

**Colors:**
- `//@` prefix: Keyword color
- Annotation name: Tag color
- `=` sign: Operator color
- Value: Constant color

---

### **2. Comments**
Both single-line and block comments properly highlighted:

```pine
// Single line comment

/*
   Multi-line
   block comment
*/

//======================== SECTION DIVIDER ========================
```

---

### **3. Strings**
Enhanced string highlighting with escape sequences:

```pine
"This is a string"
'Single quote string'
"String with escape: \n \t \\"
```

**Colors:**
- Strings: String color
- Escape sequences (`\n`, `\t`, etc.): Constant color
- Invalid escapes: Error color

---

### **4. Numbers**
All number formats properly highlighted:

```pine
42          // Integer
3.14        // Float
0.5         // Float starting with dot
1.5e10      // Scientific notation
0xFF00AA    // Hexadecimal
```

---

### **5. Booleans & Special Values**

```pine
true        // Boolean
false       // Boolean
na          // Special "not available" value
```

---

### **6. Keywords** (Enhanced)
Keywords now have **semantic colors** based on their purpose:

#### Control Flow
```pine
if (condition)
    // code
else
    // code

for i = 0 to 10
    // loop

while (condition)
    // loop

switch value
    case 1 => "one"
    case 2 => "two"
    default => "other"

return result
```

#### Logical Operators
```pine
x and y     // Logical AND
x or y      // Logical OR
not x       // Logical NOT
```

#### Import/Export
```pine
import Username/LibraryName/1 as lib
export myFunction(param) => param * 2
```

---

### **7. Storage & Type Keywords** (NEW)

#### Variable Declaration
```pine
var myVar = 0           // Variable (persists across bars)
varip fastVar = 0       // Variable intrabar persist
```

#### Type Modifiers
```pine
const PI = 3.14159      // Constant
simple int mySimple = 10
series float mySeries = close
input int userInput = 20
```

#### Primitive Types
```pine
int myInteger = 42
float myFloat = 3.14
bool myBoolean = true
string myString = "text"
color myColor = color.blue
```

#### Object Types
```pine
line myLine = na
label myLabel = na
box myBox = na
table myTable = na
array<float> prices = array.new_float()
matrix<int> data = matrix.new<int>(10, 10)
```

---

### **8. Constants** (Comprehensive)

#### Color Constants
```pine
color.red       // Predefined colors
color.green
color.blue
color.yellow
color.white
color.black
color.orange
// ... and 10+ more
```

#### Strategy Constants
```pine
strategy.long
strategy.short
strategy.fixed
strategy.percent_of_equity
strategy.commission.percent
```

#### Location Constants
```pine
location.absolute
location.abovebar
location.belowbar
location.top
location.bottom
```

#### Shape Constants
```pine
shape.xcross
shape.triangleup
shape.triangledown
shape.arrowup
shape.arrowdown
shape.circle
shape.diamond
```

#### Plot Style Constants
```pine
plot.style_line
plot.style_histogram
plot.style_columns
plot.style_area
hline.style_dashed
hline.style_dotted
line.style_solid
```

#### Display & Format Constants
```pine
display.all
display.none
display.data_window
format.price
format.volume
format.percent
scale.right
scale.left
barmerge.gaps_off
barmerge.lookahead_on
alert.freq_once_per_bar
```

---

### **9. Operators** (Semantic Coloring)

#### Assignment
```pine
x = 10          // Regular assignment
x := 20         // Reassignment (mutable variable)
```

#### Comparison
```pine
x == y          // Equal
x != y          // Not equal
x > y           // Greater than
x >= y          // Greater than or equal
x < y           // Less than
x <= y          // Less than or equal
```

#### Arithmetic
```pine
a + b           // Addition
a - b           // Subtraction
a * b           // Multiplication
a / b           // Division
a % b           // Modulo
```

#### Ternary & Arrow
```pine
result = condition ? valueIfTrue : valueIfFalse
myFunction(param) => param * 2
```

---

### **10. Function Declarations** (NEW)

User-defined functions now highlighted distinctly:

```pine
myCustomFunction(length, source) =>
    ta.sma(source, length)

indicator("My Script")
strategy("My Strategy")
library("My Library")
```

**Colors:**
- Function name: Entity name color (yellow/gold typically)
- Built-in declarations (`indicator`, `strategy`): Built-in function color

---

### **11. Function Calls** (Enhanced)

#### Plot Functions (Special highlighting)
```pine
plot(close)
plotshape(condition, style=shape.triangleup)
plotcandle(open, high, low, close)
hline(50)
fill(plot1, plot2)
bgcolor(color.new(color.red, 90))
```

#### Built-in Functions
```pine
nz(value)
log(x)
sqrt(x)
timestamp(year, month, day)
```

---

### **12. Method Calls** (Namespace Functions)

Each namespace has **distinct coloring** for improved readability:

#### Technical Analysis (`ta.`)
```pine
ta.sma(close, 20)
ta.ema(close, 50)
ta.rsi(close, 14)
ta.macd(close, 12, 26, 9)
ta.crossover(fast, slow)
ta.vwap
ta.atr(14)
```

#### Math (`math.`)
```pine
math.max(a, b, c)
math.min(a, b)
math.abs(value)
math.sqrt(x)
math.round(value, precision)
```

#### Input (`input.`)
```pine
input.int(20, "Length")
input.float(1.5, "Multiplier")
input.bool(true, "Enable")
input.timeframe("D", "Higher TF")
input.color(color.blue, "Color")
```

#### Request (`request.`)
```pine
request.security(symbol, timeframe, expression)
request.dividends(ticker, field)
request.earnings(ticker, field)
```

#### String (`str.`)
```pine
str.tostring(value)
str.format("{0} {1}", arg1, arg2)
str.upper(text)
str.contains(str, substr)
```

#### Color (`color.`)
```pine
color.new(color.blue, 50)
color.rgb(255, 100, 50)
color.from_gradient(value, min, max, c1, c2)
```

#### Array (`array.`)
```pine
array.new_float(size)
array.push(id, value)
array.get(id, index)
array.max(id)
array.sum(id)
```

#### Strategy (`strategy.`)
```pine
strategy.entry("Long", strategy.long)
strategy.close("Long")
strategy.exit("Exit", profit=100, loss=50)
```

#### Label/Line/Box/Table
```pine
label.new(bar_index, high, "Text")
line.new(x1, y1, x2, y2)
box.new(left, top, right, bottom)
table.new(position, columns, rows)
```

---

### **13. Namespaces** (Visual Distinction)

Namespaces highlighted before the dot for immediate recognition:

```pine
ta.sma        // 'ta' in namespace color
math.max      // 'math' in namespace color
input.int     // 'input' in namespace color
color.new     // 'color' in namespace color
```

**All 20+ namespaces supported:**
- `ta`, `math`, `input`, `request`, `str`, `color`
- `array`, `matrix`, `map`
- `strategy`, `syminfo`, `barstate`, `timeframe`, `chart`
- `label`, `line`, `box`, `table`, `polyline`
- `ticker`, `runtime`

---

### **14. Variables** (Semantic Highlighting)

#### Built-in Variables
```pine
close           // Built-in variable color
open
high
low
volume
time
bar_index
last_bar_index
```

#### Price Shortcuts
```pine
hl2            // (high + low) / 2
hlc3           // (high + low + close) / 3
ohlc4          // (open + high + low + close) / 4
hlcc4
```

#### Time Components
```pine
year
month
dayofmonth
hour
minute
second
timenow
```

#### Namespace Properties
```pine
syminfo.ticker
barstate.isfirst
strategy.position_size
timeframe.period
```

#### User Variables
```pine
myVariable      // Regular variable color
```

---

## 🎨 **Color Scheme Integration**

The grammar uses **semantic scopes** that work with all VS Code themes:

| Element | Scope | Typical Color |
|---------|-------|---------------|
| Keywords | `keyword.control` | Purple/Pink |
| Types | `support.type` | Blue/Cyan |
| Strings | `string.quoted` | Orange/Brown |
| Numbers | `constant.numeric` | Green/Teal |
| Functions | `entity.name.function` | Yellow/Gold |
| Namespaces | `support.namespace` | Cyan/Blue |
| Comments | `comment.line` | Gray/Green |
| Operators | `keyword.operator` | White/Bright |
| Variables | `variable.language` | Light Blue |
| Constants | `support.constant` | Blue/Purple |

---

## 📊 **Coverage Statistics**

| Category | Items Highlighted | Examples |
|----------|-------------------|----------|
| **Keywords** | 20+ | `if`, `for`, `var`, `return` |
| **Types** | 15+ | `int`, `float`, `array`, `matrix` |
| **Namespaces** | 20+ | `ta`, `math`, `input`, `request` |
| **TA Functions** | 50+ | `sma`, `ema`, `rsi`, `macd` |
| **Math Functions** | 25+ | `abs`, `max`, `sqrt`, `pow` |
| **Color Constants** | 15+ | `red`, `green`, `blue`, `orange` |
| **Strategy Constants** | 10+ | `long`, `short`, `fixed` |
| **Built-in Variables** | 25+ | `close`, `volume`, `bar_index` |
| **Total Patterns** | 500+ | Comprehensive coverage |

---

## 🔍 **Comparison: Before vs. After**

### **Before (v0.1.0)**
- Basic keyword highlighting
- ~10 function names
- No namespace distinction
- No semantic coloring
- No constant highlighting
- Monochrome appearance

### **After (v0.2.0)**
- ✅ **20+ keywords** with semantic colors
- ✅ **500+ patterns** recognized
- ✅ **20 namespaces** distinctly colored
- ✅ **Full semantic scoping** (like TypeScript)
- ✅ **100+ constants** highlighted
- ✅ **Rich, colorful** appearance

---

## 🚀 **How to Test**

1. **Open the Extension Dev Host**:
   ```bash
   cd Pine-Script-Extension
   code .
   # Press F5
   ```

2. **Open a Pine file**:
   - `examples/test-v6-features.pine`
   - OR your existing: `point-click-unified-v2.pine`

3. **Observe the colors**:
   - **Blue**: Types, namespaces
   - **Purple/Pink**: Keywords (`if`, `for`, `var`)
   - **Yellow/Gold**: Function names
   - **Orange**: Strings
   - **Green**: Numbers
   - **Cyan**: Namespace functions
   - **Gray**: Comments

4. **Try different themes**:
   - Dark+ (default dark)
   - Light+ (default light)
   - Monokai
   - Solarized Dark
   - One Dark Pro

   All themes will color your Pine code beautifully!

---

## 🎯 **What Makes This Special**

1. **Semantic Scoping**: Uses proper TextMate scopes that map to VS Code's semantic tokens
2. **Theme Compatible**: Works with ALL VS Code themes
3. **Namespace Aware**: Distinguishes `ta.sma` from `math.max`
4. **Context Sensitive**: Function calls vs. declarations
5. **Comprehensive**: 500+ patterns vs. 20 before
6. **Professional**: Matches TypeScript/JavaScript quality

---

## 📖 **Technical Details**

### **Pattern Matching Order**
1. Annotations (`//@version`)
2. Comments (`//`, `/* */`)
3. Strings (`"..."`, `'...'`)
4. Numbers (int, float, hex)
5. Booleans & special values
6. Keywords (control flow, logical)
7. Storage & types
8. Constants (colors, strategy, shapes)
9. Operators
10. Function declarations
11. Function calls
12. Method calls (namespace functions)
13. Namespaces
14. Variables

### **Regex Patterns**
- **Precise matching** to avoid false positives
- **Lookahead assertions** for namespace detection
- **Capture groups** for multi-part highlighting
- **Boundary matching** (`\b`) for whole words only

---

## 🔧 **Customization**

Want to customize colors? Edit your VS Code `settings.json`:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [
    {
      "scope": "support.namespace.ta.pine",
      "settings": {
        "foreground": "#00D9FF"
      }
    },
    {
      "scope": "entity.name.function.ta.pine",
      "settings": {
        "foreground": "#FFD700"
      }
    }
  ]
}
```

---

## 🎉 **Result**

Your Pine Script files now look **beautiful** with:

✅ Rich, semantic coloring
✅ Clear visual hierarchy
✅ Easy-to-scan code
✅ Professional appearance
✅ Theme compatibility
✅ **Just like JavaScript/TypeScript!**

---

<div align="center">

**Press F5 and experience the difference!** 🌈

</div>
