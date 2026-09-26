# Testing Guide: Pine Script v6 Extension

The test strategy, how to run it, and how to extend it. `docs/adr/ADR-002-TEST-STRATEGY.md`
records why the suite is shaped this way; `CLAUDE.md` holds the Definition of Done per
task type.

**The rule every layer serves:** a false positive (a diagnostic on valid Pine) is worse than
a missed error. Every check is proved in both directions: it fires on the real mistake
and stays silent on valid code. A test that has never been seen to fail proves nothing,
so every new test is run once against the unfixed code first.

---

## Running it

Tooling needs **Node 22** (`.nvmrc`); CI runs Node 22 and 24. The extension itself runs
on VS Code's bundled runtime.

```bash
npm test               # build + every test/*.test.js — the gate for any change
npm run test:fast      # the same, skipping the packed-tarball test (faster local loop)
npm run test:regression   # the regression corpus only
npm run test:package      # the packed-and-installed npm tarball only
npm run test:watch        # watch-mode smoke test (scripts/watch-smoke.js)
npm run audit          # harness, packaging, version and diagnostic-source checks
npm run typecheck      # builds the engine's declarations, then checks the extension (no emit)
npm run package && npm run verify:vsix -- build/<file>.vsix   # the shipped artefact
node validate-cli.js <file.pine>   # one file, all three diagnostic sources
node scripts/diff-diagnostics.js --against v0.6.5   # every .pine file vs a previous release
```

Do not hard-code a test count in docs or commit messages; it drifts with every new file.

---

## The layers

Diagnostics come from three sources, all in the one engine (`packages/validator`, built
into `dist/engine` and loaded only through `src/engine.ts`): `AccurateValidator`
(signatures, arity, namespaces, the #12 cast rule), `documentChecks` (whole-document
heuristics) and the semantic checks S1-S3, S5-S10. Every layer below runs all three
unless it says otherwise.

| # | Layer | Files | What it proves |
|---|---|---|---|
| 1 | Reference data | `validation.test.js`, `reference-names.test.js`, `request-arity.test.js` | The v6 signature data is consistent (manual overrides beat the crawl, overloads kept, no duplicates) and the namespace member list is complete |
| 2 | Rules, both ways | `semantic-checks.test.js`, `cast-rule.test.js`, `suppression.test.js`, `ternary-and-multiline.test.js`, `wrapped-statement-location.test.js`, `benchmark.test.js` | Each check fires on its mistake and is silent on the valid neighbour; `// pine-ignore` suppresses only semantic checks and only the named id |
| 3 | Regression corpus | `regression-corpus.js` (data), `regression-corpus.test.js`, `false-positive-regression.test.js`, `regression-extended.test.js`, `regression-namespace-functions.test.js` | Every defect ever shipped stays fixed. A case marked correct fails on **any** error or warning, not just errors |
| 4 | Golden corpus | `golden-corpus.test.js`, fixtures in `test/fixtures/corpus/` | Scripts that compile on TradingView produce zero errors; committed fixtures also produce zero warnings and zero semantic findings; validation stays inside the 100 ms budget |
| 5 | IntelliSense | `intellisense-coverage.test.js`, `named-parameter-*.test.js`, `declared-names-cache.test.js` | All 475 reference functions complete as functions, with hover and every overload in signature help; parameter-name and value completions, wrapped-call context and the per-document cache |
| 6 | Quick fixes | `quick-fixes.test.js`, `code-actions-provider.test.js` | Every fix is applied and the result re-validated: the target diagnostic is gone and nothing new appears. Negative cases prove no fix is offered for stale, foreign or ambiguous diagnostics or for names the script may redeclare |
| 7 | One engine | `engine-parity.test.js`, `engine-sync.test.js` | No copy of an engine module in `src/` or `v6/`; nothing loads around `src/engine.ts`; `dist/engine` is byte-identical to the local engine build; the watch-mode sync keeps the last good build when a swap fails |
| 8 | Shipped artefacts | `packaging-guards.test.js`, `npm-package.test.js`, `scripts/verify-vsix.js`, `scripts/audit.js` | The VSIX contains exactly the expected files, the engine once, no unsafe archive entries, and its packaged `activate()` runs; the npm tarball behaves like the source tree and runs the whole regression corpus |
| 9 | Real scripts | `examples.test.js` | Files under `examples/` (gitignored, local only) stay free of errors |

