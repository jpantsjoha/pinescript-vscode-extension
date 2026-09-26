# Testing Guide: Pine Script v6 Extension

How to run, read and extend the test suite. See also `docs/adr/ADR-002-TEST-STRATEGY.md`
for why the suite is shaped this way, and `CLAUDE.md`'s "Before you change validation
logic" section for the commands to run before touching a validator.

---

## Running the suite

```bash
npm test              # build + full suite (test/*.test.js) — the gate for any change
npm run test:fast      # build + suite, skips the packaged-VSIX check (faster local loop)
npm run test:validation  # test/validation.test.js only
npm run test:benchmark   # test/benchmark.test.js only
npm run test:regression  # test/regression-corpus.test.js only
npm run test:package     # test/npm-package.test.js only (packs and installs the tarball)
npm run audit          # harness, packaging, version and diagnostic-coverage checks
```

Do not hard-code a test count in docs or commit messages — it drifts every time a
file is added. Say "the full suite" or "run `npm test`" instead.

---

## The test suite

Every file under `test/*.test.js` runs as part of `npm test`, via Node's built-in
test runner (`node --test`).

| File | What it proves |
|---|---|
| `benchmark.test.js` | Fixtures in `test/fixtures/valid.pine` / `invalid.pine` validate as expected |
| `engine-parity.test.js` | One engine: no copy of a `packages/validator` module in `src/` or `v6/`, nothing imports around `src/engine.ts`, the build bundles the LOCAL engine build, and `dist/engine` is byte-identical to it |
| `examples.test.js` | Files under `examples/` stay valid; negative fixtures stay invalid |
| `false-positive-regression.test.js` | Previously reported false positives stay fixed |
| `golden-corpus.test.js` | Known-good Pine v6 files (`test/fixtures/corpus/`) validate CLEAN — any error here is a false positive by definition |
| `npm-package.test.js` | The packed-and-installed npm tarball behaves like the source tree, not just `dist/` |
| `regression-corpus.test.js` | The shared regression corpus (`test/regression-corpus.js`), run against the local build |
| `regression-extended.test.js` | Extended regression cases beyond the core corpus |
| `regression-namespace-functions.test.js` | Namespace-function validation regressions |
| `request-arity.test.js` | `request.security` / `request.security_lower_tf` arity and signature overrides |
| `semantic-checks.test.js` | Engine semantic checks S1-S3, S5-S10 (paired: must flag AND must not false-positive) |
| `suppression.test.js` | The check registry and `// pine-ignore` suppression comments |
| `ternary-and-multiline.test.js` | Ternary operators and multi-line statements |
| `validation.test.js` | Parameter-requirements data integrity (manual vs. generated, no duplicates) |

`test/v0.4.0-self-test.js` runs separately in CI (`node test/v0.4.0-self-test.js`,
see `.github/workflows/ci.yml`) as a language-coverage self-check, not part of
`npm test`.

---

## Test fixtures

### Valid code (`test/fixtures/valid.pine`)
Real Pine Script v6 code that must **not** trigger validation errors. Covers
indicator/strategy declarations, input functions, plot/alert/ta functions, array
operations, and edge cases that have previously been misflagged.

### Invalid code (`test/fixtures/invalid.pine`)
Pine Script v6 code with intentional errors the validator must catch: missing
required parameters, too many parameters, wrong parameter names, undefined
variables.

### Golden corpus (`test/fixtures/corpus/`)
Real scripts that compile and run on TradingView. Any error the validator reports
against them is a false positive by definition. When a user reports one, add their
reduced script here **before** fixing it (`golden-corpus.test.js` will then fail
until the fix lands).

---

## Adding new tests

### For a new Pine Script function
1. Add to `packages/validator/data/parameter-requirements.ts` (manual overrides) if the function is
   high-priority — never edit `packages/validator/data/parameter-requirements-generated.ts` directly, a
   re-crawl overwrites it.
2. Add a test case to `test/validation.test.js`.
3. Add usage examples to `test/fixtures/valid.pine` and, if relevant,
   `test/fixtures/invalid.pine`.

### For a false-positive fix
Follow `CLAUDE.md`'s Definition of Done: add the reduced case to the golden corpus
**before** the fix, then add a paired "must still flag" test so a real error in the
same shape doesn't silently stop being caught.

### For a new validation rule
Add paired tests in both directions, verify against the official v6 reference, and
confirm zero new diagnostics on the golden corpus.

---

## Debugging a failing test

**Test fails after a documentation update**
- TradingView may have changed parameter requirements, the parser may have
  misread the HTML, or a function may have been deprecated/renamed.
- Check https://www.tradingview.com/pine-script-reference/v6/, compare manual vs.
  generated requirements, and add a manual override if the auto-parse is wrong.

**False positive**
- Review actual TradingView Pine Editor behaviour, then fix
  `packages/validator/data/parameter-requirements.ts` if the manual override is wrong. Add a regression
  test so it can't come back.

**False negative (missed error)**
- Add the case to `test/fixtures/invalid.pine`, confirm it should be caught, then
  fix the validator logic and add an assertion.

---

## Re-parsing TradingView docs

```bash
node v6/scripts/parse-main-page.js       # re-scrape the v6 reference
node v6/scripts/merge-requirements.js    # regenerate the merged requirements file
npm test                                 # confirm no regressions
```

This is real, working tooling — not the same as the wider quarterly-sync automation
described in `docs/adr/ADR-003-TRADINGVIEW-SYNC-STRATEGY.md`, most of which was
never built (see that ADR's 2026-09-23 status note).

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main`/`develop` and every PR to
`main`: typecheck, `npm run audit`, `npm run build`, `npm test`,
`node test/v0.4.0-self-test.js`, a build-artifact check, and a second `tsc --noEmit`
pass. A separate job packages the VSIX and verifies it was created; a security job
runs `npm audit`. Read the workflow file directly for the exact steps — it changes
more often than this guide should try to mirror.

---

## Test maintenance

| Frequency | Task |
|---|---|
| Every commit | `npm test` |
| Before release | Full suite + `npm run audit` + manual QA on real user code |
| After a doc/data update | Re-run `v6/scripts/parse-main-page.js` and `merge-requirements.js`, then `npm test` |
| Ongoing | Add community-reported edge cases to the golden corpus as they arrive |

---

## Resources

- TradingView reference: https://www.tradingview.com/pine-script-reference/v6/
- Pine Script docs: https://www.tradingview.com/pine-script-docs/
- Node.js test runner: https://nodejs.org/api/test.html
