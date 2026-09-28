# Project Status

**Updated**: 2026-09-28
**Marketplace / Open VSX**: **0.7.0 live** (tag `v0.7.0` on `6d7f1f9`, released 2026-09-26)
**Engine**: `pinescript-v6-validator@0.4.2` on npm (published 2026-09-28, #54 closed), the same source the extension bundles. Installed from npm it passes all 135 regression-corpus cases, but it ships 47 files where 25 were intended: 22 iCloud conflict copies, among them `dist/src/accurateValidator 2.js`, a stale copy the entry point never loads (#67). A clean 0.4.3 is ready on `fix/67-clean-engine-publish`.

## 2026-09-28: engine 0.4.2 on npm, its packaging defect, and release inspection

`pinescript-v6-validator@0.4.2` was published to npm from the iCloud working tree
(#54 closed). Behaviour is right — 135/135 regression cases pass from the installed
package — but the tarball holds 47 files, 25 intended and byte-identical to a clean
build, plus 22 iCloud conflict copies (`* 2.js`, `*.d 2.ts`); `files: ["dist"]`
packed whatever sat in `dist/` and nothing checked the list (#67).

Branch `fix/67-clean-engine-publish` fixes #67 and #64 and bumps the engine to 0.4.3:
`check-pack` (prepack and `npm-package.test.js`) fails any tarball that is not
exactly the 25 derived files; `scripts/publish-engine.sh` packs only from a
`git archive` export outside iCloud; the package test builds and packs an isolated
copy, so it no longer rewrites the shared engine `dist/` under parallel test files
(#64). Release inspection is now standing process (JP, 2026-09-28):
`scripts/inspect-artefacts.js` before go-live, a written pre-go-live reflection
checked by the independent reviewer, `scripts/verify-published.js` after. Run against
what is live today it passes the 0.7.0 VSIX (GitHub release, Open VSX and Marketplace
byte-identical, 36 files) and fails npm 0.4.2 on its 22 extra files.

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

**Released 2026-09-26.** PR #63 merged as `6d7f1f9` (tree identical to the reviewed
`968ff5e`), tagged `v0.7.0`. The release workflow passed and created the GitHub Release
with the VSIX. The publish workflow's first attempt failed in "Run tests" on a race
between parallel test files (#64); nothing was published by it. The re-run of the failed
job on the same tag passed every step, and both registries reported 0.7.0 about 4½
minutes later.

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
| Open issues | #60 #61 #62 #64 #67 #5 #1 (#64 and #67 fixed on `fix/67-clean-engine-publish`, open until merge) | `gh issue list` |

The test strategy (nine layers, the gate matrix, independent review) is in
[docs/guides/TESTING-GUIDE.md](./docs/guides/TESTING-GUIDE.md).

## Operator decision board

| # | Group | Decision | Unblocks | Recommendation | Right | Wrong | Reversibility |
|---|---|---|---|---|---|---|---|
| 1 | DO NOW | After the #67 PR merges: `node scripts/inspect-artefacts.js --out-dir /tmp/inspect-0.4.3` on main, `scripts/publish-engine.sh --publish --pre /tmp/inspect-0.4.3/inspection.json` (npm 2FA), then `node scripts/verify-published.js --engine 0.4.3 --pre /tmp/inspect-0.4.3/inspection.json`, then `npm deprecate pinescript-v6-validator@0.4.2` | A clean engine on npm; pinescript-plugin can move off 0.4.2 | Publish 0.4.3 from the clean path | npm ships exactly 25 files | Consumers keep a package with 22 stray files, one a stale validator | cheap |
| 1b | DO NOW | Then bump pinescript-plugin to `pinescript-v6-validator@^0.4.3` (separate repo) | Agent users get the 0.7.0 engine | Bump and release the plugin | Agent and editor agree on every file | Agent users keep 27 fixed false positives | cheap |
| 2 | SCHEDULE | Re-authenticate Codex (`codex login`) | Non-Claude review lane back first in line | 2 minutes | Reviewer from a different model family | Reviews stay Claude-on-Claude | cheap |
| 3 | SCHEDULE | Confirm the six inferred fields in the operating profile | Profile moves from `seed` to `active` | 10 minutes | Gates bind to confirmed facts | Gates keep citing inferences | cheap |
| 4 | DEFER | GitHub sensitive-data purge of old history | — | Park; revisit if the repo is audited | — | — | one-way |

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm, which is built from the same `packages/validator` source the extension bundles; the two agree once each release publishes the engine (0.4.2 with 0.7.0, #54; 0.4.3 replaces it with a clean package, #67). |

## What waits on whom

- **JP**: review and merge the #67 PR (fixes #64 too); then decision board row 1 (inspect, then publish 0.4.3 with `scripts/publish-engine.sh --publish --pre …`, then `verify-published`), row 1b (pinescript-plugin to `^0.4.3`, separate repo), rows 2–4.
- **Next session**: #61, #60, #62.

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.
