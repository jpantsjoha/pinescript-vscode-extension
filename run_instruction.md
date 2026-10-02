# Run instructions

Pine Script v6 IDE Tools is a VS Code extension that checks TradingView Pine Script v6 as you type. It ships its own validation engine (`packages/validator`), a command-line checker and an MCP server.

## Prerequisites

| Tool | Version | Source |
|---|---|---|
| Node.js | 22 (CI also runs 24) | `.nvmrc`, `.github/workflows/ci.yml` |
| npm | the one bundled with Node | `package-lock.json` |
| VS Code | `^1.88.0`, to run the extension | `engines.vscode` in `package.json` |

`@vscode/vsce` (packaging) and TypeScript are dev dependencies. No global install is needed.

## Setup

```bash
git clone https://github.com/jpantsjoha/pinescript-vscode-extension.git
cd pinescript-vscode-extension
nvm use             # reads .nvmrc
npm ci
npm run hooks:install   # optional: pre-commit gate (see below)
```

## Configuration

No secrets. These variables are optional and affect tests only.

| Variable | Used for |
|---|---|
| `SKIP_PACKAGE_TEST` | Set to `1` to skip the packed-tarball suite (`npm run test:fast` sets it). |
| `CHROMIUM_PATH` | Browser binary for the scripts that use Playwright. |
| `PINE_WATCH_ROOT`, `WATCH_SMOKE_TIMEOUT_MS`, `PINE_WATCH_FAIL_SWAP` | `scripts/watch-smoke.js` only. |

## Build

```bash
npm run build       # compiles packages/validator and the extension, copies the engine to dist/engine/
mkdir -p build      # the package step writes here and needs the folder to exist
npm run package     # writes build/pinescript-v6-extension-<version>.vsix
npm run verify:vsix # checks a built VSIX; takes the .vsix path: node scripts/verify-vsix.js build/*.vsix
```

## Run locally

- Headless check of a file: `node validate-cli.js examples/mysample.v6.pine`. It exits non-zero on errors.
- In VS Code: open the folder and press `F5` for the Extension Development Host (`docs/guides/CONTRIBUTING.md`). The repository tracks no launch configuration, so create one of type `extensionHost` if VS Code asks. Or install the built package with `code --install-extension build/pinescript-v6-extension-<version>.vsix`.
- Rebuild on change: `npm run watch`.
- MCP server: `node mcp/pinescript-mcp-server.js`. See `mcp/README.md`.

## Test

```bash
npm test                # builds, then runs node --test test/*.test.js
npm run test:fast       # same, without the packed-tarball suite
npm run test:regression # regression corpus only
npm run test:package    # packs the engine, installs it in a scratch project, runs it
node test/v0.4.0-self-test.js
node scripts/watch-smoke.js
```

Everything runs offline once `npm ci` has finished. `docs/guides/TESTING-GUIDE.md` explains each suite.

## Lint and typecheck

```bash
npm run typecheck   # tsc on the validator and the extension
npm run lint        # typecheck, then scripts/audit.js (harness, packaging, version, coverage)
```

## Deploy

See `docs/guides/RELEASE-RUNBOOK.md`.

## Project layout

- `src/` extension source (`extension.ts`, `engine.ts` bridge, providers)
- `packages/validator/` the validation engine, published to npm as `pinescript-v6-validator`
- `dist/` build output (`dist/engine/` is the engine the VSIX ships)
- `test/` node test files, golden corpus and regression corpus
- `examples/` sample `.pine` files (`test-plot-parsing.pine` and `test-validation.pine` contain deliberate errors)
- `syntaxes/`, `language-configuration.json` highlighting and language config
- `mcp/` MCP server; `validate-cli.js` command-line checker
- `scripts/` audit, watch, VSIX verification, hooks

## Verified

Verified 2026-10-02 at b81aa3d on macOS with Node 26.0.0 (CI pins 22 and 24) and npm: install ✓ (`npm ci`), build ✓, `npm test` 833 passed, 0 failed, 0 skipped, `npm run lint` 36 pass, 0 warn, 0 fail, `npm run package` ✓ (VSIX, 36 files), `verify:vsix` PASS, `scripts/watch-smoke.js` PASS, `test/v0.4.0-self-test.js` exit 0. Not run: the extension inside VS Code.
