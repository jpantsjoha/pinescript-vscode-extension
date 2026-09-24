# Roadmap

Build order for the extension and its engine, `pinescript-v6-validator`. Derived from
the retired 2025-10-15 validator roadmap (deleted 2026-09-23; git history keeps it — its 70%/95%
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

## Shipped in 0.6.3 (2026-09-23, engine 0.4.0)

| Item | Issue | Branch / PR |
|---|---|---|
| S1 recognises a positional `lookahead` argument | [#24](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/24) | PR #27 |
| S10 info hint: hard-coded external feed with no `ignore_invalid_symbol` | [#25](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/25) | PR #28 |
| `request.security` / `security_lower_tf` require symbol, timeframe, expression | [#26](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/26) | PR #28 |
| `request.footprint()` signature corrected | — | PR #28 |
| `timestamp()` overloads | [#9](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/9), [#14](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/14) | `chore/prune-legacy-repair` |
| Function parameters no longer "undefined" | [#16](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/16) | `chore/prune-legacy-repair` |
| `barcolor` in local scope flagged by S7 | [#11](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/11) | `chore/prune-legacy-repair` |
| `enum` highlighted by the grammar | [#10](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/10) | `chore/prune-legacy-repair` |
| MCP server runs the semantic checks too | — | `chore/prune-legacy-repair` |

Verified already fixed and closed 2026-09-23: #7 (nested call arity), #8 (comment
parsed as code), #15 (UDT `.new()`).

## Decided — the AST path

Deleted on 2026-09-23 (operator instruction: repair what is useful, prune the rest).
The AST validator crashed on valid input and was never wired into the editor. The
consequence is a ceiling: no type inference. Series/simple/const mismatches, invalid
casts (#12) and control-flow structure stay out of scope until an AST path is rebuilt
from scratch. Git history keeps the old code.

## Not started — open issues

**Validator**
- [#12](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/12) No error on an invalid cast (`int x = input.float(...)`). Needs types; a narrow declared-type vs `input.*` return-type rule is possible without an AST.
- Wrapped one-argument calls skip arity (pinned by a test in `test/request-arity.test.js`).
- A function signature wrapped across lines (`f(int a,` / `int b) =>`) does not declare its parameters, so #16 can recur there (missed fix, found by review 2026-09-23).
- Remove the duplicated syntactic validator: `src/parser/{accurateValidator,documentChecks}.ts` and `v6/` copy the engine package; import them from it instead.

**Editor / IntelliSense**
- [#13](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/13) No IntelliSense on named parameters
- [#5](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/5) Variable refactor support wanted

**Data / tooling**

**Out of scope until asked for**
- [#1](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/1) Pine Script v5. The extension targets v6 by design.

## Next up (recommended order)

1. Remove the duplicated syntactic validator (import it from the engine).
2. #13 named-parameter IntelliSense, then the narrow #12 cast rule.

## Related

- [STATUS.md](./STATUS.md) — current state
- [CHANGELOG.md](./CHANGELOG.md) — what shipped, by version
