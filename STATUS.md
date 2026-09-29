# Project Status

**Updated**: 2026-09-29
**Marketplace / Open VSX**: **0.7.1 live** (tag `v0.7.1` on `4ad69fb`, released 2026-09-29)
**Engine**: `pinescript-v6-validator@0.4.3` on npm (published 2026-09-29): 25 files, no iCloud copies; installed from npm it passes all 143 regression cases. Published by JP from a clean export of tag `engine-v0.4.3` (not the iCloud tree), after the CI run passed every gate but could not publish (EOTP). No provenance attestation on 0.4.3.

## 2026-09-29: extension 0.7.1 released

PR #76 merged as `4ad69fb` (tree identical to the gated `4d35ad1`), tagged `v0.7.1`.
Ships #61 and #60, plus the #62 release tooling; bundles the same engine source as npm
0.4.3. Gate on a clean export under Node 22: `npm test` 833/833, audit 36/0/0,
`diff-diagnostics --against v0.7.0` 21 files, 32 diagnostics, 0 new, 0 gone, VSIX
36 files with `verify-vsix` PASS. `publish.yml` (run 36543226880) and `release.yml`
(run 36543226597) passed; both registries reported 0.7.1, and the GitHub release VSIX
re-verified: 36 files, 0 conflict copies, `verify-vsix` PASS.

## 2026-09-29: engine 0.4.3 published

Publish run `36447823922` for tag `engine-v0.4.3` passed every gate (tests, exact 25-file
pack, corpus against the tarball) and npm refused the upload (EOTP: the `NPM_TOKEN` token
does not bypass 2FA). **Operator decision (JP, 2026-09-29):** publish 0.4.3 locally with
interactive npm approval rather than wait for a CI credential. It was built from a clean
`git archive` of the tag outside iCloud; the prepack guard passed at 25 files and the
corpus passed 143/143 against the tarball before JP approved `npm publish`. Verified
from the registry: 0.4.3, 25 files, 0 conflict copies, 143/143 regression cases.

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

## 2026-09-28: engine 0.4.2 published; clean republish deferred (#67, PR #68, C1)

0.4.2 went to npm from the working tree and carries 22 iCloud conflict copies; nothing
checked the packed file list. PR #68 (clean-export publish script, exact 25-file guard,
artefact inspection and pre-go-live reflection, #64 test-race fix) went through four
Codex sol-xhigh rounds, and each included a blocker of the same shape: an npm invocation
trusting ambient configuration. Under the two-strike rule it is **deferred as a design question** (C1):
branch `fix/67-clean-engine-publish` kept on the remote, PR #68 in draft. The next attempt
decides whether the engine publishes from a tag-triggered CI workflow (clean runner,
provenance), which removes the class instead of guarding each call site. Lesson recorded:
nothing that ships is packed from the iCloud tree, and every artefact's file list is
audited before go-live.

## 2026-09-28: engine 0.4.3 CI publish path (#67, #64; merged as PR #70)

PR #70 (merged `a11f908`) replaces the deferred local-publish design with a
tag-only GitHub Actions workflow. It builds on Node 22, enforces the derived 25-file
package list, installs the exact tarball and runs all 135 regression cases, publishes
that tarball with npm provenance, and verifies the public package after publication.
The npm-package test now builds an isolated validator copy and no longer races other
parallel test files through shared `packages/validator/dist`.

**Operator action (superseded 2026-09-29):** the CI publish needed a bypass-2FA `NPM_TOKEN` or npm
Trusted Publishing; instead JP published 0.4.3 locally from a clean tag export (see the
2026-09-29 entry). The next engine release still needs one of those CI credentials.

## 2026-09-28: backlog cleared — #67 #64 #61 #60 #62 merged

| PR | Issue | Merge |
|---|---|---|
| #70 | #67 engine publishes from CI on `engine-v*` tags with provenance and an exact 25-file guard; #64 isolated package test | `a11f908` |
| #71 | #61 a comment or blank line inside a wrapped call no longer hides a later misspelling | `ca3b978` |
| #72 | #60 S1 no longer advises a `lookahead` that `request.security_lower_tf` lacks | `52c6eed` |
| #73 | #62 workflow audit parses steps (verify before Marketplace, Open VSX and GitHub release), conflict-copy rejection, pinned `ovsx`, distinct `diff-diagnostics` exit codes | `e787950` |

Built in worktrees outside iCloud; each exact head independently reviewed, with a
delta review after every change; CI 6/6 before each merge.
Main `e787950`, clean export under Node 22: `npm test` 833/833, audit 36/0/0,
engine `npm pack --dry-run` exactly 25 files. PR #68 closed as superseded by #70.

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
| Released in 0.7.1 | #61 (PR #71, `ca3b978`): a comment or blank line inside a wrapped call no longer hides a later misspelled constant; #60 (PR #72, `52c6eed`): S1 is silent on `request.security_lower_tf()`; #62 (PR #73, `e787950`): release-workflow audit parses steps, pinned `ovsx`, conflict-copy rejection | Regression-corpus cases both ways; `npm test` green on main |
| Open issues | #5 #1 (feature requests, not scheduled) | `gh issue list` |

The test strategy (nine layers, the gate matrix, independent review) is in
[docs/guides/TESTING-GUIDE.md](./docs/guides/TESTING-GUIDE.md).

## Operator decision board

| # | Group | Decision | Unblocks | Recommendation | Right | Wrong | Reversibility |
|---|---|---|---|---|---|---|---|
| 1 | SCHEDULE | Make CI able to publish the next engine: npm Trusted Publishing for `publish-engine.yml`, or a bypass-2FA token in `NPM_TOKEN` | Unattended engine releases with provenance | Trusted Publishing | Next engine ships from CI with provenance | Another manual, 2FA-approved local publish | cheap |
| 2 | SCHEDULE | Upgrade the Codex CLI (0.146.0 installed, 0.158.0 current): `npm i -g @openai/codex@latest` | Codex's default model; sol-xhigh (`gpt-5.6-sol`) already works and reviewed four rounds on 2026-09-28 | Upgrade | Every Codex model available as a lane | Default-model calls keep failing with "requires a newer version" | cheap |
| 3 | SCHEDULE | Confirm the six inferred fields in the operating profile | Profile moves from `seed` to `active` | 10 minutes | Gates bind to confirmed facts | Gates keep citing inferences | cheap |
| 4 | DEFER | GitHub sensitive-data purge of old history | — | Park; revisit if the repo is audited | — | — | one-way |

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Consumes `pinescript-v6-validator` from npm, built from the same `packages/validator` source the extension bundles. Engine 0.4.3 is published (2026-09-29); the plugin agrees with the editor once it pins `^0.4.3`. |

## What waits on whom

- **JP**: bump pinescript-plugin to `^0.4.3`; decision-board row 1 (a CI npm credential) before the next engine release.
- **Next session**: #5 (rename) needs a scoping session; nothing else is open.

## Repository hygiene

`examples/` is gitignored; nothing new added there reaches the public repository. The
committed corpus (`test/fixtures/corpus/`) is synthetic and verified to fail when the
bugs it targets are reintroduced, so the CI gate is real without exposing trading logic.
Never move a file from `examples/` into the committed corpus list —
`test/golden-corpus.test.js` asserts against exactly that.
