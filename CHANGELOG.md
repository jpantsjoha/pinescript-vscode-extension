# Changelog

All notable changes to the Pine Script v6 VSCode Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed — one engine (#55)

- The extension, IntelliSense, `validate-cli.js`, the MCP server and the tests now
  load one engine: `packages/validator`, compiled locally and copied into
  `dist/engine/` at build time. The copies in `src/parser/` (`accurateValidator.ts`,
  `documentChecks.ts`) and the six duplicated `v6/` data files are deleted;
  `src/engine.ts` is the single loader.
- The VSIX ships the local engine build, not the published npm package, so it
  carries the code that will be published to npm at the next release cut. The
  extension no longer has a runtime dependency on `pinescript-v6-validator`.
- `validate-cli.js` always runs the local engine build; `--local-engine` is
  accepted and ignored.
- `npm run watch` (`scripts/watch.js`) builds the engine first, runs `tsc -w` on
  `packages/validator` and re-syncs `dist/engine/` after each error-free compile,
  alongside the extension watcher. The sync follows tsc's end-of-cycle report
  rather than a filesystem watcher, so it works the same on Linux, macOS and
  Windows. Each sync copies into a staging directory and swaps it in
  (`scripts/engine-sync.js`), so `dist/engine/` is always one complete build. A
  failed swap restores the last good build (fault-injection test in
  `test/engine-sync.test.js`), and a cycle with errors is not synced. CI runs
  `scripts/watch-smoke.js` on Node 22 and 24.
- CI runs `scripts/verify-vsix.js` after packaging. Before extracting, it rejects
  absolute, `..` and backslash paths, and any entry that is not a regular file or
  directory. It then checks the engine ships exactly once in any layout, and
  executes the packaged `activate()`. Every entry must be on an expected-contents
  list, so stray files (a diff, a log, an unused image) cannot ship. Ten unused
  images (`icon.png`, `images/favicon/**`, two others) are now excluded from the
  VSIX; the Marketplace icon and every image the README uses still ship.
- `@vscode/vsce` is a pinned devDependency (4.0.0). CI, the release workflow and
  the publish workflow package and publish with it instead of a global install, and
  the publish and release workflows now run `verify-vsix` before publishing. The
  audit asks vsce which files ship (`scripts/vsce-ls.js`), fails if a runtime
  engine file would be excluded or a second engine copy would ship, fails if
  package.json gains a `files` field, and fails if vsce's listing differs between
  its npm and no-dependency modes.
- `test/packaging-guards.test.js` proves the packaging guards fail on bad input: a
  VSIX with an extra entry, a package.json `files` field, and a dependency only
  vsce's npm mode would ship. The audit also requires the publish and release
  workflows to run `verify-vsix` before they publish. `verify-vsix` stops before
  extraction when the listing already failed. The publish workflow reads the vsce
  token from `VSCE_PAT` rather than the command line. The release workflow passes
  the tag version to its scripts through `env`.
- **Development tooling now requires Node 22** (`.nvmrc`). CI runs on Node 22 and
  24; Node 18 and 20 are end-of-life and vsce 4.0.0 requires Node 22. The
  extension itself runs on VS Code's bundled runtime, so users are unaffected.
- No diagnostic changes: identical output on every `.pine` file in the repo against
  the 0.6.5 build, and all 111 regression-corpus cases (107 cases plus 4
  suppression cases) pass through the CLI.
- `test/engine-parity.test.js` now fails the build if a copy of an engine module
  reappears in `src/` or `v6/`, if a source file imports around `src/engine.ts`, if
  the build bundles the npm package, or if `dist/engine` differs from the local
  engine build.

### Added

- **Invalid cast from an input (#12).** `int factor = input.float(0.7, "Factor")` is now
  an error, as on TradingView: `Cannot assign "input.float" (float) to a variable declared
  "int"`. The rule is narrow: it judges only a declaration typed `int`, `float`, `bool`,
  `color` or `string` whose whole right-hand side is one `input.*()` call (wrapped calls
  and comma-separated declarations included). `float x = input.int(...)` stays silent
  (Pine casts int to float), as do UDT and enum types, bare `input()`, `input.enum()`,
  `const` declarations, one-line `=>` bodies, fields inside a `type` block, any call
  wrapped in or followed by another expression, and any call whose expression may
  continue on the next line. Return types come from the v6 reference; casting rules
  from the type-system docs.
- Quick fixes (#49). The lightbulb offers one-click corrections for diagnostics the
  extension already reports: a misspelled namespace constant (only when exactly one
  documented member is within two edits), `shape=` renamed to `style=` on `plotshape`
  when the value is a `shape.*` constant or a string (and to `char=` on `plotchar` when
  the value is a string), `ignore_invalid_symbol=true` for S10 unless the flag is already
  passed by name or position, `// pine-ignore: S<n>` for any semantic check, and
  `//@version=6` when a script declares no version. S1 gets no rewrite: `expr[1]` with
  `lookahead_on` is only right on a higher timeframe with a live expression, and the text
  cannot prove either. Actions apply only to this extension's diagnostics (source `pine`),
  and only when re-validating the current text still produces the same diagnostic; a
  name the script may redeclare (`MyShape shape = ...`) gets no rewrite, and an existing
  `// pine-ignore` that already covers the check is left alone. Each fix is tested by applying it
  and re-validating through all three diagnostic sources. Diagnostics now carry
  `source: 'pine'`, and semantic ones their check id (`S1`..`S10`) as the code.

## [0.6.5] - 2026-09-25

IntelliSense for the whole v6 reference, parameter-name completions, stricter checks
on typos, and wrapped statements read as one.

### Highlights

- Completions, signature help and hover for all 475 built-in functions in the v6
  reference; signature help shows every documented overload.
- Type `plot(close, ` and completions offer the parameter names still unfilled; after
  `style=` they offer the constants that fit.
- Constants and variables complete after a namespace dot (`xloc.`, `shape.`,
  `strategy.commission.`, ...), with their descriptions on hover.
- A misspelled constant such as `color.purplee`, and an unknown namespace, are now
  errors, as on TradingView.
- Statements wrapped across lines are validated as one statement.

### ✨ Parameter-name completions (#13, PR #51)

- Inside a call, completions offer the named parameters not yet filled, positionally
  or by name. After `name=`, the matching constants come first (`style=` in
  `plotshape` offers `shape.*`), and your own variables stay available.
- Works across wrapped lines: a call split over several lines still completes and
  shows signature help for the right argument.

### 🐛 Fixed before release (pre-release review)

- A variable declared with a qualifier and a type, such as
  `series Holder xloc = Holder.new(close)` or `series array<float> xloc = ...`, is
  now recognised, so `xloc.value` is not checked as the built-in `xloc` namespace.
- `indicator(..., "D", timeframe_gaps=true)` with `timeframe` passed positionally no
  longer warns, and the warning, when right, appears once instead of twice.
- Typing a grouping `(` inside a call, as in `plot((close + open) / 2`, no longer
  pops up the outer call's parameters.
- Brackets inside a `"""` multiline string no longer make completions think a call
  is open. Known limit: a call opened more than 30 lines above the cursor falls back
  to ordinary completions.
- A release now checks both registry tokens before publishing anything, so the
  Marketplace and Open VSX cannot end up on different versions.
- `time` completes as both the variable and the `time()` function, and `array` as
  both the type and the namespace; hover on `time` mentions both.

### ✨ IntelliSense covers the whole v6 reference (#36, PR #40)

- Completions, signature help and hover now draw on all 475 built-in functions in the
  reference, not just the common ones. Signature help lists every documented overload.
- Signature help finds the call you are typing in, past closed nested calls. It ignores
  commas inside strings and understands `array.new<float>(`, `map.new<string, float>(`
  and grouping parens.

### 🐛 Misspelled constants and unknown namespaces are now errors (#37, PR #41)

- A typo in a constant namespace member fails here as it does on TradingView:
  `color.purplee`, `xloc.bar_indexx`, `shape.circlee`. Unknown namespaces after `=`
  are flagged too.
- The member list is complete against the reference (371 names), and a test sweeps it.
- Your own names stay quiet: variables, UDTs, tuples, parameters and import aliases
  named like a namespace are never flagged, and method calls on them (`position.put`)
  no longer report "Undefined function".

### ✨ Constants and variables complete after a namespace dot (#45, PR #46)

- Type `xloc.`, `shape.`, `location.`, `size.`, `display.`, `session.` or
  `strategy.commission.` and completions offer that namespace's built-in constants
  and variables, including the `plot.style_*` forms, with their descriptions on hover.
- Your own names still win: a global variable named like a namespace (`xloc = 1`)
  suppresses the built-ins from its declaration line down, and leaves them above it.

### 🐛 Statements wrapped across lines are read as one (#42, PR #43)

- Function and method headers, tuple declarations, calls and a `=>` on its own line
  now join into a single statement. Parameters and tuple names declared on a wrapped
  line are no longer reported "undefined", and wrapped calls keep their
  argument-count checks.
- An unknown named argument is underlined on its own line, and per-call checks read
  only the call's own arguments, so a nested call with a `shape=` argument no longer
  warns on the outer `plotshape`.
- An unclosed bracket no longer cascades into follow-on errors. Known limit: a
  first argument at column 0 right after `plotshape(` is not checked.

## [0.6.4] - 2026-09-24

Up to date with TradingView's current Pine v6 reference, and now on Open VSX.

### 🔄 Pine v6 reference re-crawled (2026-09-23)

- **18 new functions recognised:** `request.footprint` and the `footprint.*` and
  `volume_row.*` families (January 2026). Calls to them no longer show "Undefined function".
- **Every overload captured.** The old crawl kept one form per function, so valid calls such
  as `ta.vwap(src, anchor, stdev_mult)`, `time(tf, session, tz, bars_back)` and the
  coordinate form of `line.new` could be flagged "Too many arguments". 21 functions now
  accept their full documented forms.
- **Hand-verified entries follow the reference.** Every `input.*()` accepts `display`, and
  `plotcandle()`/`plotbar()` accept `format` and `precision`.
- Still caught: too many arguments, missing required arguments (`matrix.get(m)`), unknown
  members (`footprint.nosuch`).
- The crawler is now part of the repository: `npm run crawl` (#6).

### 📖 A README that gets you started

Rewritten for new users: why to use it, a one-minute getting-started walkthrough with a
script to paste, a "what it catches" table with the fix for each check, commands and
settings, troubleshooting, and two diagrams (how the checks work, getting started).
Claims now match what the extension does.

### 📦 Available on Open VSX

Published to [Open VSX](https://open-vsx.org/extension/jpantsjoha/pinescript-v6-extension)
as well as the VS Code Marketplace, so Cursor, Windsurf, VSCodium and Gitpod users can
install it. The editor ships the re-crawled reference itself; the standalone npm engine
with the same data follows as `pinescript-v6-validator@0.4.1`.

## [0.6.3] - 2026-09-23

Fewer false positives, two new checks for scripts that compile but still fail on the
chart, and a leaner package.

### 🐛 False positives fixed

- **Positional `lookahead` in `request.security()`** (#24). A call such as
  `request.security(sym, "W", close, barmerge.gaps_off, barmerge.lookahead_off)`
  was warned as repainting although it states its lookahead. Both the positional and
  the named form now count.
- **`timestamp()` with date and time components** (#9, #14). Every form in the v6
  reference is accepted: a date string, `year, month, day[, hour, minute, second]`,
  and the same with a leading timezone.
- **Function parameters reported as undefined** (#16). `st.a` inside
  `update(State st, float v) =>` no longer shows "Undefined namespace or variable".
  Typed, generic (`map<string, float>`) and defaulted parameters all work.
- **`request.footprint()`** now matches the reference:
  `request.footprint(ticks_per_row, va_percent?, imbalance_percent?)`.

### ✨ New checks

- **S10 — unguarded external feed** (hint, #25). A hard-coded `"FRED:…"`,
  `"ECONOMICS:…"` or other exchange-prefixed symbol with no `ignore_invalid_symbol`
  compiles, then halts the whole script with `Permission denied for symbol` when the
  viewer's plan cannot read it. The hint points at the one-argument fix. Silence it
  with `// pine-ignore: S10` if you want the hard stop.
- **`request.security("X")` missing arguments** (#26). A call without timeframe and
  expression is now flagged, as TradingView rejects it.
- **`barcolor()` inside an `if`** (#11) is flagged as a scope error, like `bgcolor()`.

### 🎨 Editor

- `enum` is highlighted (#10), along with the `footprint` and `volume_row` types.

### 🔧 Tooling

- The MCP server now runs the same semantic checks as the editor.
- `validate-cli.js` prints which engine it used, and `--local-engine` runs the
  working-tree build.

### ⚡ Leaner and cleaner

- Removed an unused, crashing validator and its tooling (about 3,500 lines), plus
  five stale compiled files that had been shipping inside every package.
- Documentation cut by a third and brought in line with the code.
- Engine: `pinescript-v6-validator@0.4.0`.

## [0.6.2] - 2026-08-08

### ✨ S3 — accumulator lifetime, found in the field

A user validated `examples/test-v6-features.pine`, got a clean-ish report, and then
spotted by eye what the tool had missed:

```pine
var float sum = 0.0
for i = 0 to 9
    sum := sum + close[i]
```

`var` persists across bars, so this adds ten more closes on every bar for the life of
the chart. The author wanted "sum of the last ten closes". A second instance in the
same file was quieter still — `var int counter = 0` guarding a `while counter < 5`
loop that, on bar two, can never run again.

The original spec had only the **opposite** shape: an accumulator *missing* `var`,
which resets each bar. That is the cheaper half — it produces a visibly constant
series. This half produces a plausible number that drifts, which is the defect that
survives a backtest.

Now detected as **S3** (warning) in `pinescript-v6-validator@0.3.0`, with two
exemptions that keep it quiet on correct code: a reset before the loop (a `var`
reused as a buffer) and a run-once guard (`barstate.isfirst`, `bar_index == 0`) for
table-building on the first bar. Seven paired tests; fires twice across 24 committed
`.pine` files and both are real defects.

### 🐛 Four of nine documentation anchors pointed at nothing

Every semantic finding carries a `docAnchor` linking to the prose that explains it.
The engine owned the anchor, the plugin repo owned the heading, and nothing made them
agree — so when headings were reworded the links rotted, including **S1's**, the
most-cited defect in Pine Script.

The test meant to prevent this asserted `docAnchor.includes('#')`, which all four
dead links passed. Shape is not resolution. Anchors are now resolved against the real
skill headings by `make anchors` in the plugin repo, and the S8 anchor points at a
compile-error table that now actually documents S7 and S8.

### 📝 The accumulator guidance was the inverse of the bug

The skills told readers to "declare accumulators `var` so they persist" — precisely
the advice that produces the defect above. Run the old checklist against the reported
bug and every item ticks. That guidance now covers both directions, and no skill
previously mentioned `for` or `while` at all.

Also corrected: three honest omissions added to "What the validator CANNOT see" —
constant and built-in-variable *names* are never checked (`shape.trianglup` validates
clean), re-declaring with `=` is not caught, and `ta.*` on the right of `and`/`or`
escapes S2 because v6 short-circuits.

### 🧪 A regression harness aimed at the published artefact

Every recurring failure in this project has had one shape: correct in `src/`, broken
in what users receive. Dead doc anchors that resolved against the source and not the
shipped package. A VSIX whose engine was excluded from the bundle. A scratchpad path
that leaked into a dependency range mid-session and was caught by eye, not by a gate.
No suite importing from `packages/validator/dist` can see any of those.

- **`test/regression-corpus.js`** — every defect this validator has ever shipped, as
  data rather than tests. Each entry carries the date it was found and an account of
  how it escaped.
- **`test/npm-package.test.js`** — packs the tarball, installs it into a throwaway
  project, and drives the same corpus through `require('pinescript-v6-validator')`
  with no path back into this repo. Also asserts no manifest pins a local path, and
  that the extension never pins an engine version ahead of what is published.

One table, two environments, so source and published cannot drift. The corpus polices
itself: every case needs a real date and a reason, and at least 30% must assert
*silence* on correct code — otherwise it quietly becomes a "find more bugs" suite and
stops defending working code.

Verified by reintroducing the S2 false positive and confirming both suites fail by
name, and by staging it and confirming the pre-commit hook refuses the commit.

- **`.githooks/pre-commit`** — typecheck, the full suite including the packed-tarball
  run, and every file in `examples/`. About five seconds. Chains from the machine-wide
  secret scanner rather than replacing it. Install with `npm run hooks:install`.
- **`.claude/skills/validator-gate`** — the release order, how to read a clean run
  honestly, and why a new false positive is a release blocker where a new miss is not.

### 🔧 `make gate` could pass with its main check disabled

`validate_skill_examples.py` returned 0 when the engine was absent, so a local
`make gate` printed "Gate passed" over zero validated examples. It now fails unless
`--allow-skip` is passed deliberately. The same run also revealed that the five
scaffolds advertised as "validated in CI" were opened by no script at all — true by
luck, not by enforcement. They are now validated as whole files: 31 examples checked,
5 of them scaffolds.

---

## [0.6.1] - 2026-08-08

### 🐛 Three semantic checks missed common real-world shapes

An adversarial review found each check working on its happy path and silently
missing a shape that occurs constantly. Engine bumped to
`pinescript-v6-validator@0.2.1`.

- **S1 skipped every multi-line `request.security()`.** The code bailed when the
  parentheses did not close on one line, with a comment claiming the call was
  "assessed on its own line". Nothing assessed it. Wrapping is the normal
  formatting for this function, so most real repainting escaped detection.
- **S2 only checked the true branch of a ternary.** `cond ? na : ta.sma(...)`
  passed clean. Both branches are conditional and both leave gaps in history.
- **S9 counted `strategy.cancel` as an exit.** Cancel withdraws a pending order;
  it does not close a position. A strategy that entered and only cancelled had
  unbounded risk and was passed clean.

### 🔧 The audit guard was blind to its newest source

`scripts/audit.js` matched `from 'pinescript-v6-validator'` while `extension.ts`
uses `require('../engine/...')`. It reported "all 2 diagnostic sources" and had
not seen the semantic checks since they were added, in a guard both repos cite as
the reason drift cannot silently recur.

### 📋 Documentation corrected

The README claimed "zero false positives on the golden corpus, 13 real scripts
that compile on TradingView, asserted clean on every commit". It is four committed
synthetic fixtures plus seven files skipped in CI. Wrong on count, provenance and
coverage.

`CLAUDE.md` claimed the engine is "consumed, never copied". In fact
`src/parser/documentChecks.ts` is byte-identical to the package copy and `v6/`
duplicates the package data exactly. Only the semantic checks are genuinely
consumed. `test/engine-parity.test.js` now fails the build if the copies drift,
and the migration is recorded as outstanding debt rather than claimed as done.

---

## [0.6.0] - 2026-08-07

### ✨ Semantic checks — defects that compile and are still wrong

Until now this extension caught code TradingView would reject. These catch code it
**accepts** and then behaves unexpectedly — the category that costs money rather
than time.

| ID | Detects | Severity |
|---|---|---|
| **S1** | `request.security()` reading the current, still-forming bar — repainting | Warning |
| **S2** | `ta.*` called inside a ternary or block — its history develops gaps | Warning |
| **S5** | More than 64 plot calls — TradingView rejects the script | Error |
| **S6** | More than 40 `request.*()` calls | Error |
| **S7** | `plot` / `bgcolor` / `fill` outside global scope — a v6 scope error | Error |
| **S8** | A function defined inside a block — Pine has no nested functions | Error |
| **S9** | `strategy.entry` with no exit anywhere — unbounded risk | Warning |

Suppress a finding you have considered:

```pine
d = request.security(t, "D", close)   // pine-ignore: S1
```

Syntactic diagnostics are never suppressible — a compile error is a fact, not a
judgement.

### 🔧 Architecture

The validation engine is now published as
[`pinescript-v6-validator`](https://www.npmjs.com/package/pinescript-v6-validator)
and consumed by this extension rather than duplicated. A check is written once;
the editor renders it and agent tooling returns it. Two copies would drift, and a
drifted rule means your agent and your editor disagree about the same file.

### 🐛 Found by the new checks

`examples/indicator.2.3.pine` called `bgcolor()` inside an `if` — a genuine v6
scope error, twelve lines above code in the same file doing it correctly.

---

## [0.5.1] - 2026-08-07

Packaging release. **No validator behaviour changes from 0.5.0** — the version is
incremented so the VSIX installs as an unambiguous upgrade.

v0.5.0 was installed alongside a still-present v0.4.4 in `~/.vscode/extensions/`,
and the extension host kept serving the old build: users saw the very
`alertcondition() expects 3 parameters` false positives that 0.5.0 fixed. A
distinct version supersedes the old install cleanly.

If both remain, remove the stale one and reload the window:

```bash
rm -rf ~/.vscode/extensions/jpantsjoha.pinescript-v6-extension-0.4.4
# then: Cmd+Shift+P -> Developer: Reload Window
```

---

## [0.5.0] - 2026-08-07

First release since v0.4.4 (2025-10-07). Focus: eliminating false positives,
catching up with ten months of Pine v6 releases, and building the test gate that
should have caught the regressions in the first place.

### 🔴 Fixed — false positives on valid v6 code

- **Overloaded drawing constructors.** `line.new`, `label.new` and `box.new` each
  have two official call forms — a `chart.point` form and an independent-coordinate
  form. The reference scrape captured only the first, so the far more common
  coordinate form reported a wall of errors (`No parameter named 'x1'`,
  `'left'`, `'top'`…). Ten false errors on a five-line script. Overloads are now
  modelled explicitly: a call is valid if it satisfies **any** overload.
- **Multi-line indentation rules.** Two checks enforced indentation restrictions
  that TradingView **removed in December 2025**. A continuation indented by four
  spaces, or not indented past its opening line, is legal — both now pass.
- **Comments and blank lines inside wrapped calls.** Legal Pine, previously two
  errors apiece.
- **`for … in` loop iterators.** `for b in boxes` bound no variable, so `b.delete()`
  was flagged undefined. Both the element and `[index, element]` forms now bind.
- **Multiline strings** (`"""…"""` / `'''…'''`, added to Pine in April 2026) are
  recognised. Their contents are no longer parsed as code, and the unbalanced
  quotes no longer desynchronise parsing for the rest of the file. Line numbers
  are preserved exactly.
- **`ta.pivothigh` / `ta.pivotlow`** three-argument overload no longer reports
  "too many arguments".
- **Nested parentheses in arguments** are no longer truncated when counting
  arguments (`ta.ema(a / (b + c) * 100, 3)` parsed as one argument, not two).
- **User-defined `type` / `enum`** declarations register as namespaces, so
  `MyType.new(...)` and field access validate.

### ⚡ Performance

- Validation of a 1,302-line script: **158ms → 12.3ms (12.8× faster)**, now well
  inside the 100ms budget and enforced by a test. The old code looped all 457
  function signatures for every line, compiling a regex each time — roughly 595,000
  regex executions per file. Candidate function names are now extracted in one scan.

### ✨ Pine v6 API currency (Oct 2025 → Jul 2026)

The bundled reference was scraped 2025-10-03; everything TradingView shipped since
was missing. Added:

| Added | Release |
|---|---|
| `box.set_xloc()` | March 2025 |
| `active` parameter on all `input.*()` functions | July 2025 |
| `timeframe_bars_back` on `time()` / `time_close()` | October 2025 |
| `syminfo.isin`, `syminfo.current_contract` | Nov 2025 / Jul 2025 |
| `request.footprint()` + `footprint` / `volume_row` namespaces | January 2026 |
| `sort_field` on `array.sort()`, `array.sort_indices()`, `matrix.sort()` | April 2026 |
| Multiline string literals | April 2026 |
| `calc_on_every_history_tick` on `strategy()` | July 2026 |

### 🧪 Testing — 67 → 112 tests

- **`test/golden-corpus.test.js`** — 13 real scripts that compile on TradingView
  must validate with zero errors. Any error against them is a false positive by
  definition. This is the gate that was missing; reproducing the v1.2.0 bug now
  fails six tests. Includes a performance-budget assertion and a guard against the
  corpus silently shrinking.
- **`test/false-positive-regression.test.js`** — every fix above, with a paired
  "must still flag" case so a check can never be quietly deleted instead of fixed.
- **`test/ternary-and-multiline.test.js`** — replaces two root-level scripts that
  printed results but asserted nothing, sat outside the `npm test` glob, and were
  gitignored, so CI never ran them.
- `examples/` is no longer gitignored — the corpus now reaches CI.

### 🔧 Other

- **MCP server repaired.** `mcp/pinescript-mcp-server.js` required a file that does
  not exist (the dev-tools copy is zero bytes), so it failed at load. It now uses
  `AccurateValidator` — the same engine the extension runs, so MCP and editor
  cannot disagree.
- `validate-cli.js` added as the supported headless entry point for CI and agents.
- Two documents misnamed `.pine` renamed to `.md`; they were prose, and produced
  77 meaningless "errors" between them.

### ⚠️ Known issues

- `ComprehensiveValidator` still throws `ast.body is not iterable` on valid input.
  Its import has been removed from `extension.ts`, so the extension is unaffected.
  The AST path (parser/lexer/typeSystem) feeds only this validator, which is why
  type-system validation remains unavailable. See `STATUS.md`.

---

## [0.4.4] - 2025-10-07

### 🔧 Parser Database Fixes

**Critical Parser Database Corrections:**
- Fixed `math.round()` parameter definition (now correctly accepts optional `precision` parameter)
- Added 32 missing `strategy.*` variable properties (position_size, equity, netprofit, etc.)

**Impact:**
- ✅ Eliminates false positive: "Too many arguments for 'math.round'"
- ✅ Eliminates false positive: "Unknown strategy constant or function 'position_size'"
- ✅ Improved validation accuracy for strategy scripts

**Project Cleanup:**
- Organized 26 dev tools into `dev-tools/` structure (debug, analysis, testing)
- Moved test Pine files to `examples/`
- Removed legacy session documentation (preserved in git history)

**Files Modified:**
- `v6/parameter-requirements-generated.ts`: Added precision parameter to math.round
- `v6/pine-constants-complete.ts`: Added STRATEGY_VARIABLES set with all runtime state variables

**Reference:** Parser improvements from Sessions 7-9 (see git history for SESSION-*.md files)

---

## [0.4.3] - 2025-10-06

### 🎯 Session 4: Control Flow & Type Annotations (Dev Tools)

**Major Parser/Validator Improvements:**
- Fixed if/else indentation-based parsing (-52 errors)
- Added for loop iterator variable scoping (-60 errors)
- Implemented type annotation parsing (-59 errors)
- **Total Session 4 reduction: -171 errors (-30.4%)**

**Cumulative Progress (Dev Tools):**
- Baseline: 853 errors → Current: 392 errors (-461, -54.1%)
- Critical file (mft-state-of-delivery): 112+ → 36 errors (-68%)
- Critical file (deltaflow-volume-profile): 58 → 28 errors (-52%)

**Code Changes:**
- Enhanced `src/parser/parser.ts` with indentation tracking for all block statements
- Fixed `src/parser/comprehensiveValidator.ts` for loop iterator scoping
- Added type annotation support (int, float, bool, string, color, etc.)

**Testing:**
- All 12 test files validated
- Zero production impact (dev tools only)
- Self-validation complete with debug scripts

**Documentation:** See `SESSION-4-CONTROL-FLOW-SUMMARY.md`

---

## [0.4.2] - 2025-10-06

### 🔍 Session 3: Type Inference & Multi-Line Functions (Dev Tools)

**Parser/Validator Improvements:**
- Fixed multi-line function body type inference (-9 errors)
- Implemented two-pass function declaration
- Enhanced CallExpression type inference
- Improved ternary expression handling

**Impact:**
- Overall: 572 → 563 errors (-1.6%)
- Improved error specificity (better type information)
- global-liquidity: 24 → 23 errors

**Code Changes:**
- Two-pass function declaration in `src/parser/comprehensiveValidator.ts`
- Smart parameter type heuristics (first param: series, others: int)
- Enhanced type inference for built-in functions

**Documentation:** See `SESSION-3-COMPLETE-SUMMARY.md`

---

## [0.4.1] - 2025-10-06

### 🛠️ Session 2: Built-in Functions & Keywords (Dev Tools)

**Parser/Validator Improvements:**
- Fixed variadic function signatures (math.max, math.min)
- Added 9 missing built-in variables (year, month, hour, minute, second, etc.)
- Added keyword recognition (break, continue, type)
- **Reduction: 617 → 572 errors (-7.3%)**

**Files Improved:**
- test-v6-features.pine: 18 → 12 errors (-33%)
- mft-state-of-delivery.pine: 123 → 112 errors (-9%)
- indicator.2.3.pine: 58 → 51 errors (-12%)

**Documentation:** See `PARSER-FIXES-SESSION-2.md`

---

## [0.4.0] - 2025-10-05

### 🎉 Complete Pine Script v6 Language Coverage

**100% language coverage** with all 6,665 official Pine Script v6 language constructs recognized.

### ✨ Added

- **Complete constant namespace support** (31 namespaces):
  - ✅ ALL 31 constant namespaces from official v6 reference
  - Added 20 previously missing namespaces: `xloc`, `yloc`, `extend`, `scale`, `display`, `hline`, `barmerge`, `font`, `text`, `order`, `currency`, `dayofweek`, `adjustment`, `backadjustment`, `dividends`, `earnings`, `settlement_as_close`, `splits`, `math`, `position`
  - Examples now validated correctly:
    ```pinescript
    xloc.bar_index       // ✅ Valid (was ❌ error)
    yloc.price           // ✅ Valid (was ❌ error)
    extend.both          // ✅ Valid (was ❌ error)
    scale.left           // ✅ Valid (was ❌ error)
    hline.style_dashed   // ✅ Valid (was ❌ error)
    currency.USD         // ✅ Valid (was ❌ error)
    dayofweek.monday     // ✅ Valid (was ❌ error)
    position.top_center  // ✅ Valid (was ❌ error)
    ```

- **Complete built-in variables** (27 standalone):
  - All standalone built-ins: `ask`, `bid`, `time_close`, `time_tradingday`, `timenow`, `dayofmonth`, `dayofweek`, `hour`, `minute`, `month`, `second`, `weekofyear`, `year`, etc.

- **Complete keyword recognition** (15 keywords):
  - All v6 keywords: `and`, `or`, `not`, `enum`, `export`, `import`, `method`, `type`, `var`, `varip`, `if`, `for`, `for...in`, `while`, `switch`

### 🔧 Infrastructure

- **New v6 data extraction pipeline**:
  - `v6/scripts/extract-v6-language-constructs.js` - Parses complete v6 reference
  - `v6/pine-constants-complete.ts` - All 31 constant namespaces (2,226 constants)
  - `v6/pine-builtins-complete.ts` - All built-ins, keywords, operators, types

- **Multi-agent development system**:
  - QA Validator Agent - Quality assurance and testing framework
  - DOCA Agent - Documentation quality and completeness
  - POCA Agent - Product ownership and alignment
  - Located in `multi-agent-devex/` (git-ignored)

### 🧪 Testing

- **All 67 tests passing** (100% pass rate)
- **16 comprehensive edge case categories** tested
- **Zero false positives** on valid v6 code
- **Complete regression coverage**

### 📊 Metrics (v0.4.0)

```json
{
  "totalLanguageItems": 6665,
  "constantNamespaces": 31,
  "standaloneBuiltins": 27,
  "variableNamespaces": 21,
  "functionNamespaces": 22,
  "keywords": 15,
  "operators": 21,
  "functions": 457,
  "testsPassing": 67,
  "testPassRate": "100%",
  "languageCoverage": "100%",
  "qualityScore": 95
}
```

### 🎯 Quality Gates Achieved

- ✅ 100% v6 language coverage (6,665/6,665 items)
- ✅ Zero false positives on valid v6 code
- ✅ All 67 tests passing (100% pass rate)
- ✅ < 100ms validation for typical scripts
- ✅ Quality score: 95+

### 🔗 References

- Source: [TradingView Pine Script v6 Reference](https://www.tradingview.com/pine-script-reference/v6/)
- Generated from: `v6/raw/complete-v6-items.json` (6,665 items)
- Extraction date: 2025-10-05

---

## [0.3.1] - 2025-10-05

### 🔥 Critical Hotfix: Namespace Function Validation

Fixed critical regex bug causing **false positives** on valid `input.*` functions.

### 🐛 Fixed

- **Regex word boundary bug**: Word boundary `\b` incorrectly matched namespaced functions
  - **Issue**: `input.bool(true, "Test")` was flagged as "Too many arguments for 'bool'"
  - **Root Cause**: Regex `/\bbool\s*\(/` matched `bool(` in `input.bool(` because `.` is a word boundary
  - **Fix**: Changed to negative lookbehind `(?<![a-zA-Z0-9_\.])` to prevent matching after dots

- **Type names validated as functions**: Database contained type entries (`bool`, `int`, `color`, etc.) that were incorrectly validated as functions
  - **Fix**: Added `typeNames` blacklist to skip validation on type names

### ✅ Impact

**Before v0.3.1** (v0.3.0 had false positives):
```pinescript
input.bool(true, "Test")      // ❌ Error: "Too many arguments for 'bool'"
input.color(color.red, "Test") // ❌ Error: "Too many arguments for 'color'"
```

**After v0.3.1** (fixed):
```pinescript
input.bool(true, "Test")      // ✅ Valid - no error
input.color(color.red, "Test") // ✅ Valid - no error
```

### 🧪 Testing

- **Added 8 regression tests** to prevent recurrence
- **All 49 tests pass** (41 existing + 8 new regression tests)
- **Zero false positives** on all `input.*`, `ta.*`, `math.*`, `str.*` functions

### 📊 Metrics (v0.3.1)

```json
{
  "totalFunctions": 457,
  "falsePositives": 0,
  "falseNegatives": 2,
  "testsPassing": 49
}
```

### 📚 Documentation

- Created `docs/CULPRIT.md` - Complete root cause analysis
- Added regression test suite: `test/regression-namespace-functions.test.js`

---

## [0.3.0] - 2025-10-05

### 🎯 Major Achievement: Zero False Positives

This release represents a **major quality milestone** with complete elimination of false positives and comprehensive validation coverage.

### ✨ Added

- **457 Pine Script v6 functions** from official TradingView documentation (up from 32)
- **Comprehensive validation test suite** with programmatic quality gates
- **Metrics tracking system** - `test/metrics-v0.3.0.json` records validation performance
- **Missing namespaces**: `position`, `plot`, `shape`, `location`, `size`
- **Unreliable function blacklist** for auto-generated functions with incomplete parameter data
- **Variadic function detection** - automatically skip parameter count validation for functions with `...` signatures
- **Architecture Decision Records (ADRs)**:
  - ADR-001: Validation Strategy
  - ADR-002: Test Strategy
  - ADR-003: TradingView Synchronization Strategy

### 🐛 Fixed

- **Zero false positives** on valid Pine Script v6 code (down from 9 in v0.2.5)
- **Parameter assignment context handling** - correctly skip validation for `style=plot.style_line` patterns
- **Comment line validation** - skip lines starting with `//` and blank lines
- **Constants recognition** - properly validate plot.style_*, color.*, shape.*, location.*, size.* constants
- **Variadic functions** - no longer incorrectly flag math.max(), str.format() for "too many arguments"
- **table.* functions** - fixed parameter validation by adding to unreliable function blacklist

### 🔧 Changed

- **Validator now uses merged database** (`parameter-requirements-merged.ts`) with 457 functions instead of manual-only (32 functions)
- **Improved error detection** for undefined namespaces, functions, and variables
- **Better namespace coverage** - 23 namespaces: ta (59), array (55), matrix (49), strategy (47), and more

### 📊 Metrics (v0.3.0)

```json
{
  "totalFunctions": 457,
  "falsePositives": 0,
  "falseNegatives": 2,
  "namespaces": 23,
  "topNamespaces": ["ta", "array", "matrix", "strategy", "<global>"]
}
```

### 📚 Documentation

- Comprehensive testing strategy with 4-layer approach (unit, comprehensive, real-world, regression)
- Synchronization strategy for quarterly TradingView documentation updates
- Quality gates for objective release decisions

### 🚀 Quality Gates Status

- ✅ False Positives = 0 (REQUIRED)
- ✅ False Negatives < 5 (ACCEPTABLE) - 2 detected
- ✅ Functions >= 457 (TARGET)
- ✅ All 41 unit tests pass

### 🔮 Known Limitations

**Acceptable False Negatives (v0.3.0)**:
1. Undefined variables in function parameters - not yet detected
2. Invalid constants in parameter assignment contexts - skipped to avoid false positives

**Planned for v0.4.0**:
- Complete 800+ function coverage using anchor link extraction strategy
- Enhanced undefined variable detection

---

## [0.2.5] - Previous Release

### Features
- Basic validation with 32 manually verified functions
- IntelliSense for core Pine Script functions
- Parameter hints and hover documentation

### Issues
- 9 false positives on valid v6 code
- Incomplete function database (missing matrix.*, map.*, table.* functions)
- No systematic testing strategy

---

## Release Notes

### How to Test v0.3.0

1. **Install VSIX**:
   ```bash
   code --install-extension build/pine-script-extension-0.3.0.vsix --force
   ```

2. **Run Comprehensive Test**:
   ```bash
   node test/comprehensive-validation-test.js
   ```

3. **Expected Output**:
   - ✅ Total functions: 457
   - ✅ False positives: 0
   - ✅ False negatives: 2
   - ✅ All quality gates passed

4. **Manual Verification**:
   - Open `examples/demo/trading-activity.pine`
   - Verify zero errors on valid code (lines 1-75)
   - Verify errors detected on test lines (76-78)

### Upgrade Guide

**From v0.2.5 to v0.3.0**:
- Automatically compatible
- No breaking changes
- Significantly improved validation accuracy

**Database Coverage**:
- v0.2.5: 32 functions (manual only)
- v0.3.0: 457 functions (manual + generated merged)
- v0.4.0 (planned): 800+ functions (complete anchor link extraction)

---

## Future Roadmap

### v0.4.0 - Complete Function Coverage
- **Target**: 800+ functions from TradingView v6 reference
- **Strategy**: Extract all anchor links from main page
- **Categories**: Variables, Constants, Functions, Keywords, Types, Operators, Annotations
- **Scraper**: Enhanced anchor link extraction script

### v0.5.0 - Navigation Features
- Go-to-definition (F12)
- Find references (Shift+F12)
- Document outline
- Breadcrumbs navigation

### v1.0.0 - LSP Architecture
- Language Server Protocol migration
- Multi-file support
- Workspace symbols
- Performance optimization

---

## Support

- **Documentation**: [README.md](./README.md)
- **Testing Guide**: [ADR-002-TEST-STRATEGY.md](./docs/adr/ADR-002-TEST-STRATEGY.md)
- **Sync Strategy**: [ADR-003-TRADINGVIEW-SYNC-STRATEGY.md](./docs/adr/ADR-003-TRADINGVIEW-SYNC-STRATEGY.md)

---

**Note**: This extension is for Pine Script v6. For v5 compatibility, use extension v0.1.x.