`test/v0.4.0-self-test.js` (language coverage) and `scripts/watch-smoke.js` (watch mode on
a fresh copy of the project) run as separate CI steps.

---

## Gates, and where each runs

| Gate | Local | CI (`ci.yml`) | Tag workflows (`publish.yml`, `release.yml`) |
|---|---|---|---|
| `npm test` | every change | Node 22 and 24 | before packaging |
| `npm run audit`, typecheck | every change | Node 22 and 24 | — |
| Self-test, watch smoke | before a harness change | Node 22 and 24 | — |
| Package + `verify-vsix` | before a release | package job | before any publish; the audit fails if a workflow publishes before verifying |
| PR Validation: breaking-change check on validator files, full suite, self-test, build | — | `pr-check.yml` on every PR (Node 22) | — |
| `scripts/diff-diagnostics.js --against <previous tag>`: every `.pine` file, each new or lost diagnostic listed and justified | before a release | — | — |
| Independent review of the exact candidate | every PR | — | — |

Branch protection on `main` requires Test & Lint (22.x and 24.x), PR Validation, Quality
Gates and Package Extension.

**Independent review.** The author never approves their own work. Every PR is reviewed
by a different model on the exact head commit (the `pr-review` skill: a non-Claude lane
first, an Opus subagent as the named fallback), a changed candidate gets a delta review,
and the verdict is recorded on the PR. A review never replaces the local gate.

---

## Adding a test

**A false-positive fix.** Add the reduced script to `test/regression-corpus.js` with
`expect: null` (or to the golden corpus if it is a whole script) **before** fixing it, and
watch it fail. Add a paired case with the same shape that must still flag. Then fix.

**A new validation rule.** Verify it against the official v6 reference and the release
notes and cite them in the code. Add must-flag and must-stay-silent cases, including
wrapped lines, CRLF, comments and strings. Confirm zero new diagnostics on every `.pine`
file.

**A new built-in function.** Add it to `MODERN_V6_FUNCTIONS` in
`packages/validator/data/parameter-requirements.ts` with its release date, never to the
generated file, and add a test that calls it.

**A new quick fix.** Put the edit logic in `src/quickFixData.ts` (no `vscode` import), test
it by applying the edit and re-validating, and add a case where it must not be offered.

**A packaging change.** Run `npm run package`, then `verify-vsix` on the output. If the
VSIX should contain a new file, add it to the allowlist in `scripts/verify-vsix.js` with a
reason.

---

## When a test fails

- **Golden or regression corpus error on correct code:** a false positive. Fix the rule,
  not the test.
- **A must-flag case goes silent:** a missed error; check whether a new silence condition
  is too broad.
- **Reference data test:** TradingView may have changed a signature. Check the
  [v6 reference](https://www.tradingview.com/pine-script-reference/v6/) and the
  [release notes](https://www.tradingview.com/pine-script-docs/release-notes/), then put
  the correction in `parameter-requirements.ts`.
- **`verify-vsix` or packaging guard:** read its listing; an unexpected entry usually
  means a stray local file or an iCloud conflict copy (`name 2.js`). Package from a clean
  checkout.

## Refreshing the reference data

```bash
npm run crawl   # re-crawl the v6 reference into packages/validator/data/
npm test        # then review every narrowed entry by hand
```

---

## Resources

- TradingView reference: https://www.tradingview.com/pine-script-reference/v6/
- Pine Script docs: https://www.tradingview.com/pine-script-docs/
- Node.js test runner: https://nodejs.org/api/test.html
