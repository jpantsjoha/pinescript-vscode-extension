---
name: validator-gate
description: Run the full validation gate for the Pine Script validator before committing, releasing, or claiming a change works — typecheck, the regression corpus against both the local build and the packed npm tarball, and every file in examples/. Use after any change to packages/validator/, src/parser/, v6/ data, or the semantic checks, and before publishing the engine, packaging a VSIX, or reporting that a fix is done.
---

# validator-gate

Prove a change to this validator is correct before it leaves the machine.

## Run this

```bash
npm test        # ~5s. Includes the packed-tarball corpus and every file in examples/.
npm run audit   # packaging, versions, diagnostic coverage, lockfile drift
```

The pre-commit hook runs both. Everything below is about reading the result honestly.

For a tight edit loop, `npm run test:fast` skips the pack-and-install step. **Never
use it as the final check**, and never before a release — see below.

| Command | What it covers |
|---|---|
| `npm test` | Everything. The pre-commit hook runs this. |
| `npm run test:fast` | Same, minus the packed-tarball run. Edit loop only. |
| `npm run test:regression` | The corpus against the local build |
| `npm run test:package` | Pack → install → corpus against the published artefact |
| `npm run lint` | typecheck + `scripts/audit.js` |
| `npm run audit` | packaging, version consistency, diagnostic coverage, lockfile drift |

## The lockfile is a CI tripwire, not a formality

CI installs with `npm ci`, which **refuses to run** when `package-lock.json`
disagrees with `package.json`. A version bump or changed dependency range that
forgets the lockfile passes everything locally — `node_modules` is already
populated — then breaks every CI job at the install step, before a single test runs.

It had drifted silently by two releases before `npm run audit` learned to check it.
After any version bump or dependency change: `npm install`, and commit the lockfile.

## Why the packed-tarball run is the one that matters

Every recurring failure in this project has had one shape: **correct in `src/`,
broken in what users receive.**

- Doc anchors that resolved against the source registry and were dead in the shipped
  package, because the package had not been rebuilt.
- A VSIX that died at activation because the engine was excluded from the bundle.
- A local scratchpad path that leaked into a dependency range during testing, which
  would have made `npm install` fail for everyone.
- An MCP manifest declaring a server file that did not exist — and passed schema
  validation cleanly.

`test/npm-package.test.js` packs the tarball, installs it into a throwaway project,
and drives the corpus through `require('pinescript-v6-validator')` with no path back
into this repo. It is the only suite that can see any of the above.

## The regression corpus

`test/regression-corpus.js` is **data, not tests** — one table, executed against both
the local build and the installed package, so the two cannot drift.

Every entry is a defect that reached a user or survived a review. Each carries the
date it was found and an account of how it escaped.

**When you find a defect, add the case BEFORE fixing it.** Watch it fail, then fix
it. A case added afterwards proves only that the code does what it currently does.

Two rules the corpus enforces on itself:

- Every case needs a real `found` date and a `why` longer than a line. A case nobody
  understands is a case somebody deletes.
- At least 30% of cases must assert **silence** on correct code. If negatives fall
  away, the corpus has quietly become a "find more bugs" suite and stopped defending
  working code, which is the harder and more valuable half.

## Reading the result

**A clean run is not proof the script is correct.** State what was actually checked.

Warnings in `examples/` are expected — those files legitimately demonstrate `S1` on
higher-timeframe data. **Errors are not.** An example that cannot compile teaches
whatever it contains; that is exactly how the accumulator defect propagated.

A new **false positive** is more serious than a new miss, and is a release blocker.
It fires on working code and teaches people to ignore the tool. If a check starts
warning on something a user wrote and TradingView accepts, fix the check — do not
document the exception.

## Before releasing

Order matters. The extension bundles the engine at build time, so an extension
pinned ahead of what is published produces a VSIX whose engine cannot be installed —
discovered at activation, on a user's machine.

1. `npm test` — all green, no skips other than the one known skip
2. Bump and publish **the engine** (`packages/validator`) first
3. Bump the extension, pin the new engine version, rebuild, package
4. In `jpantsjoha/pinescript-plugin`: `make gate`, which includes `make anchors` —
   it resolves every check's `docAnchor` against real skill headings, using the
   **installed** engine, so it will fail until step 2 has actually landed on npm
5. Verify the VSIX contains `dist/engine/`

## When a check changes

A check is written **once, in the engine** (ADR-0001). Never in a skill, never in the
extension. A skill may *explain* a check; it must not reimplement one. `scripts/audit.js`
guards this — if it reports fewer sources than exist, the guard has gone blind and is
worth more attention than the thing it was checking.

Every check ships with **both directions**: one case it must flag, one legitimate case
it must stay silent on. If the "must not flag" case cannot be written, the check does
not ship.
