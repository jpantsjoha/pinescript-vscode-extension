# Pine Script v6 IDE Tools Delivery Workflow

This file defines how accepted intent moves through planning, implementation, review,
delivery, observation, and learning. The operating manual supplies the universal state
machine; this project workflow maps that contract to the team's roles and work system.

## Work-system mapping

| Delivery record | System of record | Project location |
| --- | --- | --- |
| Vision and outcomes | Repository | `docs/VISION.md` |
| Requirements and Product Owner acceptance | GitHub issues | `https://github.com/jpantsjoha/pinescript-vscode-extension/issues` — each issue carries a golden thread, scope with exclusions, and a checkable Definition of Done (verified example: issue #24). |
| Architecture decisions | Repository | `docs/adr/` — as of 2026-09-22 the three ADRs are still tracked at `docs/ADR-001-VALIDATION-STRATEGY.md`, `docs/ADR-002-TEST-STRATEGY.md`, `docs/ADR-003-TRADINGVIEW-SYNC-STRATEGY.md`; a concurrent edit in this branch may relocate them to `docs/adr/`. |
| Roadmap order and gates | Repository | `ROADMAP.md` (root) — JP's convention makes the root-level file canonical, but **it does not exist in this repo as of 2026-09-22** (verified: `ls` at repo root, and `git log --all -- ROADMAP.md` returns no history). `docs/ROADMAP.md` is a pointer until it is created. |
| Milestones, epics, tasks, and assignment | GitHub issues | `https://github.com/jpantsjoha/pinescript-vscode-extension/issues` — no GitHub milestones are configured (verified: `gh api repos/jpantsjoha/pinescript-vscode-extension/milestones` → `[]`). |
| Current derived status | Repository | `STATUS.md` (root; verified present, last updated 2026-08-07 per its own header). |
| Released behaviour | Repository | `CHANGELOG.md` (root; verified present, latest entry `[0.6.2]`). |
| Checkpoints and exact-candidate evidence | Repository | `docs/operating-model/` — no checkpoint or evidence-manifest instance has been created yet; only the templates exist (`docs/operating-model/templates/CHECKPOINT.template.yaml`, `EVIDENCE-MANIFEST.template.yaml`). |

## Lifecycle

1. **Intake** — capture the problem, actor, desired outcome, and Product Owner.
2. **Accept** — the Product Owner validates scope, priority, acceptance criteria, and
   milestone. Agent-drafted intent remains a draft until this gate passes.
3. **Plan** — `delivery-orchestrator` creates the dependency-aware task tree, ownership,
   context boundaries, success tests, budgets, and documentation impact.
4. **Decide** — human SMEs accept required ADRs and constraints before dependent work is
   dispatched.
5. **Execute** — bounded human or agent workers implement independently verifiable tasks
   in isolated mutable lanes.
6. **Integrate** — one named integration owner assembles pinned outputs and runs the
   convergence gate.
7. **Review** — independent reviewers apply declared, decorrelated lenses to the exact
   candidate; conditions block until resolved.
8. **Deliver and observe** — an authorised operator releases, watches the declared
   signals, and rolls back when thresholds are crossed.
9. **Reconcile and learn** — update roadmap gates, derived status, release changelog,
   evidence, risks, and reusable delivery learnings.

## Role boundaries

- Product Owner owns outcome, priority, scope, and acceptance.
- Delivery orchestrator owns plan coherence and re-planning; it does not approve product
  intent.
- Planners own assigned planning subtrees and cross-cutting decisions; they do not
  implement delegated leaf tasks.
- Workers own one bounded task and its evidence; they do not change sibling scope.
- One integration owner assembles; independent reviewers refute; the operator authorises
  external effects.

## Re-planning trigger

Pause affected descendants when evidence changes an outcome, acceptance criterion,
interface, dependency, risk, budget, or ownership boundary. Record the new evidence,
supersede stale tasks or decisions, obtain the required human validation, and only then
resume dispatch.

## Project controls

- Product Owner acceptance evidence: a GitHub issue carrying a checked Definition of Done
  (verified example: issue #24, "S1 false positive: positional lookahead"). JP is the
  sole Product Owner — solo project (verified, CLAUDE.md footer and task brief).
- Maximum active lanes: 2 mutating lanes; maximum mutating integrators: one (JP) —
  verified (JP's task brief, 2026-09-22).
- Planner / worker / reviewer model tiers: inferred — source:
  `/Users/jp/.claude/CLAUDE.md` "Cross-model council and engineering lanes" — review lane
  order `agy` → `sol-xhigh` (Codex) → `k3`; execution lane order `k3` → `codex exec` →
  Claude (Opus cross-file / Sonnet mechanical) as fallback. This mapping is a global
  operator convention, not recorded anywhere inside this repository; confirm: JP that it
  governs this project specifically.
- Epic cost and time ceiling: not yet established — owner: JP; required before: an
  epic-level budget is defined. No evidence of one exists in this repo.
- Convergence command: `npm run build && npm test && npm run audit` — verified against
  `package.json` scripts and CLAUDE.md's "Before you change validation logic" section;
  re-run this session (2026-09-22): typecheck clean, 300 tests (299 pass, 0 fail, 1
  skipped), audit 19 pass · 2 warn · 0 fail.
- Live work-system reconciliation: owned manual process — `gh issue list` / `gh issue view
  <n>` (no reconciliation script exists under `scripts/`).
- Status reconciliation trigger: one entry per working session, pruned rather than grown
  — inferred — source: `/Users/jp/.claude/CLAUDE.md` "Delivery records" table (a global,
  not project-tracked, convention); confirm: JP that it governs `STATUS.md` in this repo.
- Changelog rule: material delivered behaviour only.
- Escalation path: GitHub issues on the repo — verified (JP's task brief, 2026-09-22).
