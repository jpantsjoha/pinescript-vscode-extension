# Validator fixes + headless CLI — 2026-06-08

Ground-truthed against a **known-good** Pine v6 script that compiles and runs live on
TradingView. Before these fixes `AccurateValidator` reported **4 false-positive
errors** on it; after, it reports **0**. The equivalent constructs are now covered by
the committed corpus in `test/fixtures/corpus/`.

## New: `validate-cli.js` (repo root)

Single headless entrypoint, suitable for agents / CI. Uses **`AccurateValidator`** by
default — the same validator the VS Code extension runs, so CLI output matches the in-editor
read.

```bash
node validate-cli.js <file.pine> [more.pine ...]   # default: AccurateValidator
node validate-cli.js --comprehensive <file.pine>   # ComprehensiveValidator (MCP path)
node validate-cli.js --both <file.pine>            # diff the two
```

Exit 0 if no severity-0 errors, else 1. Per-validator crashes are caught and reported as a
synthetic error rather than aborting the run. (Note: the npm script `qa:pinescript` points at
a root `qa-validate-pinescript.js` that does not exist — it lives under `dev-tools/testing/`.
`validate-cli.js` supersedes it for headless use.)

## Fixes applied

### 1. `AccurateValidator` — balanced-paren argument extraction  *(highest impact)*
`validateFunctionCall` matched args with `\(([^)]*)\)`, which stops at the **first** inner
`)`. Any call with nested parens in an argument was truncated and under-counted, e.g.
`ta.ema(demax_av / (demax_av + demin_av) * 100, 3)` parsed as **1** arg → false
"Missing required parameter 'length'". Replaced with a depth- and string-aware
`extractBalancedArgs()` scan; multi-line calls (unbalanced on the line) return `null` and
skip count validation (no false error). *File: `src/parser/accurateValidator.ts`.*

### 2. `AccurateValidator` — user-defined types / enums
`type Foo` / `enum Bar` were never collected, so `Foo.new(...)` and field access were flagged
"Undefined namespace or variable 'Foo'". Added a `declaredTypes` set populated in the first
pass and honoured in `checkUndefinedNamespaces`. *File: `src/parser/accurateValidator.ts`.*

### 3. Signature data — `ta.pivothigh` / `ta.pivotlow`
The generated data only had the 2-arg overload `(leftbars, rightbars)`, so the valid 3-arg
overload `(source, leftbars, rightbars)` false-flagged "too many arguments". Added correct
manual overrides (2 required + 1 optional `source` = max 3). *File: `v6/parameter-requirements.ts`
(MANUAL overrides GENERATED in the merge).*

## Known remaining issue (not yet fixed)

- **`ComprehensiveValidator` throws `TypeError: ast.body is not iterable`** on valid input —
  i.e. the **MCP server path** (`mcp/*` → `test-comprehensive-validator.js` → ComprehensiveValidator)
  is broken for at least some files. The VS Code extension is unaffected (it uses
  AccurateValidator). Recommend: reconcile the two validators (extension vs MCP should use the
  same engine) and guard `parse()` to always return an AST with an iterable `body`.

## Rebuild note

`dist/` was rebuilt with `npm run build`. The machine was under heavy memory pressure
(CRIT swap thrash) at the time, so tsc was very slow — not a code problem. Re-run
`npm run build` on a healthy machine to be safe before packaging.

## Verification

```
node validate-cli.js test/fixtures/corpus/drawing-objects.pine    # 0 issues
node validate-cli.js test/fixtures/corpus/syntax-surface.pine     # 0 issues  (was 4 FPs)
```
