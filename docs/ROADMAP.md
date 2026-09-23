# Pine Script v6 IDE Tools Roadmap

**Canonical record:** `ROADMAP.md` at the repository root (JP's convention: the root-level
file is canonical; this file stays a short pointer plus the one live row the
operating-model bootstrap requires).

Root `ROADMAP.md` was created on 2026-09-22 on branch
`feat/audit-s1-lookahead-docs-operating-model`; it carries the build order with issue
numbers and built / gated / shipped state. This file does not duplicate it.

The roadmap orders outcomes and records their gates. The configured work system —
GitHub issues, `https://github.com/jpantsjoha/pinescript-vscode-extension/issues` — owns
active milestones, epics, tasks, assignment, and queue state. No GitHub milestones are
configured (verified: `gh api repos/jpantsjoha/pinescript-vscode-extension/milestones` →
`[]`).

## Now

| Outcome ID | Outcome | Product Owner gate | Milestone / epic | Dependencies | Status |
| --- | --- | --- | --- | --- | --- |
| #24 | Fix S1 false positive: positional `lookahead` argument (5th positional arg to `request.security`) not recognised as the repainting exemption | Accepted — evidence: issue #24 Definition of Done checklist | none (no GitHub milestone configured) | none — issue #24 states "Not blocked" | In progress on this branch (`feat/audit-s1-lookahead-docs-operating-model`): `packages/validator/src/semanticChecks.ts` and `test/regression-corpus.js` changed; engine `pinescript-v6-validator` version bumped 0.3.0 → 0.3.1 in `packages/validator/package.json`, not yet published (verified: `npm view pinescript-v6-validator version` → 0.3.0, 2026-09-22) |

## Next

| Outcome ID | Outcome | Entry condition | Dependencies |
| --- | --- | --- | --- |
| see root `ROADMAP.md` | order and entry conditions live there; candidates #25, #26 are listed with their state | as stated there | as stated there |

## Later

| Outcome ID | Outcome | Revisit trigger |
| --- | --- | --- |
| see root `ROADMAP.md` | older reports #1, #5–#16 are listed there with their state | as stated there |

## Rules

- Product Owner owns outcome order, scope, and acceptance.
- `delivery-orchestrator` proposes task decomposition and reconciles dependencies.
- Material scope or acceptance changes return the outcome to Product Owner review.
- Do not duplicate mutable task state here; link to the configured work system.
- Completed means delivery evidence, status, roadmap, changelog, and open risk agree.
