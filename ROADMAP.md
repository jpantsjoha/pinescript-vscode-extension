# Roadmap

Build order for the extension and its engine, `pinescript-v6-validator`. Derived from
the retired 2025-10-15 validator roadmap (deleted 2026-09-23; git history keeps it — its 70%/95%
parity figures were never measured; treat percentages there as unsupported), the
roadmap-reconciliation work that used to live in `STATUS.md`, and the open GitHub
issues as of 2026-09-26 (reconciled after the 0.7.0 release). Status words: **not started** · **blocked** · **in
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

## Shipped in 0.7.0 (2026-09-26)

| Item | Issue | PR |
|---|---|---|
| Quick fixes: misspelled constant, `shape=` → `style=`, `ignore_invalid_symbol=true`, `// pine-ignore: S<n>`, `//@version=6`; each re-validated before it is offered | [#49](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/49) | PR #58 |
| Invalid cast from a direct `input.*()` call (`int x = input.float(...)`) is an error | [#12](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/12) | PR #57 |
| One engine: the syntactic validator and v6 data are imported from `packages/validator`, not copied; VSIX verified file by file; tooling on Node 22 | [#55](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/55) | PR #59 |

## Decided — the AST path

Deleted on 2026-09-23 (operator instruction: repair what is useful, prune the rest).
The AST validator crashed on valid input and was never wired into the editor. The
consequence is a ceiling: no type inference. Series/simple/const mismatches, general
invalid casts and control-flow structure stay out of scope until an AST path is rebuilt
from scratch. The one exception is the narrow #12 rule: a declaration typed `int`,
`float`, `bool`, `color` or `string` whose whole right-hand side is a single direct
`input.*()` call is checked against that function's documented return type, with no
inference. Git history keeps the old code.

## Milestones

| Milestone | Theme | State |
|---|---|---|
| 0.6.3 – 0.6.5 | Accuracy and IntelliSense: false positives fixed, the full v6 reference in the editor, parameter-name completions | **shipped** 2026-09-25 |
| 0.7.0 | Fix it for me, and one engine: quick fixes (#49), the invalid-cast rule (#12), one engine (#55) | **shipped** 2026-09-26 |
| engine 0.4.2 | The npm engine catches up with 0.7.0, for external consumers (the pinescript-plugin agent plugin) | **waits on** operator npm 2FA (#54) |
| 0.7.x | Precision: missed errors and misleading advice found during 0.7.0 (#61, #60), packaging-guard follow-ups (#62) | not started |
| later | Rename refactoring (#5) | not started |

## Open issues

**Engine and delivery**
- [#64](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/64) Flaky `npm test`: the npm-package test rebuilds `packages/validator/dist` while parallel test files load it; it failed the first v0.7.0 publish attempt.
- [#54](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/54) Publish engine 0.4.2. The npm 0.4.1 engine fails 27 of 107 regression cases the editor passes, so the external agent plugin (pinescript-plugin) still shows fixed false positives. The extension, `validate-cli.js` and the MCP server run the local engine build and do not wait on it.
- [#62](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/62) Packaging-guard follow-ups from the #59 review (all low severity).

**Validator**
- [#61](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/61) Missed error: a comment line inside a wrapped call makes a later `name=` argument shadow its namespace, hiding misspellings further down.
- [#60](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/60) S1 on `request.security_lower_tf` suggests a `lookahead` argument that function does not have.

**Editor / IntelliSense**
- [#5](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/5) Variable refactor support wanted.

**Known limits, not scheduled**
- Completion and signature help look back 30 lines for an open call; a call opened further up falls back to ordinary completions (a miss, never a wrong suggestion).
- The #12 rule deliberately skips `const` declarations, `=>` statements, qualifier-only mismatches and UDT field defaults (misses, never false positives).

**Out of scope until asked for**
- [#1](https://github.com/jpantsjoha/pinescript-vscode-extension/issues/1) Pine Script v5. The extension targets v6 by design.

## Next up (recommended order)

1. #54 publish engine 0.4.2, so pinescript-plugin gets the same fixes. Needs JP's npm 2FA, about 10 minutes.
2. #64 — a release can fail at random until the test race is fixed.
3. #61 — a missed error on ordinary code (wrapped calls with comments are common).
4. #60 — advice that cannot be followed.
5. #62 — guard hardening.
6. #5 — rename, the largest remaining editor feature.

## Related

- [STATUS.md](./STATUS.md) — current state
- [CHANGELOG.md](./CHANGELOG.md) — what shipped, by version
