# Project Status

**Updated**: 2026-08-07
**Working version**: 0.6.0
**Marketplace version**: 0.6.0, published 2026-08-07
**Installs**: 1,404 · **Rating**: 4.45★
**Engine**: [`pinescript-v6-validator@0.2.0`](https://www.npmjs.com/package/pinescript-v6-validator) on npm

---

## Where this stands

The extension works and has real users. Two releases shipped today: 0.5.1 closed a
ten-month gap and eliminated the false positives, and 0.6.0 added semantic checks —
detection of code that COMPILES and is still wrong (repainting, `ta.*` history
gaps, scope errors, platform limits).

The validation engine is now published as `pinescript-v6-validator` and consumed
by both this extension and the agent plugin, so semantic findings are identical in both.

| Signal | State |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm test` | 169/169 pass |
| `npm run audit` | 19 pass · 1 warn · 0 fail |
| Golden corpus (synthetic fixtures, both diagnostic paths) | 0 errors |
| Validation speed, 1,300-line script | ~12ms (budget: 100ms) |
| MCP server | loads and validates |
| `ComprehensiveValidator` | **still broken** — see Known Issues |

---

## Roadmap reconciliation

`VALIDATOR-ENHANCEMENT-ROADMAP.md` was written 2025-10-15, *after* the last
publish. None of it had reached a user until now.

| Gap | Roadmap priority | State |
|---|---|---|
| 1. Multi-line continuation | 🔴 CRITICAL | ✅ Shipped in 0.5.0 |
| 2. Ternary operator | 🟡 MEDIUM | ✅ Shipped in 0.5.0 |
| 3. Execution model (`var` / `:=`) | 🟡 MEDIUM | ⚠️ Partial — S3/S4 specified, deliberately deferred |
| 4. Type system | 🔴 HIGH | ⛔ **Blocked** — needs the AST path repaired |
| 5. Control flow syntax | 🟡 MEDIUM | ⛔ Blocked (same) |
| 6. Expression parsing | 🟢 LOW | ⛔ Blocked (same) |
| 7. Platform limits | 🟢 LOW | ✅ Shipped in 0.6.0 as checks S5/S6 |
| 8. Anti-repainting | 🟡 MEDIUM | ✅ Shipped in 0.6.0 as check S1 |

### The roadmap's accuracy problem

It claims "Current ~70% → target 95% TradingView parity". **Those numbers were
never measured.** There is no corpus, no TradingView error archive, and no parity
script — the figures are asserted. Until a measurement harness exists, treat every
percentage in that document as unsupported.

Its effort estimates were also optimistic: Gap 4 was budgeted 10–15 hours and is a
three-week plan that consumed ten months and shipped nothing. The reason is
structural, not effort — see below.

---

## The central architectural decision (unresolved)

Three diagnostic sources ship. Two older validators are dead.

```
packages/validator/          ← the engine, published as pinescript-v6-validator
  semanticChecks.ts          ← ships. S1,S2,S5-S9. Consumed via dist/engine/
src/parser/
  accurateValidator.ts       ~970 LOC  ← ships. DUPLICATED in the engine.
  documentChecks.ts          ~220 LOC  ← ships. DUPLICATED in the engine.
  comprehensiveValidator.ts 1126 LOC   ← DEAD. Import removed. Crashes on valid input.
  validator.ts               373 LOC   ← DEAD. Import removed.
  parser.ts / ast.ts / lexer.ts / typeSystem.ts / symbolTable.ts
                            ~2000 LOC  ← feeds only the dead path
```

All three shipping sources are wired into `validate-cli.js` and the golden corpus.

**Known architectural debt:** the syntactic validator and the v6 dataset exist in
both `src/parser/`+`v6/` and the engine package. `test/engine-parity.test.js` fails
the build if they drift, but migrating them to the package — as the semantic checks
already are — is outstanding. That guard exists because
the document checks previously ran untested and shipped 28 false positives across
files the suite was certifying as clean.

`AccurateValidator` is regex-over-lines with no AST. That is why Gaps 4–6 are
blocked rather than merely unstarted: **type inference cannot be bolted onto a
line-based matcher.** The roadmap assumes it can. It can't.

Two honest options:

1. **Repair the AST path.** Fix `parse()` so it always returns an iterable `body`,
   get `ComprehensiveValidator` passing the golden corpus, then migrate. Unlocks
   the type system, control flow, and expression validation.
2. **Delete it.** Remove the dead validators and the unused parser stack, accept a
   permanent ceiling on detection, and market the extension on what it does well
   (signatures, namespaces, arity, syntax) rather than on type checking.

Carrying both costs maintenance and misleads every future contributor. This is a
product decision, not a technical one — it should be made deliberately.

---

## Known issues

- **`ComprehensiveValidator` throws `ast.body is not iterable`** on valid input.
  Its import was removed from `extension.ts`, so the extension is unaffected, but
  the AST path is unusable until this is fixed.
- **Version namespace confusion.** The package is `0.6.0`; the validator was
  internally versioned `v1.2.0`; the roadmap targets `v2.0.0`. Three schemes for
  one artefact. Recommend collapsing to the package version alone.
- **The reference dataset is a point-in-time scrape** (2025-10-03). Additions since
  are hand-maintained in `MODERN_V6_FUNCTIONS`. A re-crawl is due, and
  `v6/scripts/` is gitignored, so the crawler itself is not in version control.

---

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart, v0.4.0. Consumes `pinescript-v6-validator@0.2.0` from npm — the same engine this extension uses, so the two cannot disagree about a file. |

---

## Next

1. ~~Publish 0.5.1~~ ✅ done, plus 0.6.0.
2. Decide on S3/S4 — the accumulator and lazy-evaluation checks are specified but
   not built. S3 is a heuristic about intent; if its false-positive rate on real
   scripts is not clearly zero it should ship as Information or be dropped.
3. Decide the AST question above.
4. Build the parity measurement harness, so accuracy claims become measurable
   rather than asserted.
5. Re-crawl the v6 reference and un-gitignore `v6/scripts/`.
6. ~~Extract the validation engine~~ ✅ published as `pinescript-v6-validator@0.2.0`.

---

## Repository hygiene

`examples/` is **gitignored**, so nothing new added there can reach the public
repository. Eleven generic sample files committed before that rule remain tracked —
`.gitignore` does not untrack what is already committed, and those are ordinary
samples rather than strategies. The author's actual strategies were removed from
this branch's history.

The CI false-positive gate runs on synthetic fixtures in `test/fixtures/corpus/`.
Those were verified to fail when the original bugs are reintroduced, so the gate is
real without exposing trading logic.

Never move a file from `examples/` into the committed corpus list;
`test/golden-corpus.test.js` asserts against exactly that.
