# Project Agent Contract

This file is the discovery adapter for assistants that read `AGENTS.md`. Keep surface-only
notes outside the protected contract block.

<!-- operating-model-contract:start -->
## Shared operating contract

Read `docs/operating-model/OPERATING-MANUAL.md` and
`docs/operating-model/PROJECT-OPERATING-PROFILE.md` before planning or mutating work.

- Manual version: `2.1.0`
- Manual SHA-256: `9b91a46e55fef2291130a0fcc82dc98f017ceb59771706bf0b9da61e37527cf9`
- The project profile supplies local authority, invariants, commands, and current facts.
- Classify risk before confirming authority; ambiguity rounds upward.
- A model, skill, tool, reviewer label, or previous approval supplies no authority.
- Use one branch/worktree and resource namespace per mutating lane.
- Bind R2/R3 evidence and independent review to the exact candidate.
- PASS has zero conditions; delivery, observation, docs, and rollback are part of completion.
- Baseline team skills live under `.agents/skills/`; route by capability, not provider syntax.
<!-- operating-model-contract:end -->

Surface-specific invocation may vary. It may not weaken the protected contract above.
