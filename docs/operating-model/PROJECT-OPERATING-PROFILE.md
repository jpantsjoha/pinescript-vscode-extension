# Pine Script v6 IDE Tools Operating Profile

**Profile schema:** 1.0.0
**Manual path:** `docs/operating-model/OPERATING-MANUAL.md`
**Manual version:** 2.1.0
**Manual SHA-256:** 9b91a46e55fef2291130a0fcc82dc98f017ceb59771706bf0b9da61e37527cf9
**Adoption status:** seed
**Adopted on:** 2026-09-22
**Profile owner:** JP (Jaroslav Pantsjoha, GitHub `jpantsjoha`) — verified: CLAUDE.md footer "Maintainer: Pine Script Extension Team: JP"; solo project, JP is also operator, integration owner, and publisher.
**Last verified:** 2026-09-22
**Review trigger:** inferred — source: mirrors OPERATING-MANUAL.md's own review trigger ("a material failure, a changed authority model, or 90 days without verification"); confirm: JP.

This tracked profile supplies project-specific authority, invariants, commands, and
delivery controls for the model-, vendor-, and IDE-neutral operating manual.

Never invent a project fact to complete this profile. Replace each angle-bracket
placeholder with a verified fact or one of these explicit states:

- `not applicable — <reason>`
- `not yet established — owner: <role>; required before: <trigger>`
- `inferred — source: <evidence>; confirm: <role>`

A value marked `verified` (a plain resolved fact) is human-owned. A value marked
`inferred` was machine-backfilled from repository evidence and is **not yet owned** — a
named human must confirm it (replace it with a verified fact) before the profile can
become `active`. Keep provenance scannable: ✅ verified · 🤖 inferred · ⬜ unknown.

`inferred — source:` is a **reserved marker phrase** — the validator treats any field
containing it as unconfirmed inference that blocks `active`. Do not use the literal phrase
in ordinary prose; rephrase (e.g. "derived from") if you mean it descriptively.

`seed` is a valid day-one state for discovery, system design, backlog formation, and R0/R1
work. Before R2/R3 work begins, set the profile to `active` and resolve every applicable
authority, invariant, validation, review, delivery, rollback, and observation control —
including confirming every `inferred` field. Unconfirmed inference blocks `active`.

## Day-one seed minimum

Resolve these fields before the team treats this as a shared seed:

- project name, profile owner, adopted manual digest, and policy precedence;
- accountable operator, integration owner, and escalation path;
- R0–R3 examples, protected paths, non-negotiable invariants, and forbidden effects;
- branch/worktree ownership and resource-isolation rule;
- at least one runnable convergence command, or a named owner and trigger for creating it;
- core skill locations/routing, documentation source of truth, and next review trigger.

The initializer can supply structure, version, digest, and adapters. The team and its code
assistant must ground the remaining values in the target repository before marking them
resolved.

## Policy precedence

1. Platform and safety policy.
2. Explicit instruction from JP (operator) for the current task — verified: solo project,
   JP holds every named role (product owner, operator, integration owner, publisher).
3. The project root `CLAUDE.md` (canonical constitution) and this profile — verified: JP's
   task brief names root `CLAUDE.md` as the constitution; its "one rule that matters" is
   "a false positive is worse than a missed error."
4. The adopted universal operating manual (`docs/operating-model/OPERATING-MANUAL.md`,
   v2.1.0).
5. Local conventions, memories, examples, and inference.

Conflicts in authority, invariants, or current facts block the affected action until
reconciled. Infer intent; never infer permission.

## Authority and approval roles

| Role | Accountable for | May approve |
|---|---|---|
| JP (product owner) | Outcome, scope, external effects, protected changes | R3, production, credentials, constitution, spend, destructive/external actions |
| JP (integration owner) | Exact assembled candidate and merge order | Assembly only; cannot self-approve R3 |
| Mutating lane (Claude/agent subagent or council execution lane — k3, codex) | Owned files/resources and lane evidence | Its isolated implementation only |
| Independent council lane never the author (agy, k3, or codex, per lane order in JP's global operating agreement) | Refutation of domain correctness | Final PASS on exact candidate; no scope authority |
| Independent reviewer (second agent or council lane, docs/governance) | Policy, docs, status, and evidence coherence | Final PASS on exact candidate; no scope authority |

Verified: "Solo project: JP is product owner, operator, integration owner and publisher"
and "the writer never approves its own work: a lane wrote it → Claude gates; Claude wrote
it → a lane reviews" (JP's task brief, 2026-09-22, and `/Users/jp/.claude/CLAUDE.md`
"Cross-model council and engineering lanes").

