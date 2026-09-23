# Pine Script v6 IDE Tools Status

**As of:** 2026-09-23

**Scope:** whole project.

**Derived from:** root [`STATUS.md`](../STATUS.md), the canonical status record. This file
is the operating-model pointer; it does not duplicate the content.

## Done

- See root `STATUS.md`, section "2026-09-23 — repair and prune".

## Blocked

- none. Waiting on operator decisions (merge, publish, release) — owner: JP. See the decision board in root `STATUS.md`.

## Next

1. Merge the stacked PRs, publish engine 0.4.0, release 0.6.3 — owner: JP.

## Risks and conditions

- Users run engine 0.3.0 until the publish, so the fixed false positives persist in the Marketplace build — impact: uninstalls — owner: JP.

## Plan changes since the previous status

- The AST validator path was deleted on 2026-09-23 (operator instruction). Type inference is out of scope until an AST path is rebuilt.
