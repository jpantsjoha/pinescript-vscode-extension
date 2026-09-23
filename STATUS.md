# Project Status

**Updated**: 2026-09-23
**Marketplace version**: 0.6.2 · **Installs**: 1,530 · **Rating**: 4.45★ (gallery API, 2026-09-22)
**Engine on npm**: `pinescript-v6-validator@0.3.0` (2026-08-08). 0.4.0 is built, not published.

## Where this stands

| Signal | State |
|---|---|
| `npm test` | 359 tests · 358 pass · 1 skip · 0 fail |
| `npm run audit` | 20 pass · 1 warn (v6 reference re-crawl due) · 0 fail |
| Golden corpus | 4 tracked fixtures + 7 gitignored `examples/*.pine`, 0 errors |
| Semantic checks | S1-S3, S5-S10 (S4 specified, not built; S10 is an info hint) |
| Diagnostic sources | AccurateValidator, documentChecks, engine semantic checks; the editor, `validate-cli.js` and the MCP server all run all three |
| VSIX | packaged, extracted and executed on 2026-09-23: entry resolves, engine loads |

## Open pull requests (stacked, merge in order)

1. **#27** — S1 positional lookahead (#24); docs reorganised; operating model seeded. Reviewed: Kimi PASS.
2. **#28** — S10 external-feed hint (#25); `request.security` arity (#26); `request.footprint` signature. Reviewed: Kimi PASS.
3. **`chore/prune-legacy-repair`** — see below.

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

## Sitrep 2026-09-23 — findings the tables above do not show

| Finding | Evidence |
|---|---|
| `main` has not moved since 2026-08-08; every change since sits in three stacked PRs | `git log -1 origin/main -- STATUS.md` → 2026-08-08; #27 → main, #28 → #27, #29 → #28 |
| Full CI runs only on PRs targeting `main`: #28 and #29 have run PR Validation only | `gh pr checks 28/29`; `ci.yml` `pull_request.branches: [main]`. Each gets the full run when retargeted; local gates (363 tests, audit, VSIX) cover the gap meanwhile |
| `main` has no branch protection | `gh api …/branches/main/protection` → "Branch not protected" |
| `npm audit` in CI is advisory (`\|\| true`) | `ci.yml:175` |
| Two stale PRs: #18 (secret-ignore rules, conflicting; its missing patterns now folded into #29) and #2 (2025-10-06 analysis-only, 1,648 lines of docs about the deleted AST path) | `gh pr view 18/2` |
| Users run 0.6.2 / engine 0.3.0; 1,532 installs | Marketplace gallery API; `npm view pinescript-v6-validator` |

## Operator decision board

| Decision | Cost | Reversible | Recommendation |
|---|---|---|---|
| Merge #27, #28, then #29 (retarget each to `main` as the one below lands, so full CI runs) | cheap | yes | do it in that order |
| Publish `pinescript-v6-validator@0.4.0`, bump the dependency, release 0.6.3 | cheap | one-way (npm, Marketplace) | do it after the merges; users still see the S1, footprint and timestamp false positives until then |
| Confirm the six inferred fields in `docs/operating-model/PROJECT-OPERATING-PROFILE.md` | cheap | yes | needed before the profile can be `active` |
| Re-crawl the v6 reference (#6) | costly | yes | next; two of today's bugs came from the stale scrape |
| Close stale PRs #18 (superseded) and #2 (describes deleted code) | cheap | yes | close both |
| Turn on branch protection for `main` (require CI) | cheap | yes | do it; green checks are advisory without it |

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
