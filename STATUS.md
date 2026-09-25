# Project Status

**Updated**: 2026-09-25
**Marketplace**: 0.6.5 · **Open VSX**: 0.6.5 (released 2026-09-25, tag `v0.6.5` on `166a268`)
**Engine on npm**: `pinescript-v6-validator@0.4.1`, which lags the editor (see #54). The extension depends on `^0.4.1` for semantic checks only; its syntactic validator is bundled.

## 2026-09-25: 0.6.5 released — accuracy and IntelliSense milestone closed

0.6.3 → 0.6.5 closed every open false-positive and IntelliSense issue: #9 #10 #11 #13
#14 #16 #24 #25 #26 #36 #37 #42 #45 #47. PR #52 merged as `166a268` (tree identical to
the reviewed `8a5294e`) after three independent review rounds ended in APPROVE FOR
RELEASE with no conditions. The exact-candidate VSIX was built from a clean export,
extracted and executed. Publish run `36168618011` passed every step; both registries
reported 0.6.5 about 6½ minutes later.

**Gap found while reconciling:** the npm engine 0.4.1 fails 27 of 107 regression cases
that 0.6.5 passes (`node -e` over `test/regression-corpus.js` against
`node_modules/pinescript-v6-validator`). `validate-cli.js`, the MCP server and
pinescript-plugin still show those false positives until 0.4.2 is published (#54).

## Where this stands

| Signal | State | Command |
|---|---|---|
| Tests | 578 · 577 pass · 1 skip · 0 fail | `npm test` |
| Audit | 22 pass · 0 warn · 0 fail | `npm run audit` |
| Golden corpus | 4 tracked fixtures + 7 gitignored `examples/*.pine`: 0 errors; tracked fixtures 0 warnings | `node --test test/golden-corpus.test.js` |
| Regression corpus | 107 cases; correct-code cases fail on warnings as well as errors | `test/regression-corpus.js` |
| Semantic checks | S1-S3, S5-S10 (S4 specified, not built; S10 is an info hint) | — |
| Diagnostic sources | AccurateValidator, documentChecks, engine semantic checks in the editor, `validate-cli.js` and the MCP server | `npm run audit` |
| VSIX | 0.6.5 from `8a5294e`: 58 files, 2.66 MB, extracted and executed; no `.env`, hooks or examples | 2026-09-25 |
| Open issues | #54 #55 #49 #12 #5 #1 | `gh issue list` |

## Operator decision board

| # | Group | Decision | Unblocks | Recommendation | Right | Wrong | Reversibility |
|---|---|---|---|---|---|---|---|
| 1 | DO NOW | Publish engine 0.4.2 (npm 2FA, #54) | CLI, MCP and pinescript-plugin users get the 0.6.5 fixes; #55 | Publish today | Every surface agrees about a file again | Agent users keep seeing 27 fixed false positives | cheap |
| 2 | SCHEDULE | Start 0.7.0 with #49 quick fixes | The next user-visible release | Yes, after #54 | One-click fixes for the four commonest diagnostics | A week on refactor work users do not see | cheap |
| 3 | SCHEDULE | Confirm the six inferred fields in the operating profile | Profile moves from `seed` to `active` | 10 minutes | Gates bind to confirmed facts | Gates keep citing inferences | cheap |
| 4 | DEFER | GitHub sensitive-data purge of old history | — | Park; revisit if the repo is audited | — | — | one-way |

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm — the same engine this extension uses, so the two cannot disagree about a file. |

## What waits on whom

- **JP**: #54 npm publish (2FA); decision board rows 2–4.
- **Next session**: #49 quick fixes on `feat/49-quick-fixes`, then #55 once 0.4.2 is on npm.

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.