A skill, model, agent name, CI label, or previous PASS never grants permission.

### External-effect boundary

- Allowed without additional approval: read-only inspection; `npm test`, `npm run audit`,
  `npm run typecheck`, `node validate-cli.js`; edits to docs, tests, and examples (R0/R1
  per the risk tiers below).
- Always requires explicit approval: VS Code Marketplace publish (`vsce publish`), npm
  publish of the `pinescript-v6-validator` engine, git tag/release, changes to
  `.github/workflows/`, `.claude/hooks/`, credentials (`VSCE_PAT`, `.npmrc`), and deleting
  golden-corpus files — R3 per the risk-tier table below.
- Escalation path: GitHub issues on the repo — verified (JP's task brief, 2026-09-22).

## Team roster and escalation

Solo project: JP holds every accountable role (verified, CLAUDE.md footer and task brief).

| Person | Role | Accountable for (scope) | Escalation channel |
|---|---|---|---|
| JP (Jaroslav Pantsjoha) | Product owner | Requirements, backlog priority, acceptance sign-off (e.g. issue #24's Definition of Done) | GitHub issues, `github.com/jpantsjoha/pinescript-vscode-extension` |
| JP (Jaroslav Pantsjoha) | Data owner | `v6/` reference dataset classification, freshness, and ADRs touching it (ADR-003) | GitHub issues |
| JP (Jaroslav Pantsjoha) | Integration owner | Candidate assembly, merge order, PR merge into `main` | GitHub pull requests |
| JP (Jaroslav Pantsjoha) | Operator | R3 approvals, external effects (marketplace/npm publish), spend | GitHub issues / direct instruction |

Escalation rule: insufficient evidence at any gate = the lane stops, the question is
recorded with an owner and a resolving trigger, and the roster role is tagged.

## Risk tier overrides

| Tier | Project examples | Required evidence |
|---|---|---|
| R0 | Read-only audit, `validate-cli.js` runs | Grounding and verification of load-bearing claims |
| R1 | Docs, tests, examples, `STATUS.md`/`ROADMAP.md` edits | Focused check (`npm test` / `npm run audit`) and a loud, reversible rollback (git revert) |
| R2 | Validator logic (`src/parser/`, `packages/validator/src/`), `v6/` data, packaging config (`.vscodeignore`, `package.json`), test fixtures | Durable plan/checkpoint, git worktree, regression-first (golden corpus stays at 0 errors), convergence gate (`npm run build && npm test && npm run audit`) |
| R3 | VS Code Marketplace publish (`vsce`), npm publish of the engine, git tag/release, `.github/workflows/`, `.claude/hooks/` and settings, deleting golden-corpus files, anything touching credentials (`VSCE_PAT`, `.npmrc`) | Explicit JP authority, paired false-positive/false-negative domain tests, independent review (a non-authoring lane), exact evidence binding, rollback (patch release) and observation (marketplace installs/rating, GitHub issues) |

Verified against JP's task brief, 2026-09-22, and cross-checked here against
`package.json` scripts and `.github/workflows/`. Ambiguity rounds upward.

## Protected path inventory

- `test/fixtures/corpus/` — the golden corpus; the false-positive gate (`test/golden-corpus.test.js`) reads it directly. Deletion or shrinkage is R3.
- `test/golden-corpus.test.js` — defines the CI false-positive gate itself (both the 4 tracked fixtures and the 7 gitignored `examples/` files).
- `test/regression-corpus.js` — regression harness run against the published artefact (`test/npm-package.test.js`), not just the source tree.
- `v6/parameter-requirements-generated.ts` — auto-scraped dataset (457 functions, 2025-10-03). Manual corrections never go here — they go in `v6/parameter-requirements.ts`, or a re-crawl silently erases them.
- `scripts/audit.js` — the self-audit gate; a change here can silently weaken the gate it enforces. Covers `src/parser/` modules plus the engine import only — a new diagnostic source added inside the engine package is not covered by this guard (CLAUDE.md, "Diagnostics come from MORE THAN ONE place").
- `.github/workflows/` — CI, PR-check, publish, and release pipelines; governs credentialled publish steps (`VSCE_PAT`).
- `.claude/hooks/` — pre-commit enforcement (`validate-pine.sh`, wired per `npm run audit` "harness" check).
- `CLAUDE.md` (repo root) — the project constitution.
- `docs/operating-model/PROJECT-OPERATING-PROFILE.md` — this file; constitutional contract.
- `docs/operating-model/OPERATING-MANUAL.md` — adopted immutable kernel.

Renames, deletions, and generated outputs (`dist/`, `build/*.vsix`) of these paths carry
the same blast radius as edits; `scripts/audit.js` enforces packaging and version-drift
checks on the generated outputs specifically (verified: `npm run audit` "packaging" and
"lockfile" checks, run 2026-09-22).

## Non-negotiable invariants

- A false positive is worse than a missed error. Every validation change is proved in
  both directions: a reduced case silences the false positive **and** a paired "must
  still flag" test proves the real error is still caught (CLAUDE.md, "The one rule that
  matters").
- The golden corpus (`test/golden-corpus.test.js`) stays at 0 errors — 4 tracked fixtures
  in `test/fixtures/corpus/` plus 7 gitignored `examples/` files, verified in this
  session's `npm test` run (2026-09-22).
- All three diagnostic sources — `AccurateValidator`, `documentChecks`, and the engine's
  `runSemanticChecks` (S1–S9) — are wired into both `validate-cli.js` and the golden
  corpus test; `scripts/audit.js` fails the build otherwise (verified: `npm run audit`
  "diagnostics" checks, both PASS, 2026-09-22).
- Manual parameter overrides go in `v6/parameter-requirements.ts`, never
  `v6/parameter-requirements-generated.ts`.
- Overloaded functions carry an explicit `overloads` array and are never flattened into
  one parameter list (CLAUDE.md, "Data layer").
- No AI/Claude co-author trailers or attribution in commits or PRs. Note on sourcing: the
  root `CLAUDE.md` "## Git" section states this rule and points to
  `.claude/COMMIT-GUIDELINES.md` as the reference — but that file (read in full this
  session) contains no AI-attribution language; it covers branching and commit-message
  format only. The rule itself is stated only in `CLAUDE.md`. Flagging as a discrepancy,
  not resolving it.
- Feature branches only; never commit directly to `main` (CLAUDE.md, "Git"; also stated
  in `.claude/COMMIT-GUIDELINES.md`, "ALWAYS USE PULL REQUESTS - NEVER MERGE DIRECTLY TO
  MAIN").

## Worktree and resource isolation

- One branch/worktree per mutating lane: `feat/<description>` naming (verified: CLAUDE.md
  "Git" section; this session's own branch,
  `feat/audit-s1-lookahead-docs-operating-model`, follows the convention).
- One integration owner and clean integration worktree: JP merges via pull request into
  `main` (verified: `.claude/COMMIT-GUIDELINES.md`, "ALWAYS USE PULL REQUESTS"). `main`
  currently carries **no GitHub branch protection rule** (verified 2026-09-22:
  `gh api repos/jpantsjoha/pinescript-vscode-extension/branches/main/protection` → 404
  "Branch not protected") — the PR-only discipline is a convention, not a platform-enforced
  gate.
- Resource namespaces: not applicable — the project ships a static VS Code extension and
  an npm package; there is no shared port, database, cache, queue, or cloud resource
  (verified: no server/daemon process in `package.json` scripts beyond build/test/package).
- Isolated local services: not applicable — same reason.
- Shared operational/production-like service: not applicable — reason: no deployed backend
  service exists. Delivery targets are the VS Code Marketplace and the npm registry, both
  external publish targets rather than a running service this repo operates.
- Forbidden cross-lane git/state actions: per OPERATING-MANUAL.md §4 — no subagent stashes,
  resets, cleans, rebases, or merges another lane's git state. This session's own task
  brief additionally forbids all git write commands, commits, and branch creation.

## Baseline skills and routing

| Delivery need | Baseline skill/capability | Project location or equivalent |
|---|---|---|
| Decomposition and routing | `delivery-orchestrator` | No repo-local equivalent found; `.claude/agents/` holds project-specific role agents instead (`documentation.md`, `product-owner.md`, `publisher.md`, `qa-validator.md`). Global `join-the-team:delivery-orchestrator` skill available at user scope. |
| System design and ADRs | `the-architect` | `docs/ADR-001-VALIDATION-STRATEGY.md`, `docs/ADR-002-TEST-STRATEGY.md`, `docs/ADR-003-TRADINGVIEW-SYNC-STRATEGY.md` (verified present 2026-09-22; a concurrent edit in this branch may relocate them to `docs/adr/`). |
| Requirements and acceptance contract | `spec-first-delivery` | GitHub issues with a checkable Definition of Done (verified example: issue #24). |
| Adversarial self-refutation | `adversarial-gate` | `.claude/agents/qa-validator.md` plus CLAUDE.md's Definition of Done table, which requires a paired "must still flag" test for every false-positive fix. |
| Domain-specific correctness | `domain-validator` | `.claude/agents/qa-validator.md` and `test/golden-corpus.test.js` (the false-positive gate). |
| Exact-candidate code review | `pr-reviewer` | No repo-local script; review is via the cross-model council lane order defined in `/Users/jp/.claude/CLAUDE.md` ("Cross-model council and engineering lanes") — global, not project-tracked. |
| Go/no-go and rollback readiness | `release-readiness` | `.claude/agents/publisher.md`. |
| Durable team status | `sitrep` | `STATUS.md` (repo root). |
| Cost/time limits | `cost-guardrail` | No project-specific ceiling found; global default in `/Users/jp/.claude/CLAUDE.md` ("at most 2 mutating lanes, one integrator"). |
| Cloud-vendor guardrails | `gcp-expert` / `aws-expert` / `azure-expert` / `alibaba-expert` | not applicable — no cloud infrastructure; this project is a VS Code extension plus an npm package. |

Routing order for consequential work: operating model → orchestration → architecture/spec
→ implementation → domain/adversarial validation → review → release readiness →
status reconciliation.

## Companion capabilities (optional)

not applicable — no companion plugins installed in this repository. The project supplies
its own local equivalents in `.claude/agents/` (`documentation.md`, `product-owner.md`,
`publisher.md`, `qa-validator.md`), read as prose context documents per `CLAUDE.md`
"Agents" section, rather than installed companion plugins with pinned versions.

| Craft capability | Provider (plugin and version) | Fallback if not installed |
|---|---|---|
| Publishing workflow | none installed | `.claude/agents/publisher.md` (project-owned procedure) |
| Domain (false-positive) QA | none installed | `.claude/agents/qa-validator.md` (project-owned procedure) |

## Exact validation and security commands

Run from the repository root (verified against `package.json` "scripts" and re-run this
session, 2026-09-22):

```bash
npm run typecheck                  # npx tsc --noEmit — exit 0, clean (verified 2026-09-22)
npm run audit                      # scripts/audit.js — 20 pass · 1 warn · 0 fail (verified 2026-09-23)
npm test                           # clean build + node --test test/*.test.js — 359 tests, 358 pass, 0 fail, 1 skipped (verified 2026-09-23)
npm run build                      # rm -rf dist, tsc (root + packages/validator), copy engine dist into dist/engine
node validate-cli.js <file.pine>          # headless single-file check
node validate-cli.js --local-engine <file.pine>   # run the working-tree engine instead of the published one
npm audit --audit-level=moderate   # dependency security scan (also run in CI: .github/workflows/ci.yml "security" job, non-blocking there — "|| true")
python3 /Users/jp/.claude/plugins/marketplaces/join-the-team-marketplace/skills/operating-model-bootstrap/scripts/validate_operating_model.py --target .   # profile drift check (verified script exists, 2026-09-22)
```

Exact review or post-commit SHA-binding command: not yet established — owner: JP;
required before: R3 work relies on a scripted candidate-binding check. No such script
exists in `scripts/`; today's independent review is a human/council read of
`git diff <old>..<new>`, per `/Users/jp/.claude/CLAUDE.md` `offload-engineering`
convention.

The project convergence command is `npm run build && npm test && npm run audit` (build +
full test suite including the golden corpus + the self-audit gate). This is the shared
definition-of-done entry point; individual tools may call it differently but may not
substitute a weaker gate silently.

## Data freshness and statistical gates

- Sources and owners: `v6/parameter-requirements-generated.ts` (457 function signatures,
  auto-scraped from TradingView's official Pine Script v6 reference) — owner JP.
  `v6/parameter-requirements.ts` (`MODERN_V6_FUNCTIONS`, hand-verified overrides and
  post-scrape API additions) — owner JP.
- Freshness/completeness/correctness criteria: re-crawl is due whenever TradingView
  publishes Pine Script release notes after the last scrape date; `scripts/audit.js`
  enforces this as a WARN, not a FAIL.
- Frozen vintage: scraped 2025-10-03 (verified: `npm run audit` output, "reference
  scraped 2025-10-03 (354d ago)", consistent with today's date 2026-09-22).
- Expected/actual scope: 457 functions (verified: `npm test`, "should have generated 457
  function signatures").
- Exclusions and hashes: not yet established — owner: JP; required before: a re-crawl
  provenance record (hash-pinned snapshot) is adopted. No such mechanism exists in
  `v6/scripts/` today.
- Statistical floors, sample size, multiple-testing, aggregate verdict: not applicable —
  reason: validation is deterministic rule-matching against a reference dataset, not a
  statistical or sampled decision.
- Fail-closed and remediation: fails open with a WARN, not a build-breaking FAIL
  (verified: the v6-data staleness is one of the two WARNs in `npm run audit`'s
  19-pass/2-warn/0-fail result). Remediation path: `npm run crawl`, `npm run generate`,
  or `npm run scrape` (verified script names in `package.json`), followed by manual
  review before merging into `v6/parameter-requirements-generated.ts`.

## Review roles and verdict semantics

- Required independent roles by tier: R0/R1 — self-check only (`npm test` / `npm run
  audit`). R2/R3 — an independent lane that did not author the change (a cross-model
  council lane, or a second agent), per "the writer never approves its own work"
  (`/Users/jp/.claude/CLAUDE.md`). R3 additionally requires JP's explicit sign-off before
  marketplace or npm publish (`.claude/agents/publisher.md`).
- Exact candidate binding: git commit SHA on the PR branch. No automated tree-digest or
  SHA-binding tool exists in this repo (verified: nothing under `scripts/` performs this);
  binding today is manual — the reviewer is pointed at `git diff <base>..<candidate>`.
- PASS: admissible only when no conditions remain.
- Conditional/amendment: blocking until fixed and re-reviewed.
- REJECT/BLOCKING: halt.
- Override: a separate, explicit JP instruction given in-session, recorded in `STATUS.md`
  "Plan changes since the previous status"; never encoded as a passing auditor verdict,
  and not reusable for a later, different change.
- Residual local/remote enforcement gap: `main` has no GitHub branch protection rule
  (verified 2026-09-22, 404 on the branches/main/protection API). PR-only and
  no-direct-commit discipline is convention (`CLAUDE.md`, `.claude/COMMIT-GUIDELINES.md`),
  not platform-enforced — a direct push to `main` is technically possible and would not be
  blocked by GitHub itself.

## Documentation triggers

- Status: `STATUS.md` (repo root) — trigger: one entry per working session, pruned rather
  than grown (source: `/Users/jp/.claude/CLAUDE.md`, "Delivery records" — a global, not
  project-tracked, convention; `confirm: JP` that it also governs this repo).
- Changelog: `CHANGELOG.md` (repo root, verified present, latest entry 0.6.2) — append-only
  rule: material delivered behaviour only, written when it merges, never at tag time
  (same source).
- Architecture/HLD/ADR: `docs/ADR-001..003-*.md` (verified present; may move to
  `docs/adr/`) — trigger: a decision changes validation strategy, test strategy, or the
  TradingView data-sync strategy (the three existing ADR subjects); approval owner JP.
- Runbooks/user docs: `README.md`, `CHANGELOG.md` — trigger: user-visible behaviour change
  (new/changed validation rule, new v6 API added to `MODERN_V6_FUNCTIONS`, or a packaging
  change), per CLAUDE.md's Definition of Done table.
- Invalid evidence: withdrawal/supersession rule: not yet established — owner: JP;
  required before: R2/R3 evidence manifests are used in practice. Templates exist
  (`docs/operating-model/templates/EVIDENCE-MANIFEST.template.yaml`) but none has been
  instantiated in this repo yet.

## Deployment and observation

- Authorized delivery destination: VS Code Marketplace, extension id
  `jpantsjoha.pinescript-v6-extension`, via `.github/workflows/publish.yml` (trigger: push
  of tag `v*.*.*`; uses the `VSCE_PAT` repo secret) and GitHub Releases via
  `.github/workflows/release.yml` (same tag trigger). npm registry for the engine package
  `pinescript-v6-validator` — no automated publish workflow found for it (verified:
  `grep -rn "npm publish" .github/ packages/validator/package.json scripts/` returns
  nothing); inferred — source: `packages/validator/package.json` is bumped to 0.3.1 in
  this branch while `npm view pinescript-v6-validator version` still returns 0.3.0,
  implying a manual `npm publish` from `packages/validator/` is the current path; confirm:
  JP.
- Pre-delivery gates: `.github/workflows/ci.yml` (typecheck, `npm run audit`, build,
  `npm test`, self-test, artifact verification, packaging, quality-gates, and a
  non-blocking `npm audit` security job) runs on push to `main`/`develop` and on PRs into
  `main`. `publish.yml` and `release.yml` each re-run `npm test` and the build before
  publishing.
- Deployment owner and authority: JP — the `VSCE_PAT` secret and npm publish credentials
  are JP's; `.claude/agents/publisher.md` executes only on JP's instruction.
- Observation window and signals: marketplace installs and rating (surfaced via the
  shields.io badges in `README.md`), and GitHub issues reporting false positives
  (verified: open issues #7–#16, #24–#26 are all field reports of exactly this kind).
- Stop/rollback triggers: not yet established — owner: JP; required before: a numeric
  threshold (install drop, rating drop, or issue-report count) is defined. Today the
  trigger is qualitative — any reported false positive is a fix-forward patch, per
  CLAUDE.md's one rule.
- External mutation idempotency: inferred — source: standard `vsce`/`npm` publish
  semantics — both registries reject re-publishing an already-used version number, so a
  retried publish of the same version is a no-op failure rather than a duplicate; confirm:
  JP.

## Rollback

- Code/config: inferred — source: "feature branches only, never commit to `main`" plus
  mandatory PRs (`CLAUDE.md`, `.claude/COMMIT-GUIDELINES.md`) implies revert-via-PR is the
  intended mechanism; no instance of an actual rollback was found in this repo's git
  history to confirm the practice; confirm: JP.
- Data/state: not applicable — reason: no runtime data store. The only versioned "data" is
  the tracked `v6/` reference dataset, itself revertible via git.
- Production kill switch: not applicable — reason: the VS Code Marketplace has no
  rollback mechanism (verified given fact, consistent with the Marketplace's public
  behaviour of not supporting per-version unpublish, only a full unlist). Rollback path
  is publishing a new patch version.
- Post-rollback verification: `npm run audit` and `npm test` on the patched version,
  then the marketplace listing re-checked for the new version number — inferred
  procedure; confirm: JP (no rollback has occurred in this repo's recorded history; every
  `STATUS.md`/`CHANGELOG.md` entry found is a forward release).

## Cost and concurrency budget

- Maximum active lanes: 2 mutating lanes; maximum mutating integrators: one (JP) —
  verified (JP's task brief, 2026-09-22).
- Model/tool/compute/network budget: council lanes (agy, k3, codex) are separate budgets
  from Claude; no paid external loop runs without JP's explicit say-so (verified, same
  source, cross-referenced against `/Users/jp/.claude/CLAUDE.md` "Cross-model council and
  engineering lanes").
- Timebox/escalation: not yet established — owner: JP; required before: a project-specific
  per-task time ceiling exists. The only concrete number found is the global council-lane
  timeout default (`COUNCIL_LANE_TIMEOUT`, 900s for PR-sized reviews), which is a tool
  default, not a project budget.
- Paid/external loops: require JP's explicit authorization (verified, same source).

## Artifact retention

- Permanent evidence: ADRs (`docs/ADR-001..003-*.md`, may move to `docs/adr/`),
  `CHANGELOG.md`, `test/metrics-v0.3.0.json` and `test/metrics-v0.3.1.json` (verified
  present 2026-09-22), and PR reviews on GitHub.
- Generated/local evidence: `build/*.vsix` — untracked (verified: `.gitignore` lines 4
  and 8, `build/` and `*.vsix`).
- Sensitive evidence: `examples/` — proprietary and gitignored, though 4 tracked corpus
  fixtures plus 7 legacy tracked example files remain committed from before the
  `.gitignore` rule existed (verified: `test/golden-corpus.test.js` comment, "eleven
  generic example files were committed before that rule existed and remain tracked").
  `.npmrc` is never committed (verified: `.gitignore` line 98, with the comment "a
  publish credential ends up in a public repo by accident").
- Stale evidence: never reuse; supersession/quarantine rule: not yet established — owner:
  JP; required before: a stale-evidence quarantine process is defined. None exists in
  this repo today.

## Completion contract

Complete means the exact integrated candidate passed every applicable gate, all review
conditions are closed, delivery was authorized and observed, docs/status/changelog agree,
remaining risks and operator actions are explicit, and rollback is known.

For design-only work, complete means the exact design candidate has resolved ownership,
interfaces, assumptions, decision records, validation strategy, delivery sequence, and
explicitly owned unknowns. It does not imply implementation or production readiness.
