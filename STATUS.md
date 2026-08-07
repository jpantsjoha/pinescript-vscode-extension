# Project Status

**Updated**: 2026-08-07
**Working version**: 0.5.1 (tagged, not yet published)
**Marketplace version**: 0.4.4, published 2025-10-07
**Installs**: 1,403 · **Rating**: 4.45★

---

## Where this stands

The extension works and has real users. Until this release it had been ten months
since a publish, and the working tree carried a regression that put ten false
errors on the most common drawing idiom in Pine. That is fixed, proven by tests,
and the gate that should have caught it now exists.

| Signal | State |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm test` | 117/117 pass |
| `npm run audit` | 17 pass · 1 warn · 0 fail |
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
| 3. Execution model (`var` / `:=`) | 🟡 MEDIUM | ❌ Not started |
| 4. Type system | 🔴 HIGH | ⛔ **Blocked** — needs the AST path repaired |
| 5. Control flow syntax | 🟡 MEDIUM | ⛔ Blocked (same) |
| 6. Expression parsing | 🟢 LOW | ⛔ Blocked (same) |
| 7. Platform limits | 🟢 LOW | ❌ Not started |
| 8. Anti-repainting | 🟡 MEDIUM | ❌ Not started |

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

Four validators exist. **Two ship.**

```
src/parser/
  accurateValidator.ts       ~900 LOC  ← ships
  documentChecks.ts          ~220 LOC  ← ships (whole-document heuristics)
  comprehensiveValidator.ts 1126 LOC   ← DEAD. Import removed. Crashes on valid input.
  validator.ts               373 LOC   ← DEAD. Import removed.
  parser.ts / ast.ts / lexer.ts / typeSystem.ts / symbolTable.ts
                            ~2000 LOC  ← feeds only the dead path
```

Both shipping sources are wired into `validate-cli.js` and the golden corpus, and
`scripts/audit.js` fails the build if a new one is not. That guard exists because
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
- **Version namespace confusion.** The package is `0.5.1`; the validator was
  internally versioned `v1.2.0`; the roadmap targets `v2.0.0`. Three schemes for
  one artefact. Recommend collapsing to the package version alone.
- **The reference dataset is a point-in-time scrape** (2025-10-03). Additions since
  are hand-maintained in `MODERN_V6_FUNCTIONS`. A re-crawl is due, and
  `v6/scripts/` is gitignored, so the crawler itself is not in version control.

---

## Related projects

| Project | Relationship |
|---|---|
| [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | Agent-facing counterpart. Will consume the validation engine from this repo rather than copying it — a copy guarantees drift, and drift means the plugin contradicts the editor. Engine extraction is Phase 0 of that work. |

---

## Next

1. Publish 0.5.1 — ten months of fixes are sitting idle.
2. Decide the AST question above.
3. Build the parity measurement harness, so accuracy claims become measurable
   rather than asserted.
4. Re-crawl the v6 reference and un-gitignore `v6/scripts/`.
5. Extract the validation engine so `pinescript-plugin` can consume it. The only
   coupling to `vscode` is the `DiagnosticSeverity` enum (three references, all
   plain integers), so this is far cheaper than it looks.

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
