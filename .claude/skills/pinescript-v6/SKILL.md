---
name: pinescript-v6
description: Write, validate and debug TradingView Pine Script v6 in this repo — language rules, the project's validation workflow, where the signature data lives, and how to fix a reported false positive. Use when creating or editing any .pine file, when a script fails to compile on TradingView, or when adding a validation rule to the extension.
---

# Pine Script v6

## Validate first, always

A `.pine` file edited by Claude is validated automatically by the PostToolUse hook
(`.claude/hooks/validate-pine.sh`). To check a file by hand:

```bash
npm run build                       # required once after any TypeScript change
node validate-cli.js <file.pine>    # all three diagnostic sources, from dist/engine — the engine the editor runs
node validate-cli.js examples/*.pine
```

Exit code 0 means no severity-0 errors.

## The one rule that matters

**A false positive is worse than a missed error.** Users see squiggles on correct
code and uninstall. Any validation change must be proved in both directions: it
silences the false positive AND still catches the real error. If you cannot write
the "still flags" test, do not ship the rule.

## Language rules that bite

1. Every script opens with `//@version=6`.
2. `ta.*` functions must execute on **every** bar — never inside a ternary or `if`
   branch. Extract to an unconditional variable first.
3. Cache `request.security()` in a variable; never repeat the call inline.
4. Guard division of security-derived values with `nz()`.
5. `plotshape()` takes `style=shape.xxx`, **not** `shape=shape.xxx`.
6. Use `color.new()` for transparency; `transp` is removed.
7. `box.new` / `label.new` / `line.new` each have **two** overloads — a `chart.point`
   form and an independent-coordinate form. Both are valid.
8. Section order: version → declaration → imports → types → constants → inputs →
   functions → variables → calculations → strategy → visuals → alerts.

## Where the data lives

`packages/validator/data/parameter-requirements-merged.ts` = `{...GENERATED, ...MANUAL}` — manual wins.

| File | Role |
|---|---|
| `parameter-requirements-generated.ts` | Auto-scraped 2025-10-03, 457 functions. A point-in-time crawl. |
| `parameter-requirements.ts` | Hand-verified overrides + `MODERN_V6_FUNCTIONS` (API added after the scrape). **Corrections go here.** |
| `pine-constants-complete.ts` | Constants by namespace |
| `pine-builtins-complete.ts` | Namespaces, keywords, standalone built-ins |
| `v6-manual.ts` | Hover/completion descriptions |

Never edit the generated file — a re-crawl erases it.

## Fixing a reported false positive

1. **Reproduce it** with the smallest possible snippet.
2. **Verify against the official reference** that the code really is valid. Check
   the [release notes](https://www.tradingview.com/pine-script-docs/release-notes/)
   too — rules get *removed*: TradingView dropped wrapped-line indentation
   restrictions in December 2025, which turned two existing checks into
   false-positive generators.
3. **Add the reduced script to `test/golden-corpus.test.js`** — before fixing it.
4. **Fix the data or the rule.** If the function is overloaded, add an `overloads`
   array; do not flatten overloads into one parameter list.
5. **Add a paired test** in `test/false-positive-regression.test.js`: one case that
   must be clean, one that must still flag.
6. `npm test` — all tests must pass.

## Architecture constraint

Three diagnostic sources ship: `AccurateValidator` (signatures, arity, namespaces),
`documentChecks` (whole-document heuristics), and the engine's semantic checks
S1-S3, S5-S10 (S4 specified, not built). `AccurateValidator` is regex-over-lines
with no AST, so type inference cannot be added to it. An earlier AST-based path
was deleted on 2026-09-23 after it crashed on valid input; git history keeps it.
Do not add a fourth validator, and do not attempt type-system work without first
rebuilding an AST path. See `STATUS.md`.

## MCP

`mcp/pinescript-mcp-server.js` exposes one tool, `validate_pine_script`, backed by
all three diagnostic sources the editor runs — `AccurateValidator`, `documentChecks`,
and the engine's semantic checks (S1-S10) — so an MCP client and the editor never
disagree about a file.

## References

- [Pine Script v6 reference](https://www.tradingview.com/pine-script-reference/v6/)
- [User manual](https://www.tradingview.com/pine-script-docs/)
- [Release notes](https://www.tradingview.com/pine-script-docs/release-notes/) — check before assuming a symbol is invalid
- `docs/PINESCRIPT-V6-SYNTAX-RULES.md` — project's canonical rule list
