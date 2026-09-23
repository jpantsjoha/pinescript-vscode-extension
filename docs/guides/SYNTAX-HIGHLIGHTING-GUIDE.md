# Pine Script Syntax Highlighting

The extension ships one grammar: `syntaxes/pine.tmLanguage.json` (TextMate format,
scope `source.pine`), paired with `language-configuration.json` for brackets,
comments and auto-closing pairs. There is no separate highlighting source — every
claim below is verified against those two files directly. Re-read them before
editing this guide; the counts here will drift the moment the grammar changes.

---

## What gets highlighted

The grammar's top-level `patterns` array has 15 categories, tried in this order at
each position in the file: annotations, comments, strings, numbers, booleans,
keywords, storage, types, constants, operators, function declarations, function
calls, method calls, namespaces, variables.

### Annotations
Only three are recognized: `//@version`, `//@strategy_alert_message`,
`//@description`. Anything else starting `//@` highlights as a plain comment.

```pine
//@version=6
//@description This is my strategy
```

### Comments
`//` to end of line, and `/* ... */` block comments.

### Strings
Double- and single-quoted. Double-quoted strings recognize
`\" \\ \/ \b \f \n \r \t \uXXXX` as valid escapes and flag anything else
(`\q`, for example) as an illegal escape. Single-quoted strings recognize the same
escape set but have no illegal-escape catch-all.

### Numbers
Integers, floats (`3.14`, `.5`), scientific notation (`1.5e10`), and hex (`0xFF00AA`).

### Booleans and `na`
`true`, `false`, `na`.

---

## Keywords, storage and types

19 keywords across six groups:

| Group | Keywords |
|---|---|
| Conditional | `if` `else` `switch` `case` `default` |
| Loop | `for` `while` `break` `continue` |
| Flow | `return` |
| Import | `import` `export` `as` |
| Logical | `and` `or` `not` |
| Other | `method` `type` `enum` |

6 storage keywords: `var` `varip` (declaration) and `const` `simple` `series`
`input` (type modifiers).

17 types: 5 primitive (`int` `float` `bool` `string` `color`), 10 object
(`line` `label` `box` `table` `array` `matrix` `map` `polyline` `footprint`
`volume_row`), 2 special (`void` `na`).

---

## Namespaces

20 identifiers get dedicated namespace coloring when they appear directly before a
dot: `ta` `math` `input` `request` `str` `color` `array` `matrix` `map`
`strategy` `syminfo` `barstate` `timeframe` `chart` `label` `line` `box` `table`
`ticker` `runtime`. `polyline` is a recognized **type**, not a namespace — it has no
`polyline.` highlighting rule.

---

## Method calls (namespace + function)

A namespaced call gets its own scope (`entity.name.function.<ns>.pine`) **only**
when the function name is immediately followed by `(`. A bare property reference
like `ta.vwap` with no parentheses falls back to plain namespace + variable
coloring, not the dedicated function color.

| Namespace | Functions recognized |
|---|---|
| `ta.` | 50 |
| `array.` | 41 |
| `matrix.` | 40 |
| `math.` | 24 |
| `box.` | 28 |
| `label.` | 25 |
| `line.` | 22 |
| `str.` | 15 |
| `table.` | 15 |
| `strategy.` | 13 |
| `input.` | 12 |
| `request.` | 9 |
| `ticker.` | 9 |
| `color.` | 7 |
| `timeframe.` | 2 (`in_seconds`, `from_seconds`) |

Calling an unlisted function on one of these namespaces — a new `ta.*` function
TradingView shipped after this grammar was last touched, for example — still
highlights: it falls through to plain namespace coloring for the prefix and
generic identifier coloring for the function name, just without the dedicated
per-namespace function color.

---

## Function calls outside a namespace

Two groups get their own scope without a namespace prefix:

- **Plot-family** (`entity.name.function.plot.pine`, 15 total): `plot` `plotshape`
  `plotchar` `plotarrow` `plotbar` `plotcandle` `hline` `fill` `bgcolor`
  `label.new` `line.new` `box.new` `table.new` `alertcondition` `alert`.
- **Generic built-ins** (`support.function.builtin.pine`, 27 total): `nz` `na`
  `log` `log10` `exp` `sqrt` `pow` `abs` `min` `max` `avg` `sum` `sign` `ceil`
  `floor` `round` `timestamp` `time` `year` `month` `weekofyear` `dayofmonth`
  `dayofweek` `hour` `minute` `second` `timenow`.

`indicator(`, `strategy(`, `library(` get a third scope,
`entity.name.function.builtin.pine`, distinct from user-defined function
declarations (any identifier at line start followed by `(`).

---

## Constants

| Category | Count | Examples |
|---|---|---|
| `color.*` | 18 | `red` `green` `blue` `orange` `aqua` `fuchsia` |
| `strategy.*` | 11 | `long` `short` `fixed` `percent_of_equity` `commission.percent` |
| `location.*` | 5 | `absolute` `abovebar` `belowbar` `top` `bottom` |
| `shape.*` | 12 | `xcross` `triangleup` `arrowdown` `diamond` |
| `plot.style_*` | 9 | `line` `histogram` `area` `columns` `circles` |
| `line.style_*` / `hline.style_*` | 3 styles × 2 namespaces | `solid` `dotted` `dashed` |
| `format.*` | 5 | `price` `volume` `percent` `mintick` |
| `scale.*` | 3 | `right` `left` `none` |
| `display.*` | 5 | `all` `none` `data_window` |
| `barmerge.*` | 4 | `gaps_off` `gaps_on` `lookahead_on` |
| `alert.freq_*` | 3 | `once_per_bar` `once_per_bar_close` `all` |

`na` also matches the `types` category's special-values rule (`void|na`), which is
checked before `constants` in the top-level pattern order — so it always resolves
to `support.type.special.pine`, not `constant.language.na.pine`.

---

## Operators

Assignment (`=` `:=`), comparison (`==` `!=` `<=` `>=` `<` `>`), arithmetic
(`+` `-` `*` `/` `%`), ternary (`?` `:`), arrow (`=>`).

---

## Customizing colors

Grammar scopes are real TextMate scope names and work with any theme customization:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [
    { "scope": "support.namespace.ta.pine", "settings": { "foreground": "#00D9FF" } },
    { "scope": "entity.name.function.ta.pine", "settings": { "foreground": "#FFD700" } }
  ]
}
```

---

## Testing a grammar change

1. `code .` then press F5 to launch the Extension Development Host.
2. Open a `.pine` file — anything under `test/fixtures/corpus/` works, or your own
   script (`examples/` is gitignored and local-only).
3. Try more than one theme; a scope that looks right in Dark+ can be invisible in
   a light theme if the theme doesn't map that scope.

---

## Related

- `language-configuration.json` — brackets, line comment, auto-closing/surrounding pairs
- `docs/PINESCRIPT-V6-SYNTAX-RULES.md` — language rules the *validator* enforces (this guide only covers what gets colored)
