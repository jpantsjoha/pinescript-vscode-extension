# Project Status

**Updated**: 2026-08-07
**Working version**: 0.5.0 (unreleased — tagged, not yet published)
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
| `npm test` | 112/112 pass |
| Golden corpus (13 TradingView-verified scripts) | 0 errors |
| Validation speed, 1,302-line script | 12.3ms (budget: 100ms) |
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

Four validators exist. **One ships.**

```
src/parser/
  accurateValidator.ts       846 LOC   ← the only one the extension runs
  comprehensiveValidator.ts 1126 LOC   ← imported by extension.ts, never called, CRASHES
  validator.ts               373 LOC   ← imported, never called
  parser.ts / ast.ts / lexer.ts / typeSystem.ts / symbolTable.ts
                            ~2000 LOC  ← feeds only the dead path
```

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
  The extension is unaffected (it never calls it), but the AST path is unusable
  until this is fixed.
- **Version namespace confusion.** The package is `0.5.0`; the validator was
  internally versioned `v1.2.0`; the roadmap targets `v2.0.0`. Three schemes for
  one artefact. Recommend collapsing to the package version alone.
- **The reference dataset is a point-in-time scrape** (2025-10-03). Additions since
  are hand-maintained in `MODERN_V6_FUNCTIONS`. A re-crawl is due, and
  `v6/scripts/` is gitignored, so the crawler itself is not in version control.

---

## Next

1. Publish 0.5.0 — ten months of fixes are sitting idle.
2. Decide the AST question above.
3. Build the parity measurement harness, so accuracy claims become measurable
   rather than asserted.
4. Re-crawl the v6 reference and un-gitignore `v6/scripts/`.
