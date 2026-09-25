# Claude Code — Pine Script v6 Extension

You are working on an **unofficial TradingView Pine Script v6 language extension for
VS Code**, published to the Marketplace as `jpantsjoha.pinescript-v6-extension`.

<!-- operating-model-contract:start -->
## Shared operating contract

Read `docs/operating-model/OPERATING-MANUAL.md` and
`docs/operating-model/PROJECT-OPERATING-PROFILE.md` before planning or mutating work.

- Manual version: `2.1.0`
- Manual SHA-256: `9b91a46e55fef2291130a0fcc82dc98f017ceb59771706bf0b9da61e37527cf9`
- The project profile supplies local authority, invariants, commands, and current facts.
- Classify risk before confirming authority; ambiguity rounds upward.
- A model, skill, tool, reviewer label, or previous approval supplies no authority.
- Use one branch/worktree and resource namespace per mutating lane.
- Bind R2/R3 evidence and independent review to the exact candidate.
- PASS has zero conditions; delivery, observation, docs, and rollback are part of completion.
- Baseline team skills live under `.agents/skills/`; route by capability, not provider syntax.
<!-- operating-model-contract:end -->

The contract above is the join-the-team operating model (`docs/operating-model/`). The
rest of this file is the project constitution it binds; nothing below weakens it.

## The one rule that matters

**A false positive is worse than a missed error.** Users see squiggles on correct
code and uninstall. Every validation change must be proved in BOTH directions:
it silences the false positive AND still catches the real error. If you cannot
write the "still flags" test, do not ship the rule.

## Definition of Done — per task type

No task is done until its row passes. `npm run audit` mechanises most of this;
run it before claiming completion.

| Task | Done when |
|---|---|
| Fix a false positive | Reduced case added to the golden corpus **before** the fix · paired "must still flag" test · `npm test` green · `npm run audit` green |
| Add a validation rule | Paired tests both directions · rule verified against the official v6 reference **and** release notes · zero new diagnostics on the golden corpus |
| Add v6 API | Added to `MODERN_V6_FUNCTIONS` (never the generated file) with its release date · a test exercising it |
| Change packaging | `vsce package` succeeds · VSIX **extracted and the packaged code executed** · entry point resolves |
| Release | Version consistent in package.json / CHANGELOG / README / git tag · audit green · VSIX smoke-tested |
| Harness change | `npm run audit` green · hook pipe-tested on every branch · agents/skills carry frontmatter |

## Diagnostics come from MORE THAN ONE place

There are **three**: `AccurateValidator` (signatures, arity, namespaces),
`documentChecks` (whole-document heuristics) and the engine's `runSemanticChecks`
(S1-S3, S5-S10 — S4 is specified but not built; S10 is an info-level hint, not a
warning). All three are wired into `validate-cli.js` and `test/golden-corpus.test.js`.

This matters because it already went wrong: the document checks lived inline in
`extension.ts`, untested and invisible to the CLI, and shipped **28 false
`alertcondition` errors** across the same corpus the suite was certifying as clean.
A green test run meant nothing for half the diagnostics a user saw.

**If you add a diagnostic source, wire it into both.** `scripts/audit.js` fails the
build otherwise. Note its limit: it reads the engine exports `extension.ts` imports
from `./engine` (plus `engine.*Checks(` calls), so a NEW check added inside an
existing engine function is not covered by that guard — the golden corpus is what
catches those.

## Before you change validation logic

```bash
npm run build && npm test          # all tests; golden corpus must stay at 0 errors
npm run audit                      # harness, packaging, version, diagnostic coverage
node validate-cli.js <file.pine>   # headless single-file check: the local engine build in dist/engine,
                                   # the same code the VSIX ships (--local-engine is accepted and ignored)
```

`test/golden-corpus.test.js` validates real scripts that compile on TradingView.
Any error against them is a false positive by definition. When a user reports one,
add their reduced script to the corpus *before* fixing it.

## Architecture — read this before adding a validator

Three diagnostic sources ship. A fourth, AST-based path
(`comprehensiveValidator.ts`, `validator.ts`, `parser.ts`, `ast.ts`, `lexer.ts`,
`typeSystem.ts`, `symbolTable.ts`) was deleted on 2026-09-23 — it crashed on valid
input (`ast.body is not iterable`) and its import had already been removed from
`extension.ts`. Git history keeps it if it is ever worth repairing.

