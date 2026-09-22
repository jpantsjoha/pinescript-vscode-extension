# Project Status

**Updated**: 2026-09-22
**Marketplace version**: 0.6.2 (confirmed live via the Marketplace gallery API)
**Installs**: 1,530 · **Rating**: 4.45★
**Engine**: [`pinescript-v6-validator@0.3.0`](https://www.npmjs.com/package/pinescript-v6-validator) on npm (published 2026-08-08)

---

## Where this stands

| Signal | State |
|---|---|
| `npm test` | 300 tests — 299 pass, 1 skip, 0 fail |
| `npm run audit` | 19 pass · 2 warn · 0 fail |
| Golden corpus | 4 tracked fixtures (`test/fixtures/corpus/`) + 7 gitignored `examples/*.pine`, all 0 errors. CI sees only the 4 tracked ones. |
| Semantic checks shipped | S1, S2, S3, S5, S6, S7, S8, S9. S4 (assignment inside `and`/`or`) is registered in `checkRegistry.ts` but never implemented. |
| Validation speed, 1,300-line script | ~12ms (budget: 100ms) |
| `ComprehensiveValidator` | still broken — throws `ast.body is not iterable`, import removed from `extension.ts` |

`npm run audit`'s two warnings: README does not mention every point release the moment
it ships (mechanical drift, not a defect), and the v6 reference dataset was scraped
2025-10-03 (354 days old) — `MODERN_V6_FUNCTIONS` in `v6/parameter-requirements.ts`
covers the gap by hand, but a re-crawl is due (tracked as issue #6).

## In progress on this branch

S1 false positive on a positional `lookahead` argument (issue #24) — `checkRepainting`
in `packages/validator/src/semanticChecks.ts` now also recognises
`barmerge.lookahead_off`/`_on` passed positionally, not just as `lookahead=`. One real
script shipped 26 false warnings under the named-only check. Uncommitted as of this
entry; see `git diff packages/validator/src/semanticChecks.ts`.

## The central architectural decision (still unresolved)

Three diagnostic sources ship; two older validators are dead. `AccurateValidator` is
regex-over-lines with no AST, so type inference cannot be added to it directly — that
is why the roadmap's type-system, control-flow and expression-parsing items are
blocked rather than merely unstarted. Two options, unchanged since the last review:
repair the AST path (`parser.ts` → `ComprehensiveValidator`) and migrate, or delete
the dead validator stack and market the extension on what it does well. See
`ROADMAP.md` → "Blocked" for the full framing. This is a product decision, not a
technical one, and it has not been made.

**Known architectural debt:** the syntactic validator and the v6 dataset exist in both
`src/parser/`+`v6/` and the engine package (`packages/validator/`).
`test/engine-parity.test.js` fails the build if they drift, but migrating them fully to
the package — as the semantic checks already are — is outstanding.

## Known issues

- `ComprehensiveValidator` crashes on valid input; unusable until the AST path above
  is repaired or the validator is deleted.
- The v6 reference dataset is a point-in-time scrape (2025-10-03); `v6/scripts/` (the
  crawler) is gitignored, so re-crawling requires local tooling not in version control
  (issue #6).
- 16 open GitHub issues, none yet triaged into a milestone beyond `ROADMAP.md`'s
  informal ordering. See `ROADMAP.md` for the full list and grouping.

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm — the same engine this extension uses, so the two cannot disagree about a file. |

## What waits on whom

- **JP**: the AST-path product decision above (repair vs. delete); re-crawl scheduling
  for the v6 reference.
- **Next contributor session**: after #24 merges and engine 0.3.1 is published, work
  the "Not started" list in `ROADMAP.md` in the order it recommends (#25 and #26 first).

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.

## Session 2026-09-22

Branch `feat/audit-s1-lookahead-docs-operating-model`, gates at the last commit: `npm test`
300 / 299 pass / 1 skip / 0 fail · `npm run audit` 20 pass · 1 warn · 0 fail · `tsc --noEmit`
clean · operating-model validator PASS (3 seed warnings by design).

| Delivered | Proof |
|---|---|
| S1 recognises a positional `lookahead` argument (#24); engine 0.3.1 built, not yet published | four paired regression cases; a 26-call real script goes 26 → 0 warnings on `--local-engine` |
| `validate-cli.js` prints which engine ran; `--local-engine` runs the working tree | banner line; hook pipe-tested |
| Docs pruned and reorganised; 16 contradictions fixed; root ROADMAP.md created | link check 0 broken; audit README-version WARN cleared |
| join-the-team operating model 2.1.0 seeded and grounded (`docs/operating-model/`) | validator PASS; 9 inferred fields flagged for JP |
| Filed #25 (S10 `ignore_invalid_symbol` hint), #26 (`request.security` arity gap) | issues carry scope, DoD, proof |

### Operator decision board

| Decision | Cost | Reversible | Recommendation |
|---|---|---|---|
| Publish `pinescript-v6-validator@0.3.1` to npm, bump `package.json` to `^0.3.1`, release 0.6.3 | cheap | one-way (npm) | do it; until then the VSIX and the CLI default ship 0.3.0 with the S1 false positive |
| Confirm the 9 `inferred` fields in `docs/operating-model/PROJECT-OPERATING-PROFILE.md` and set `active` | cheap | yes | needed before R2/R3 work claims the operating model |
| Build S10 (#25) as an info-level hint | costly | yes | next engine change; it is the check this session's runtime error asked for |
| Fix the `request.security` arity data gap (#26) via a manual override | cheap | yes | do with S10 |
| Schedule the v6 reference re-crawl (dataset from 2025-10-03; audit WARN) | costly | yes | after the December-2025 release-notes review |
