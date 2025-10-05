# Pine Script v6 Professional - VS Code Extension

> **Complete Pine Script v6 IDE** with 100% language coverage, IntelliSense, real-time diagnostics, and zero false positives.

[![CI/CD Pipeline](https://github.com/jpantsjoha/pinescript-vscode-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/jpantsjoha/pinescript-vscode-extension/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/jpantsjoha/pinescript-vscode-extension/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Language Coverage](https://img.shields.io/badge/v6_coverage-100%25-success.svg)](./docs/V0.4.0-COVERAGE-ANALYSIS.md)
[![Tests](https://img.shields.io/badge/tests-67%2F67_passing-success.svg)](./test)

---

## 🎯 What is This?

A professional-grade Visual Studio Code extension for **Pine Script v6** developers. Write TradingView indicators and strategies with the power of modern IDE features: intelligent code completion, real-time error detection, and comprehensive language support.

**Key Achievement:** 100% coverage of Pine Script v6 language constructs (all 6,665 official items from TradingView documentation).

---

## ✨ Key Features

### 🔍 **Complete v6 Language Support**
- ✅ **All 31 constant namespaces** recognized (`xloc.*`, `yloc.*`, `extend.*`, `scale.*`, `display.*`, `hline.*`, `barmerge.*`, `font.*`, `text.*`, `order.*`, `currency.*`, `dayofweek.*`, and more)
- ✅ **All 27 standalone built-ins** (`ask`, `bid`, `time_close`, `time_tradingday`, `timenow`, etc.)
- ✅ **All 15 keywords** (`and`, `or`, `not`, `enum`, `export`, `import`, `method`, `type`, `var`, `varip`, etc.)
- ✅ **All 21 operators** (`+`, `-`, `*`, `/`, `==`, `!=`, `?:`, `=>`, etc.)
- ✅ **All 21 variable namespaces** (`barstate.*`, `syminfo.*`, `timeframe.*`, `strategy.*`, etc.)
- ✅ **All 22 function namespaces** (`ta.*`, `math.*`, `input.*`, `str.*`, `array.*`, etc.)

### 🚫 **Zero False Positives**
```pinescript
// These are ALL valid v6 code - no errors!
x = xloc.bar_index
y = yloc.price
e = extend.both
s = scale.left
d = display.all
c = currency.USD
p = position.top_center
```

### 🎯 **Real-Time Diagnostics**
- Detects undefined functions and variables
- Catches missing required parameters
- Identifies invalid Pine Script v6 syntax
- Warns about too many arguments
- Fast validation (< 100ms for typical scripts)

### 💡 **Intelligent IntelliSense**
- **457+ built-in functions** with autocomplete
- Parameter hints for all major functions
- Hover documentation
- Namespace-aware completions

### 📝 **Syntax Highlighting**
- Complete Pine Script v6 syntax support
- Built-in variables and constants highlighted
- Function calls, keywords, and operators distinguished
- Comment and string literal recognition

---

## 📦 Installation

### From VSIX (Recommended for v0.4.0)

1. Download the latest release: [`pine-script-extension-0.4.0.vsix`](./build/pine-script-extension-0.4.0.vsix)

2. Install in VS Code:
   ```bash
   code --install-extension pine-script-extension-0.4.0.vsix
   ```

3. Reload VS Code:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Developer: Reload Window`

### From VS Code Marketplace (Coming Soon)

1. Open VS Code
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
3. Search for "Pine Script v6 Professional"
4. Click Install

---

## 🚀 Quick Start

### 1. Create a New Pine Script File

```bash
# Create a file with .pine extension
touch my-indicator.pine
```

### 2. Start Coding

```pinescript
//@version=6
indicator("My First Indicator", overlay=true)

// Use all v6 features with full IntelliSense
length = input.int(20, "Length")
src = input.source(close, "Source")

// All namespaces recognized
sma = ta.sma(src, length)
ema = ta.ema(src, length)

// Plot with all style constants
plot(sma, "SMA", color.blue, style=plot.style_line)
plot(ema, "EMA", color.red, style=plot.style_linebr)

// Use all position constants
if ta.crossover(ema, sma)
    label.new(bar_index, high, "Buy",
             xloc=xloc.bar_index,
             yloc=yloc.abovebar,
             color=color.green,
             style=label.style_label_up)
```

### 3. See Real-Time Validation

- Errors appear in the Problems panel
- Squiggly underlines show issues inline
- Hover for error details

---

## 📊 Pine Script v6 Documentation Parity

This extension provides **100% coverage** of Pine Script v6 language constructs as documented in the [official TradingView Pine Script v6 Reference](https://www.tradingview.com/pine-script-reference/v6/).

| Category | Coverage | Details |
|----------|----------|---------|
| **Constant Namespaces** | 31/31 (100%) | All `namespace.constant` patterns recognized |
| **Built-in Variables** | 27/27 (100%) | All standalone variables (`close`, `ask`, `bid`, etc.) |
| **Variable Namespaces** | 21/21 (100%) | All `namespace.*` variable patterns |
| **Function Namespaces** | 22/22 (100%) | All `namespace.function()` patterns |
| **Keywords** | 15/15 (100%) | All v6 keywords (`and`, `enum`, `export`, etc.) |
| **Operators** | 21/21 (100%) | All v6 operators (`+`, `-`, `?:`, etc.) |

**See:** [V0.4.0 Coverage Analysis](./docs/V0.4.0-COVERAGE-ANALYSIS.md) for detailed breakdown.

---

## 🎓 Examples

### Example 1: Multi-Timeframe Analysis
```pinescript
//@version=6
indicator("MTF Analysis", overlay=true)

// Request data from higher timeframe
htf_close = request.security(syminfo.tickerid, "D", close,
                             barmerge.gaps_on,
                             barmerge.lookahead_off)

// Plot with display options
plot(htf_close, "Daily Close",
     color=color.blue,
     display=display.all)
```

### Example 2: Strategy with All Features
```pinescript
//@version=6
strategy("Complete Strategy", overlay=true)

// Use all input types
length = input.int(20, "Length")
src = input.source(close, "Source")
trade_type = input.string("Long", "Trade Type",
                          options=["Long", "Short", "Both"])

// Strategy execution
if ta.crossover(close, ta.sma(src, length))
    strategy.entry("Long", strategy.long)

if ta.crossunder(close, ta.sma(src, length))
    strategy.close("Long")
```

**More examples:** [`examples/`](./examples/) directory

---

## 🤝 Contributing

We welcome contributions! This is a community-driven project.

### How to Contribute

1. **Report Issues:** Found a bug or false positive? [Open an issue](./CONTRIBUTING.md)
2. **Suggest Features:** Have an idea? Share it in [discussions](#)
3. **Submit PRs:** Fix bugs, improve docs, add features

**See:** [Contributing Guide](./docs/CONTRIBUTING.md) for detailed instructions.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/YourGitHub/pine-script-vscode-extension.git
cd pine-script-vscode-extension

# Install dependencies
npm install

# Build and test
npm run rebuild

# Install locally for testing
code --install-extension build/pine-script-extension-0.4.0.vsix
```

---

## 📖 Documentation

### For Users
- **[Quick Start Guide](./docs/QUICK-START.md)** - Get started in 5 minutes
- **[Testing Guide](./docs/V0.4.0-TESTING-GUIDE.md)** - Verify everything works
- **[Syntax Highlighting](./docs/SYNTAX-HIGHLIGHTING-GUIDE.md)** - Customize colors

### For Contributors
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute
- **[Architecture](./docs/ADR-001-VALIDATION-STRATEGY.md)** - Technical decisions
- **[Test Strategy](./docs/ADR-002-TEST-STRATEGY.md)** - Testing approach

### Project Info
- **[Changelog](./CHANGELOG.md)** - Version history
- **[Coverage Analysis](./docs/V0.4.0-COVERAGE-ANALYSIS.md)** - What we validate

---

## 🐛 Known Limitations

This extension focuses on **syntax validation**, not **runtime behavior**:

### ✅ What We Validate
- Syntax correctness (valid Pine Script v6 code)
- Undefined functions/variables/namespaces
- Missing required parameters
- Too many parameters
- Invalid constant references

### ❌ What We Don't Validate
- Type mismatches (`int` vs `float`)
- Runtime errors (division by zero, etc.)
- Logic errors (impossible conditions)
- Pine Script runtime limits (max variables, max plots, etc.)

These are **intentional limitations** - a syntax validator shouldn't predict runtime behavior.

---

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) for details.

### No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. See license for full details.

---

## ⚠️ Disclaimer

**This is an independent community project** and is **not affiliated with, endorsed by, or sponsored by TradingView**.

- **Pine Script™** is a trademark of TradingView, Inc.
- All TradingView documentation references are for compatibility purposes only
- Use at your own risk

---

## 🙏 Acknowledgments

- **TradingView** - For creating Pine Script and providing comprehensive documentation
- **VS Code Team** - For the excellent extension API
- **Contributors** - Thank you to everyone who has contributed!

---

## 📬 Support

- **Issues:** Report bugs via [GitHub Issues](https://github.com/jpantsjoha/pinescript-vscode-extension/issues)
- **Questions:** Ask in [GitHub Discussions](https://github.com/jpantsjoha/pinescript-vscode-extension/discussions)
- **Updates:** Watch this repo for new releases

---

**Made with ❤️ by the community, for the community.**

**Happy Trading! 📈**
