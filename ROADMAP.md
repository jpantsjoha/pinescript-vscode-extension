# Roadmap

Build order for the extension and its engine, `pinescript-v6-validator`. Derived from
`docs/archive/VALIDATOR-ENHANCEMENT-ROADMAP.md` (2025-10-15, retired — its 70%/95%
parity figures were never measured; treat percentages there as unsupported), the
roadmap-reconciliation work that used to live in `STATUS.md`, and the open GitHub
issues as of 2026-09-22. Status words: **not started** · **blocked** · **in
progress** · **shipped**.

## Shipped

| # | Item | Landed |
|---|---|---|
| 1 | Multi-line statement continuation | 0.5.0 |
| 2 | Ternary operator syntax | 0.5.0 |
| 3 | Overloaded constructors (`line.new`, `label.new`, `box.new`) | 0.5.0 |
| 4 | Platform limits — S5 (64 plots), S6 (40 `request.*` calls) | 0.6.0 |
| 5 | Anti-repainting — S1 (`request.security` reading the forming bar) | 0.6.0 |
| 6 | Scope errors — S7 (`plot`/`bgcolor` outside global scope), S8 (nested function defs) | 0.6.0 |
| 7 | Unbounded risk — S9 (`strategy.entry` with no exit) | 0.6.0 |
| 8 | `ta.*` inside a conditional — S2 | 0.6.0 |
| 9 | Accumulator lifetime — S3 (`var` total never reset, or missing `var` reset every bar) | 0.6.2 |
| 10 | Engine extracted to its own npm package (`pinescript-v6-validator`), shared with the agent plugin | 0.6.1 |

## In progress

| # | Item | Issue | Note |
|---|---|---|---|
| 11 | S1 false positive: positional `lookahead` argument not recognised | [#24](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/24) | Fix underway on this branch (uncommitted): `checkRepainting` now also matches `barmerge.lookahead_off/on` passed positionally, not just `lookahead=`. |

## Blocked — needs the AST path repaired first

`AccurateValidator` is regex-over-lines with no AST, so type inference cannot be
bolted onto it. Two honest options, unchanged since the last reconciliation:

1. **Repair the AST path.** Fix `parse()` in `src/parser/parser.ts` so it always
   returns an iterable `body`, get `ComprehensiveValidator` passing the golden
   corpus, then migrate. Unlocks items 12-14 below.
2. **Delete it.** Remove `comprehensiveValidator.ts`, `validator.ts`, and the unused
   parser stack (`parser.ts`, `ast.ts`, `lexer.ts`, `typeSystem.ts`,
   `symbolTable.ts`); accept a permanent ceiling on detection; market the extension
   on signatures, namespaces, arity and the semantic checks it does well.

This is a product decision, not a technical one. It has not been made.

| # | Item | Depends on |
|---|---|---|
| 12 | Type system validation (series/simple/const mismatches) | AST decision above |
| 13 | Control flow syntax validation (if/for/while structure) | AST decision above |
| 14 | Expression parsing beyond ternary | AST decision above |

## Not started — open issues

Grouped by area. Numbers are GitHub issue numbers.

**Engine / semantic checks**
- [#25](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/25) S10 proposal: `request.*` with an external symbol and no `ignore_invalid_symbol` halts on "Permission denied"
- [#26](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/26) Data gap: `request.security` timeframe and expression marked optional, so `request.security("X")` is not flagged
- [#9](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/9) Overloaded methods not considered
- [#10](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/10) Enums not supported
- [#14](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/14) `timestamp()` incorrectly flagged for too many arguments
- [#15](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/15) False positive: user-defined types (UDT)
- [#16](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/16) False positive: function parameters read as undefined namespace/variable
- [#7](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/7) Wrongly thinks a parameter is missing
- [#8](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/8) Parses a comment as code

**Needs the AST path (see Blocked, above)**
- [#11](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/11) No error on invalid scope
- [#12](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/12) No warning/error on invalid cast

**Editor / IntelliSense**
- [#13](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/13) No IntelliSense on named parameters
- [#5](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/5) Variable refactor support wanted

**Data / tooling**
- [#6](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/6) `v6/scripts` fold missing (the crawler is gitignored — re-crawl of the 2025-10-03 reference is also overdue, see `STATUS.md`)

**Out of scope until asked for**
- [#1](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/1) Support for Pine Script v5 — the extension targets v6 only by design; revisit only if user demand is explicit

## Next up (recommended order)

1. Land #24 (in progress) and re-crawl the v6 reference (#6) — both are data-currency
   fixes with clear, provable "still flags" tests.
2. Triage #25/#26 (`request.*` symbol/timeframe gaps) — same shape as #24: a real
   TradingView error the corpus should have caught.
3. Clear the small false-positive backlog (#7, #8, #9, #10, #14, #15, #16) — each is
   independently scoped and testable against the golden corpus.
4. Decide the AST question (Blocked, above) before touching #11 or #12 — building
   either on the current regex validator would be the same mistake the 2025-10-15
   roadmap made.
5. #13 (named-parameter IntelliSense) and #5 (variable refactor) are editor-UX work,
   independent of the validator; schedule opportunistically.

## Related

- [STATUS.md](./STATUS.md) — current session state
- [CHANGELOG.md](./CHANGELOG.md) — what actually shipped, by version
- `docs/archive/VALIDATOR-ENHANCEMENT-ROADMAP.md` — the retired 2025-10-15 plan this supersedes