**One engine (ADR-0001, issue #55).** Every diagnostic source and the v6 reference
dataset live in `packages/validator` and nowhere else. `npm run build` compiles it
(`tsc -p packages/validator`) and copies that LOCAL build into `dist/engine/`; the
extension (through `src/engine.ts`), IntelliSense, `validate-cli.js` and the MCP
server load `dist/engine/`. The tests exercise the same source and build: some load
`dist/engine/`, some `packages/validator/dist/` (byte-identity between the two is
enforced), and `test/npm-package.test.js` loads the packed-and-installed tarball.
`npm run watch` (`scripts/watch.js`) rebuilds the engine and re-syncs `dist/engine/`
after every error-free compile, via a staged swap; `scripts/watch-smoke.js` proves it
in CI. The VSIX ships that same code — never the
published npm package, which lags the working tree until the next release cut (npm
0.4.1 fails 27 of 107 regression cases the local source passes). The extension has
no runtime dependency on `pinescript-v6-validator`. `test/engine-parity.test.js`
fails the build if a copy reappears in `src/` or `v6/`, if anything imports around
`src/engine.ts`, or if `dist/engine` differs from the package build;
`scripts/verify-vsix.js` (CI, after packaging) lists the real VSIX entries and
executes the packaged `activate()`.

| File | Status |
|---|---|
| `packages/validator/src/accurateValidator.ts` | **Ships.** The live validator. Regex-over-lines, no AST. |
| `packages/validator/src/documentChecks.ts` | **Ships.** Whole-document heuristics, runs alongside AccurateValidator. |
| `packages/validator/src/semanticChecks.ts` | **Ships.** Semantic checks S1-S3, S5-S10 (S4 specified, not built). |
| `packages/validator/data/` | **Ships** (compiled, as `dist/engine/data/`). The reference dataset. |
| `src/engine.ts` | The one loader: types from the package declarations, code from `dist/engine/`. |
| `v6/v6-manual.ts` | Extension-only IntelliSense descriptions. Not engine data. |

Consequence: `AccurateValidator` has no AST, so it cannot do type inference.
Type inference is out of scope until an AST path is rebuilt from scratch — do not
attempt type-system work inside the regex validator, and do not add a fifth
validator.

## Data layer

All paths below are in `packages/validator/data/`.
`parameter-requirements-merged.ts` = `{...GENERATED, ...MANUAL}` — manual wins.

- `parameter-requirements-generated.ts` — crawled **2026-09-23**, 475 functions, every
  overload the reference lists. Regenerate with `npm run crawl` (`scripts/crawl-v6-reference.js`);
  it prints what was added, widened and narrowed. Review every narrowed entry by hand.
- `parameter-requirements.ts` — hand-verified overrides. Put corrections here,
  never in the generated file (a re-crawl would erase them).

**Overloads:** the scrape captured only the first signature of each overloaded
function, which is what produced the `line.new` / `label.new` / `box.new` false
positives. Overloaded functions carry an explicit `overloads` array; a call is
valid if it satisfies ANY overload. Never flatten overloads into one parameter list.

**Currency:** `MODERN_V6_FUNCTIONS` in `parameter-requirements.ts` carries API added
after the scrape. Check the [release notes](https://www.tradingview.com/pine-script-docs/release-notes/)
before assuming a symbol is invalid — the dataset lags TradingView.

## Validating Pine syntax rules

Verify against official docs before encoding a rule. Rules get *removed* too: the
December 2025 release dropped indentation restrictions for wrapped lines, so the
old "continuation must be indented further" check became a false-positive generator.

## Agents

Role definitions live in `.claude/agents/` (`qa-validator`, `documentation`,
`product-owner`, `publisher`). They are prose context documents — read the relevant
one before that kind of work.

## Git

Feature branches only, never commit to `main`. Do **not** add AI/Claude
co-author trailers to commits — see the "No AI attribution" section in
`.claude/COMMIT-GUIDELINES.md`.

## References

**Official Pine Script v6 docs**
- Main docs: https://www.tradingview.com/pine-script-docs/
- Language reference: https://www.tradingview.com/pine-script-reference/v6/
- Writing guide: https://www.tradingview.com/pine-script-docs/writing/
- Style guide: https://www.tradingview.com/pine-script-docs/writing/style-guide/
- Limitations: https://www.tradingview.com/pine-script-docs/writing/limitations/
- Release notes: https://www.tradingview.com/pine-script-docs/release-notes/

**TradingView compile/runtime limits** (verify against Limitations above before
relying on a figure — TradingView changes these)
- Max script size: 80,000 tokens · max variables per scope: 1,000
- Max plots: 64 per script · max `request.*()` calls: 40 (64 for Pro)
- Compilation timeout: 2 minutes
- Script execution: 20s (basic) / 40s (other accounts) · loop execution: 500ms/bar
- Historical buffer: 5,000 bars (10,000 for built-ins) · array/matrix/map: 100,000 elements
