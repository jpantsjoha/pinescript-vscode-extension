# pinescript-v6-validator

TradingView **Pine Script v6** validator and reference dataset — the engine behind
the [Pine Script v6 IDE Tools](https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension)
VS Code extension (1,400+ installs).

No `vscode` dependency, so the same engine runs in an editor, in CI, in a headless
CLI, and inside an MCP server. One engine means an agent and your editor cannot
disagree about a file.

## Install

```bash
npm install pinescript-v6-validator
```

## Use

```js
const { validatePineScript } = require('pinescript-v6-validator');

const errors = validatePineScript(source);
// [{ line, column, length, message, severity }]  severity: 0=error 1=warning
```

Run **all** diagnostic sources via `validatePineScript`. Calling `AccurateValidator`
alone misses the whole-document checks, which is how a "clean" verdict once
appeared on files the editor was marking with errors.

```js
const { PINE_FUNCTIONS_MERGED } = require('pinescript-v6-validator');

PINE_FUNCTIONS_MERGED['line.new'].overloads;
// Both official call forms: (first_point, second_point, …) and (x1, y1, x2, y2, …)
```

## What it catches

- **Overloaded constructors.** `line.new`, `label.new` and `box.new` each accept a
  `chart.point` *or* independent coordinates. A call is valid if it satisfies
  **any** overload — flattening them is what made correct code look broken.
- Wrong parameter names — `colour` for `color`, `shape=` for `style=`,
  `textalign` where `text_halign` belongs
- Arity errors, with balanced-paren argument counting
- Undefined namespaces, variables and functions; user-defined `type`/`enum`
- Multiline strings (`"""…"""`), `for…in` iterators, wrapped calls containing
  comments or blank lines

## What it does not do

No AST, so no type inference. It is a fast line-based checker, not a compiler —
roughly 12ms for a 1,300-line script.

## Currency

The dataset is a point-in-time scrape of the official v6 reference
(2025-10-03) plus a hand-maintained layer covering everything TradingView shipped
since, through July 2026: `request.footprint()`, multiline strings, `sort_field`,
`active` on inputs, `timeframe_bars_back`, `calc_on_every_history_tick`,
`syminfo.isin`, `box.set_xloc()`.

Rules get **removed** too — the December 2025 release dropped wrapped-line
indentation restrictions, and this reflects that.

## Related

- [pinescript-vscode-extension](https://github.com/jpantsjoha/pinescript-vscode-extension) — the VS Code extension
- [pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) — agent skills and MCP server built on this

## License

MIT © [Jaroslav Pantsjoha](https://jpantsjoha.com)
