# Pine Script v6 IDE Tools

> **Professional Pine Script v6 development** in VS Code with IntelliSense, real-time validation, and 100% language coverage.

[![CI/CD](https://github.com/jpantsjoha/pinescript-vscode-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/jpantsjoha/pinescript-vscode-extension/actions/workflows/ci.yml)
[![Version](https://img.shields.io/visual-studio-marketplace/v/jpantsjoha.pinescript-v6-extension)](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/jpantsjoha.pinescript-v6-extension)](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/jpantsjoha.pinescript-v6-extension)](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

![Pine Script v6 Extension in Action](./images/screenshots/blog-image.png)
*Real-time validation, IntelliSense, and hover documentation for Pine Script v6*

![Function Signature Help](./images/screenshots/blog-image-function-tip.png)
*Complete function signatures with parameter hints and documentation*

---

## 🚀 Quick Start

### Install from Marketplace
Search for **"Pine Script v6 IDE Tools"** in VS Code Extensions or [install directly from marketplace](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)

### Or Install from VSIX
Download the latest `.vsix` from [Releases](https://github.com/jpantsjoha/pinescript-vscode-extension/releases) and install:
```bash
code --install-extension pinescript-v6-extension-0.6.3.vsix
```

---

## ✨ Features

### 🎯 **100% Pine Script v6 Coverage**
- **6,665 language constructs** from official TradingView reference
- **457+ functions** with autocomplete (ta.*, math.*, str.*, array.*, etc.)
- **31 constant namespaces** (xloc, yloc, extend, scale, display, etc.)
- **22 function namespaces** with full parameter validation
- **32 strategy.* variables** (position_size, equity, netprofit, etc.)

### 🧠 **Semantic checks — catches code that compiles and is still wrong**
- **Repainting** — `request.security()` reading the current, forming bar
- **`ta.*` in a conditional** — silently corrupts the indicator's own history
- **Accumulator lifetime** — a `var` total a loop re-adds to every bar and never resets, so it grows for the life of the chart
- **Scope errors** — `plot`/`bgcolor`/`barcolor` inside `if`, functions defined in a block
- **Platform limits** — 64 plots, 40 `request.*()` calls, counted before TradingView rejects you
- **Unbounded risk** — `strategy.entry` with no exit anywhere
- **Unguarded external feeds** (hint, from 0.6.3) — a hard-coded `"FRED:…"` or `"ECONOMICS:…"` request with no `ignore_invalid_symbol`, which halts on the chart with `Permission denied for symbol` when the viewer's plan cannot read it

Suppress one you have considered: `// pine-ignore: S1`

### 🔍 **Real-Time Validation**
- Catches undefined functions and variables
- Detects missing/extra parameters
- Validates namespace properties
- **Zero false positives** on the golden corpus — four committed fixtures
  exercising every construct that has ever produced one, asserted clean on every
  commit, plus real scripts checked locally

### 💡 **Intelligent IntelliSense**
- Smart autocomplete for all built-in functions
- Parameter hints with type information
- Hover documentation
- Namespace-aware suggestions

### 📝 **Syntax Highlighting**
- Complete Pine Script v6 syntax support
- Built-in variables and constants
- Keywords, operators, and functions
- Comments and strings

---

## 📖 Usage Examples

### Valid Pine Script v6 Code

```pinescript
//@version=6
indicator("My Indicator", overlay=true)

// All valid v6 syntax - no false positives! ✅
length = input.int(14, "Length")
source = input.source(close, "Source")

// Technical analysis with autocomplete
sma_value = ta.sma(source, length)
ema_value = ta.ema(source, length)
rsi_value = ta.rsi(source, 14)

// Math functions with precision parameter
rounded = math.round(close, 2)  // ✅ v0.4.4+ supports precision
max_val = math.max(open, close)

// Strategy variables fully supported
if strategy.position_size > 0
    plot(strategy.equity, "Equity")
    plot(strategy.netprofit, "Net Profit")

// Plot with all v6 constants
plot(sma_value, "SMA", color=color.new(color.blue, 50), style=plot.style_line)
plot(ema_value, "EMA", color=color.new(color.red, 50), style=plot.style_linebr)

// All namespace constants work
x = xloc.bar_index
y = yloc.price
e = extend.both
s = scale.left
```

---

## 🔧 Configuration

The extension works out of the box with zero configuration. All Pine Script v6 features are automatically recognized.

---

## 📊 What's New in v0.6.3

### Fewer false positives
- `request.security()` with a positional `lookahead` argument is no longer warned as repainting.
- `timestamp()` accepts every documented form, including date and time components with a timezone.
- Function parameters (including user-defined types) are no longer reported as undefined.

### Catch scripts that compile but still fail on the chart
- **S10** hints when a hard-coded external feed such as `"FRED:WTREGEN"` has no
  `ignore_invalid_symbol`. Without it, the whole script halts with
  `Permission denied for symbol` on any plan that cannot read that feed.
- `request.security("X")` without a timeframe and expression is now an error, as on TradingView.
- `barcolor()` inside an `if` is flagged as a scope error.

### Editor and package
- `enum` keyword highlighting.
- A leaner package: an unused validator and stale compiled files removed.

## 📊 Earlier: v0.6.2

### Accumulator lifetime — found in the field
A `var` total a loop re-adds to every bar and never resets grows for the life of
the chart, not just the bar — a defect that produces a plausible number and
survives a backtest. Now detected as **S3**, alongside the semantic checks
already shipped: repainting `request.security`, `ta.*` inside conditionals,
scope errors, platform limits, entries with no exit. Suppress one you have
considered with `// pine-ignore: S1` (or `S2`, `S3`, …).

### The engine is now a package
Published as [`pinescript-v6-validator`](https://www.npmjs.com/package/pinescript-v6-validator)
and shared with the agent plugin, so both cannot disagree about a file.

### False positives eliminated (0.5.x)
The coordinate forms of `line.new`, `label.new` and `box.new` are official v6
overloads, but the bundled reference only carried the `chart.point` form — so
correct code lit up red. Overloads are now modelled properly.

```pinescript
// Before v0.5.0: 10 errors on these three lines. Now: clean. ✅
line.new(x1=bar_index[1], y1=low[1], x2=bar_index, y2=high)
label.new(x=bar_index, y=high, text="hi")
box.new(left=bar_index[5], top=high, right=bar_index, bottom=low)
```

Also fixed: `for … in` loop iterators, comments and blank lines inside wrapped
calls, nested parentheses in arguments, user-defined `type`/`enum` namespaces, and
two indentation rules TradingView removed in December 2025.

### 12.8× faster
A 1,302-line script validates in **12.3ms**, down from 158ms.

### Caught up with Pine v6
Ten months of TradingView releases the bundled reference was missing —
multiline strings (`"""…"""`), `request.footprint()`, `calc_on_every_history_tick`,
`sort_field`, `active` on inputs, `timeframe_bars_back`, `syminfo.isin`,
`box.set_xloc()`.

### A real test gate
From 67 tests to a regression suite and golden corpus asserted to produce zero errors, with
paired "must still flag" cases for every fix — so a check can never be quietly
deleted instead of repaired.

See [CHANGELOG](./CHANGELOG.md) for complete version history.

---

## 🧪 Testing

- **A regression suite and golden corpus**, run on every commit: `npm test`
- **Golden corpus**: four committed fixtures asserted to produce zero errors, and
  proven able to fail — reintroducing a fixed bug turns them red
- **Paired regression tests**: every false-positive fix ships with a "must still
  flag" counterpart, so a check cannot be silently deleted instead of repaired
- **Performance budget**: enforced in CI (<100ms for a 1,300-line script)

```bash
npm test                          # full suite
node validate-cli.js file.pine    # headless single-file validation
```

## 📚 Documentation

- [ROADMAP](./ROADMAP.md) — build order, checked against the open issues
- [STATUS](./STATUS.md) — current session state
- [docs/PINESCRIPT-V6-SYNTAX-RULES.md](./docs/PINESCRIPT-V6-SYNTAX-RULES.md) — canonical syntax/style reference
- [docs/adr/](./docs/adr/) — architecture decision records
- [docs/guides/](./docs/guides/) — contributor, testing, release and AI-assistant guides

## 🤝 Contributing

Contributions welcome! See [docs/guides/CONTRIBUTING.md](./docs/guides/CONTRIBUTING.md) for guidelines.

### Found a Bug?
- Check [existing issues](https://github.com/jpantsjoha/pinescript-vscode-extension/issues)
- Create a new issue with:
  - Pine Script code that triggers the problem
  - Expected vs actual behavior
  - Extension version

### Want to Help?
- Report false positives/negatives
- Suggest feature improvements
- Submit pull requests
- Share feedback

---

## 🔗 Related Projects

| Project | What it is |
|---|---|
| **[pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin)** | Pine Script v6 skills and MCP tooling for **coding agents** — consumes this extension's validation engine, so an agent and your editor never disagree about a file. |

---

## 📚 Resources

- **Marketplace**: [Pine Script v6 IDE Tools](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)
- **Repository**: [GitHub](https://github.com/jpantsjoha/pinescript-vscode-extension)
- **Issues**: [Bug Reports](https://github.com/jpantsjoha/pinescript-vscode-extension/issues)
- **Releases**: [Changelog](https://github.com/jpantsjoha/pinescript-vscode-extension/releases)
- **Story**: [How This Extension Was Built](https://jaroslav-pantsjoha.medium.com/couldnt-find-a-pinescript-language-support-on-ide-so-i-built-one-enjoy-1fe57df0560f) (Medium)
- **TradingView Pine Script Reference**: [Official Docs](https://www.tradingview.com/pine-script-reference/v6/)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Created by **[Jaroslav Pantsjoha](https://jpantsjoha.com)**

- Website: [jpantsjoha.com](https://jpantsjoha.com)
- GitHub: [@jpantsjoha](https://github.com/jpantsjoha)
- LinkedIn: [in/johas](https://uk.linkedin.com/in/johas)

Special thanks to:
- TradingView for Pine Script
- VS Code extension development community
- All contributors and testers

---

**Full Language Coverage**: 6,665 Pine Script v6 constructs
**Test Coverage**: a regression suite and golden corpus — run `npm test`
**Current Version**: 0.6.3
