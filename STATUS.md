# Project Status

**Updated**: 2026-09-25
**Marketplace version**: 0.6.4 · **Open VSX**: 0.6.4 (first publish, 2026-09-24) · **0.6.5 in release review**
**Engine on npm**: `pinescript-v6-validator@0.4.1` (`npm view pinescript-v6-validator version`); the extension depends on `^0.4.1`.

## 2026-09-25: 0.6.5 release candidate

A pre-release Codex review of main (#13 and everything since 0.6.4) returned DO NOT
RELEASE on two validator false positives and four IntelliSense defects. Fixed on
`fix/release-0.6.5-audit`: qualified typed declarations (`series Holder xloc = ...`)
now declare their name; a positional `timeframe` satisfies `timeframe_gaps`, and that
warning fires once instead of twice; a grouping `(` no longer opens the outer call's
parameters; `time` and `array` complete under both kinds; completion and signature
help read wrapped calls across lines. Gates tightened: null regression cases now fail
on warnings too, committed fixtures must raise zero warnings, and the parity test now
covers `accurateValidator`. `npm test` 578 tests · 577 pass · 1 skip · 0 fail;
`npm run audit` 21 pass · 1 warn (tag not yet cut) · 0 fail. Diagnostics on all 21
`.pine` files compared with v0.6.4: the only change is in the deliberately invalid
`examples/test-validation.pine` (two constant typos warning → error, per #37).

## 2026-09-25: wrapped statements and constant completions on main

#42 (PR #43) and #45 (PR #46) merged: statements wrapped across lines keep their
declarations and arity checks, and namespace-dot completions offer built-in
constants and variables with hover descriptions. This branch also fixes the
declared-names cache eviction order (#47). Main today: `npm test` 504 tests ·
503 pass · 1 skip · 0 fail; `npm run audit` 22 pass · 0 fail.

## 2026-09-25: IntelliSense coverage and namespace checks on main

#36 (PR #40) and #37 (PR #41) merged on 2026-09-24: completions, signature help and
hover cover all 475 reference functions with every overload; misspelled constant
members (`color.purplee`) and unknown namespaces after `=` are errors. #42 (wrapped
statements keep declarations and arity) is in review as PR #43. Main today: `npm test`
437 tests · 436 pass · 1 skip · 0 fail; `npm run audit` 22 pass · 0 fail.

## Where this stands

| Signal | State |
|---|---|
| `npm test` | 578 tests · 577 pass · 1 skip · 0 fail |
| `npm run audit` | 21 pass · 1 warn (no v0.6.5 tag yet) · 0 fail |
| Golden corpus | 4 tracked fixtures + 7 gitignored `examples/*.pine`, 0 errors |
| Semantic checks | S1-S3, S5-S10 (S4 specified, not built; S10 is an info hint) |
| Diagnostic sources | AccurateValidator, documentChecks, engine semantic checks; the editor, `validate-cli.js` and the MCP server all run all three |
| VSIX | packaged, extracted and executed on 2026-09-23: entry resolves, engine loads |

## Merged 2026-09-23

#27 (`e698807`), #28 (`d34d828`) and #29 (`aa057cf`) merged to `main`, each after the
full CI run (6/6 checks). Issues #9 #10 #11 #14 #16 #24 #25 #26 closed. Stale PRs #18 and
#2 closed. Branch protection on `main`: 5 required checks, no force pushes, admins exempt.

**Released 2026-09-23.** Engine 0.4.0 on npm; extension 0.6.3 via PR #31 (`419b667`) and tag
`v0.6.3`. Publish and Release workflows green; Marketplace reports 0.6.3; GitHub release
carries the VSIX.

## 2026-09-23 — repair and prune

Operator instruction: repair what is useful, prune legacy, dated and irrelevant code and docs.

| Change | Proof |
|---|---|
| `timestamp()` overloads (#9, #14) | regression cases: all three shapes silent, eight arguments flagged |
| Function parameters declared (#16) | regression cases: typed, generic, defaulted params silent; an undefined name in a body still flagged |
| `barcolor` added to S7 (#11) | regression cases: in `if` flagged, ternary at global scope silent |
| `enum`, `footprint`, `volume_row` highlighted (#10) | grammar rule, no hit on `enumerate` |
| MCP server runs S1-S10 as well | stdio boot, `tools/list`, S1 returned on a repro |
| Deleted: AST validator stack (7 files), `dev-tools/` (28 files), 5 dead test scripts and metrics, `mcp/validator-server.js` (required a missing file), `mcp/Dockerfile`, root `settings.json`, 4 orphaned `v6/` data files | nothing imports them; tests, audit, typecheck green |
| `npm run build` cleans `dist/` first | five dead compiled modules had been shipping in the VSIX |
| Closed as already fixed: #7, #8, #15 | each repro validated clean on 2026-09-23 |

## Coherence review — Gemini 3.8 flash high, 2026-09-23 (judgement, not measurement)

| Dimension | Score |
|---|---|
| Vision coherence | 8/10 |
| Requirements delivery | 8/10 |
| Consistency across docs | 6/10 |
| Quality of proof | 7/10 |

Seven contradictions reported. Fixed in `docs/coherence-fixes`: engine 0.3.1 references
(never published; it is 0.4.0), README's "310 tests", README missing S10 and `barcolor`,
VISION overstating the CI corpus (4 synthetic fixtures in CI; 7 private scripts local
only), a dead metrics reference in the profile. Standing design debt, not doc errors:
the syntactic validator is copied between `src/` and the engine, and the build ships the
published engine rather than the local one. Its top recommendations match ROADMAP:
publish 0.4.0, unify the engine, re-crawl the reference, overload-aware signature help
(#13), and CI hardening (PRs to `develop` untested; `npm audit` advisory).

## Operator decision board

| Decision | Cost | Reversible | Recommendation |
|---|---|---|---|
| Confirm the six inferred fields in the operating profile | cheap | yes | 10 minutes; unlocks `active` |
| Re-crawl the v6 reference (#6) | costly | yes | next engineering item |

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm — the same engine this extension uses, so the two cannot disagree about a file. |

## What waits on whom

- **JP**: the merges, the publish and release, the profile confirmation.
- **Next session**: the #6 re-crawl, then remove the duplicated syntactic validator (import it from the engine).

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.
