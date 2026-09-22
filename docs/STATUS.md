# Pine Script v6 IDE Tools Status

**As of:** `2026-09-22` (this pointer file's own last-verified date)

**Scope:** project — this is a pointer file. The canonical derived-status record is
`STATUS.md` at the repository root (JP's convention).

**Derived from:** `../STATUS.md` (root; verified present, header reads "Updated:
2026-08-07," "Working version: 0.6.0") and `../CHANGELOG.md` (verified present, latest
entry `[0.6.2] - 2026-08-08`).

Discrepancy, not adjudicated: root `STATUS.md`'s own header date (2026-08-07) is 46 days
behind today (2026-09-22), and predates the work now in flight on this branch (issue #24,
engine 0.3.1). Refreshing it is root-`STATUS.md` work, owned by whoever owns that file —
not this pointer.

## Done

See `../STATUS.md`, "Where this stands" — the root file is the single derived-status
record; this pointer file does not duplicate it.

## Blocked

See `../STATUS.md`. None recorded in this pointer file.

## Next

See `../STATUS.md`, and `docs/ROADMAP.md`'s "Now" row (issue #24). None recorded
separately in this pointer file.

## Risks and conditions

- Root `STATUS.md` is 46 days stale relative to today and does not yet reflect issue #24
  or the engine 0.3.1 bump — impact: a reader of the root file alone would miss in-flight
  work — owner: JP.
- `main` carries no GitHub branch protection rule (verified 2026-09-22, 404 on
  `branches/main/protection`) — impact: the PR-only merge discipline is convention, not
  platform-enforced — owner: JP.

## Plan changes since the previous status

none — this pointer file was just created by the operating-model bootstrap (version
2.1.0) and has no prior version to diff against.

Use `none` rather than deleting a required section. This file is a derived snapshot, not
an activity diary or an alternative task tracker.
