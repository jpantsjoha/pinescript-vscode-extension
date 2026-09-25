# Pine Script v6 — AI Assistant Context

Context for any AI assistant (Gemini, Claude, Copilot, or other) writing or reviewing
Pine Script v6 code in this repository. Claude Code should prefer the
`.claude/skills/pinescript-v6/SKILL.md` skill, which covers the same ground in a
form the harness loads automatically; this file is for assistants that do not load
that skill, and doubles as a compact Pine v6 language reference.

**Repository:** https://github.com/jpantsjoha/pinescript-vscode-extension
**Official docs:** https://www.tradingview.com/pine-script-docs/
**Language reference:** https://www.tradingview.com/pine-script-reference/v6/
**Project rules:** `CLAUDE.md` at the repo root

---

## How this repo works

**The one rule that matters:** a false positive is worse than a missed error. Users
see squiggles on correct code and uninstall. Any validation change must be proved in
both directions — it silences the false positive AND still catches the real error.

**Three diagnostic sources ship**, all wired into `validate-cli.js` and
`test/golden-corpus.test.js`:
1. `packages/validator/src/accurateValidator.ts` — signatures, arity, namespaces.
   Regex-over-lines, no AST, so it cannot do type inference.
2. `packages/validator/src/documentChecks.ts` — whole-document heuristics.
3. `packages/validator/src/semanticChecks.ts` — semantic checks S1-S3, S5-S10 (S4 is
   specified but not built; S10 is an info-level hint, not a warning).

All three come from one engine, `packages/validator`, built locally into
`dist/engine/`; the editor, the CLI and the MCP server load the same files.

**Validate before trusting generated code:**
```bash
npm run build                             # required once after any TypeScript change
node validate-cli.js <file.pine>          # dist/engine — the same engine the editor runs
npm test                                  # full suite; golden corpus must stay at 0 errors
```
Exit code 0 means no severity-0 errors.

**Where the data lives** — `packages/validator/data/parameter-requirements-merged.ts` =
`{...GENERATED, ...MANUAL}`, manual wins:

| File | Role |
|---|---|
| `parameter-requirements-generated.ts` | Auto-scraped 2025-10-03, 457 functions. A point-in-time crawl — anything TradingView shipped later is absent. |
| `parameter-requirements.ts` | Hand-verified overrides + `MODERN_V6_FUNCTIONS` (API added after the scrape). Corrections go here, never in the generated file. |
| `pine-constants-complete.ts` | Constants by namespace |
| `pine-builtins-complete.ts` | Namespaces, keywords, standalone built-ins |
| `v6-manual.ts` | Hover/completion descriptions |
| `v6/raw/v6-language-constructs.json` | 6,665 official items straight from TradingView (metadata, keywords, operators, constants, functions) |

Overloaded functions (`line.new`, `label.new`, `box.new`, `timestamp()`, …) carry an
explicit `overloads` array; a call is valid if it satisfies ANY overload. Never
flatten overloads into one parameter list.

**Fixing a reported false positive:** reproduce with the smallest snippet, verify
against the official reference and the
[release notes](https://www.tradingview.com/pine-script-docs/release-notes/) (rules
get *removed* too — TradingView dropped wrapped-line indentation restrictions in
December 2025), add the reduced script to `test/golden-corpus.test.js` before
fixing it, then add a paired case to `test/false-positive-regression.test.js`: one
that must be clean, one that must still flag.

**MCP:** `mcp/pinescript-mcp-server.js` exposes `validate_pine_script`, backed by
all three diagnostic sources above — `AccurateValidator`, `documentChecks`, and the
engine's semantic checks — so an MCP client and the editor never disagree about a
file. See [mcp-integration.md](./mcp-integration.md) for setup and tools.

---

## Pine v6 cheat sheet

### Execution model (the most important concept)

A script runs once per historical bar, then once per real-time tick.
- **Series**: value can differ per bar (`close`, `ta.sma(...)`).
- **Simple/const**: same value on every bar (`input.int(14)`, a literal).
- **`var`**: declares once on the first bar, persists across bars — required for
  accumulation or state.
- **`varip`**: persists across ticks within a bar (advanced, rarely needed).

```pine
// ❌ resets every bar — result is always 1
int sum = 0
sum := sum + 1

// ✅ accumulates: 1, 2, 3, 4...
var int sum = 0
sum := sum + 1
```

### Standard script structure

```pine
//@version=6
indicator("My Indicator", overlay=true)        // or strategy(...)

import jpantsjoha/my_library/1 as lib           // imports, if any

type Trade                                      // type definitions, if any
    float entry
    float exit

const int LOOKBACK = 20                         // constants

int lengthInput = input.int(14, "Length", minval=1)   // inputs, grouped

var float cumVolume = 0.0                       // stateful variables

float sma = ta.sma(close, lengthInput)          // calculations

if ta.crossover(close, sma)                     // strategy calls
    strategy.entry("Long", strategy.long)

plot(sma, "SMA", color=color.blue)              // visuals
plotshape(close > sma, style=shape.triangleup, location=location.belowbar)

alertcondition(close > sma, "Cross", "Price crossed SMA")   // alerts
```

### Gotchas that produce real compile or runtime errors

- `ta.*` functions must execute on **every** bar — never inside a ternary or `if`
  branch. Extract to an unconditional variable first.
- Cache `request.security()` in a variable; never repeat the call inline.
- Anti-repaint: `request.security(syminfo.tickerid, "D", close[1])`, not `close` —
  the un-offset form reads the still-forming current bar.
- `plotshape()` / `plotchar()` take `style=shape.xxx`, **not** `shape=shape.xxx`.
- `color.new(col, transparency)` for transparency; the old `transp` parameter is gone.
- `box.new` / `label.new` / `line.new` each have two valid overloads — a
  `chart.point` form and an independent-coordinate form.
- Loops: 500ms execution budget per bar; an unbounded loop times out.
- `switch` is preferred over long `if/else` chains (v6 feature, more readable).
- `and`/`or` short-circuit — put the cheap condition first for performance.

### Debugging tools

- `log.info("value: {0}", x)` — the modern way to inspect a value at runtime; goes
  to the Pine Logs panel, not the chart.
- `plot(x, "debug")` — visualize how a series evolves.
- `label.new(bar_index, high, str.format(...))` — point-in-time state at an event.
- `table.*` — persistent dashboards for multiple values at once.

### Platform limits (verify against the
[Limitations doc](https://www.tradingview.com/pine-script-docs/writing/limitations/)
before relying on a figure)

- Max script size: 80,000 tokens · max local variables: 1,000/scope
- Max plots: 64/script · max `request.*()` calls: 40 (64 Pro+)
- Compilation timeout: 2 minutes
- Script execution: 20s (basic) / 40s (Premium+) per bar · loop: 500ms/bar
- Historical buffer: 5,000 bars (20,000 Pro+) · array/matrix/map: 100,000 elements
- Labels/lines/boxes: 500 max on chart

### v5 → v6, the changes that break scripts

| v5 | v6 |
|---|---|
| `plot.style_dashed` | `plot.style_linebr` (dashed style was removed) |
| `resolution` | `timeframe.period` |
| `scale` parameter on `plot()` | `display` parameter |
| `transp` parameter | `color.new(col, transparency)` |

The shipping `AccurateValidator` does not warn on v5 constants — check this table
yourself when converting a script. Full guide:
https://www.tradingview.com/pine-script-docs/migration-guides/to-pine-version-6/

---

**Disclaimer:** unofficial, community-maintained. Verify generated code on the
TradingView platform before live trading. Pine Script™ is a trademark of
TradingView, Inc.
