# Roadmap

Build order for the extension and its engine, `pinescript-v6-validator`. Derived from
the retired 2025-10-15 validator roadmap (deleted 2026-09-23; git history keeps it — its 70%/95%
parity figures were never measured; treat percentages there as unsupported), the
roadmap-reconciliation work that used to live in `STATUS.md`, and the open GitHub
issues as of 2026-09-25 (reconciled after the 0.6.5 release). Status words: **not started** · **blocked** · **in
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

## Shipped in 0.6.5 (2026-09-25)

| Item | Issue | Branch / PR |
|---|---|---|
| Completions, signature help and hover cover all 475 reference functions, with every overload in signature help | [#36](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/36) | PR #40 |
| Misspelled constant-namespace members and unknown namespaces after `=` are errors; the member list is complete (371 names) and swept by a test | [#37](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/37) | PR #41 |
| Statements wrapped across lines keep their declarations, arity checks and argument-level error locations | [#42](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/42) | PR #43 |
| Built-in constants and variables complete after a namespace dot, with hover descriptions and line-aware shadowing | [#45](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/45) | PR #46 |
| Named-parameter completions and value suggestions, including wrapped calls | [#13](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/13) | PR #51 |

## Decided — the AST path

Deleted on 2026-09-23 (operator instruction: repair what is useful, prune the rest).
The AST validator crashed on valid input and was never wired into the editor. The
consequence is a ceiling: no type inference. Series/simple/const mismatches, invalid
casts (#12) and control-flow structure stay out of scope until an AST path is rebuilt
from scratch. Git history keeps the old code.

## Milestones

| Milestone | Theme | State |
|---|---|---|
| 0.6.3 – 0.6.5 | Accuracy and IntelliSense: false positives fixed, the full v6 reference in the editor, parameter-name completions | **shipped** 2026-09-25 |
| engine 0.4.2 | External npm consumers (the pinescript-plugin agent plugin) get the 0.6.5 fixes; the extension, CLI and MCP server already run the local engine (#55) | **blocked** on operator npm 2FA (#54) |
| 0.7.0 | Fix it for me, and one engine: quick fixes (#49), the syntactic validator imported rather than copied (#55) | in progress: #55 built on `feat/55-single-engine` |
| later | Types without an AST: narrow cast rule (#12); rename (#5) | not started |

## Not started — open issues

**Engine and delivery**
- [#54](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/54) Publish engine 0.4.2. The npm 0.4.1 engine fails 27 of 107 regression cases the 0.6.5 editor passes, so the external agent plugin (pinescript-plugin) still shows fixed false positives. The extension, `validate-cli.js` and the MCP server load the local engine build (#55) and do not wait on it.
- [#55](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/55) One engine: import `AccurateValidator`, `documentChecks` and the v6 data from the package instead of copying them into `src/parser/` and `v6/`. **Built** on `feat/55-single-engine` (PR pending review): the copies are deleted, everything loads `dist/engine` (the local package build), and the extension no longer depends on the npm engine at runtime.

**Validator**
- [#12](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/12) No error on an invalid cast (`int x = input.float(...)`). Needs types; a narrow declared-type vs `input.*` return-type rule is possible without an AST.

**Editor / IntelliSense**
- [#49](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/49) Quick fixes: one-click corrections for common diagnostics
- [#5](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/5) Variable refactor support wanted

**Known limits, not scheduled**
- Completion and signature help look back 30 lines for an open call; a call opened further up falls back to ordinary completions (a miss, never a wrong suggestion).

**Out of scope until asked for**
- [#1](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/1) Pine Script v5. The extension targets v6 by design.

## Next up (recommended order)

1. #54 publish engine 0.4.2 — reaches external npm consumers (pinescript-plugin); the CLI and MCP server run the local engine and do not wait on it. Needs JP's npm 2FA, about 10 minutes.
2. #49 quick fixes — the most visible user value left: one click for a misspelled constant, a wrong parameter name, a missing `ignore_invalid_symbol`, a repainting `request.security`.
3. #55 one engine — built on `feat/55-single-engine`; merge after review. Removes the double-fix cost and the lag that #54 had to repair.
4. #12 narrow cast rule.

## Related

- [STATUS.md](./STATUS.md) — current state
- [CHANGELOG.md](./CHANGELOG.md) — what shipped, by version
