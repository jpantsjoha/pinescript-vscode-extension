# Project Status

**Updated**: 2026-09-26
**Marketplace / Open VSX**: 0.6.5 live; **0.7.0 in release** (branch `release/0.7.0`)
**Engine**: the extension, `validate-cli.js` and the MCP server run the local build of `packages/validator` (0.4.2 in this release). npm has 0.4.1 until 0.4.2 is published (#54), which only external consumers such as pinescript-plugin need.

## 2026-09-26: 0.7.0 — quick fixes, the invalid-cast rule, one engine

Three PRs, built in parallel worktrees and each reviewed independently on its exact
head before merging:

| PR | Issue | Merged | Review rounds |
|---|---|---|---|
| #59 one engine, verified packaging, Node 22 tooling | #55 | `4e9cc5a` | sol-xhigh ×4 REQUEST CHANGES, Opus CONCERNS, Opus PASS |
| #57 invalid cast from `input.*()` | #12 | `11988cc` | sol-xhigh REQUEST CHANGES ×2, APPROVE; Opus PASS on the rebase |
| #58 quick fixes | #49 | `26c8f6c` | sol-xhigh REQUEST CHANGES ×3, APPROVE; Opus CONCERNS (docs conflict), PASS |

Codex sol-xhigh reviewed until its login returned 401 on 2026-09-25; from then on an
Opus 5.5 subagent running the `pr-review` skill reviewed, as its named fallback (JP,
2026-09-26). Every round caught a real defect the green suite had missed, including an
unsafe S1 quick-fix rewrite, a cast-rule false positive on wrapped expressions, and
iCloud conflict copies that the old VSIX check would have shipped.

**Operator decisions recorded:** tooling and CI on Node 22/24, Node 18 and 20 being
end-of-life (JP, 2026-09-25); branch protection now requires `Test & Lint (22.x)` and
`(24.x)` (switched 2026-09-26 at the merge of #59, on JP's instruction).

## Where this stands

Measured on a clean export of `f6067d6` under Node 22.23.3, 2026-09-26.

| Signal | State | Command |
|---|---|---|
| Tests | 796 · 796 pass · 0 skip · 0 fail (26 files) | `npm test` |
| Audit | 29 pass · 0 warn · 0 fail (in the repo, 1 warn until the v0.7.0 tag exists) | `npm run audit` |
| Self-test, watch smoke, typecheck | pass | `node test/v0.4.0-self-test.js`, `npm run test:watch`, `npx tsc --noEmit` |
| Regression corpus | 131 cases + 4 suppression cases; correct-code cases fail on warnings too | `test/regression-corpus.js` |
| Golden corpus | 4 committed fixtures, 0 errors, 0 warnings | `node --test test/golden-corpus.test.js` |
| Diagnostics vs 0.6.5 | 21 `.pine` files, 32 diagnostics, 0 new, 0 gone | `node scripts/diff-diagnostics.js --against v0.6.5` |
| VSIX | 0.7.0: 36 files, 1.43 MB; `verify-vsix` PASS (activate, allowlist, one engine) | `npm run package`, `npm run verify:vsix` |
| Semantic checks | S1-S3, S5-S10 (S4 specified, not built; S10 is an info hint) | — |
| Open issues | #54 #60 #61 #62 #5 #1 | `gh issue list` |

The test strategy (nine layers, the gate matrix, independent review) is in
[docs/guides/TESTING-GUIDE.md](./docs/guides/TESTING-GUIDE.md).

## Operator decision board

| # | Group | Decision | Unblocks | Recommendation | Right | Wrong | Reversibility |
|---|---|---|---|---|---|---|---|
| 1 | DO NOW | Publish engine 0.4.2 (npm 2FA, #54) after the 0.7.0 tag | pinescript-plugin gets every fix since 0.4.1 | Publish at the cut | Agent and editor agree on every file | Agent users keep 27 fixed false positives | cheap |
| 2 | SCHEDULE | Re-authenticate Codex (`codex login`) | Non-Claude review lane back first in line | 2 minutes | Reviewer from a different model family | Reviews stay Claude-on-Claude | cheap |
| 3 | SCHEDULE | Confirm the six inferred fields in the operating profile | Profile moves from `seed` to `active` | 10 minutes | Gates bind to confirmed facts | Gates keep citing inferences | cheap |
| 4 | DEFER | GitHub sensitive-data purge of old history | — | Park; revisit if the repo is audited | — | — | one-way |

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm, which is built from the same `packages/validator` source the extension bundles; the two agree once each release publishes the engine (0.4.2 with 0.7.0, #54). |

## What waits on whom

- **JP**: engine 0.4.2 npm publish (2FA); decision board rows 2–4.
- **Next session**: #61 (missed error with comments inside wrapped calls), #60, #62.

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.
