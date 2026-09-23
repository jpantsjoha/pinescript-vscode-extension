# Pine Script v6 IDE Tools Vision

`Pine Script v6 IDE Tools` should make its intended users or operators measurably better able to
achieve catching real Pine Script v6 errors before they reach TradingView, without ever
flagging valid v6 code as an error (verified: CLAUDE.md, "The one rule that matters" and
"Project Mission" — "100% accurate parameter validation," "Zero false positives on the
golden corpus"). Human Product Owners and subject-matter experts retain
authority over intent, priority, acceptance, architecture, risk, and external effects.
AI planners and workers increase throughput inside those boundaries without fragmenting
decisions, duplicating work, or spending unbounded time and tokens.

The unit of delivery is not a prompt or an agent session. It is an accepted outcome
contract that can be decomposed into owned, independently verifiable work and traced
through implementation, review, release, observation, and learning.

The project succeeds when it makes these behaviours routine:

- the Product Owner validates requirements before implementation is dispatched;
- the delivery orchestrator owns the plan and decomposes accepted outcomes into a
  dependency-aware task tree;
- planner context stays focused on intent, interfaces, decisions, and convergence while
  worker context stays bounded to one independently verifiable task;
- milestones, epics, tasks, pull requests, and repository documents point to one another
  without competing as sources of truth;
- roadmap, status, changelog, ADRs, and evidence are reconciled at defined lifecycle
  transitions;
- planning quality is measured partly by avoided rework, conflict, duplication, context
  churn, and agent spend—not by task or commit volume alone;
- teams capture delivery surprises so later human and agent trajectories become shorter.

## Product principles

1. **Intent is scarce.** High-quality requirements and acceptance decisions are
   non-delegable Product Owner work, even when an agent drafts them.
2. **Planning is execution leverage.** Ambiguity removed by a capable planner reduces
   worker churn, context use, and total cost.
3. **One decision, one owner, one record.** Parallel planners may refine independent
   branches of a task tree; they may not decide the same cross-cutting question twice.
4. **State is durable and derived.** The work system tracks active work; repository
   documents track intent, decisions, operating truth, and release history.
5. **Review is cheaper than rework.** Independent, decorrelated review lenses are part of
   the plan and budget, not an optional final flourish.
6. **Learning closes the loop.** Scope changes, surprises, and failed assumptions update
   the durable plan before more work is dispatched.

## Current focus

- Primary user or operator: Pine Script authors using VS Code (verified: README.md, "VS
  Code with IntelliSense, real-time validation"; marketplace id
  `jpantsjoha.pinescript-v6-extension`).
- Problem to solve: inferred — source: the extension's own reason to exist (real-time,
  in-editor validation) implies the prior state — a Pine Script author gets no error
  feedback until pasting code into TradingView's own Pine Editor, which is the only place
  Pine Script compiles; no repo text states this problem sentence verbatim; confirm: JP.
- First measurable outcome: zero false positives on the golden corpus while still
  catching real errors (verified: CLAUDE.md, "The one rule that matters"; golden corpus,
  `test/golden-corpus.test.js`, holds at 0 errors, re-verified 2026-09-23). Scope: CI
  sees the 4 synthetic fixtures in `test/fixtures/corpus/`; the 7 real scripts in
  `examples/` are gitignored (proprietary) and gate only local runs and the pre-commit hook.
- Explicitly out of scope: type inference and AST-based validation, until an AST path is
  rebuilt — the previous one was deleted 2026-09-23 (verified: CLAUDE.md, "`AccurateValidator`
  has no AST, so it cannot do type inference... Type inference is out of scope until an AST
  path is rebuilt"); Pine Script v5 support (verified: open issue #1, "Support for v5 Pine
  script," unresolved).
- Product Owner: JP (Jaroslav Pantsjoha) — verified: CLAUDE.md footer, "Maintainer: Pine
  Script Extension Team: JP"; solo project.
- Requirement or discovery record: GitHub issues,
  `https://github.com/jpantsjoha/pinescript-vscode-extension/issues` — verified.
