# Release runbook — pinescript-vscode-extension

**Gitignored.** Operational detail, not public documentation.
Last exercised: 2026-08-07, v0.4.4 → v0.5.1.

---

## Credentials

**Never in the repo.** A `.env` holding `VSCODE_PUBLISH_PAT` was found in the
project directory on 2026-08-07 — never committed, but this repo is public and that
is one `git add -A` from a leak.

| Where | What |
|---|---|
| macOS keychain | `vsce-publish-pat` — preferred |
| `~/.config/vscode-publishing/publish.env` | mode 600 fallback |
| GitHub secret `VSCE_PAT` | used by `publish.yml` |

Load for a manual publish:

```bash
export VSCE_PAT="$(security find-generic-password -a "$USER" -s vsce-publish-pat -w)"
```

**Never echo the value.** Verify without publishing:

```bash
npx @vscode/vsce verify-pat jpantsjoha -p "$VSCE_PAT"
```

Azure DevOps PATs expire within a year. `gh secret list` shows when `VSCE_PAT` was
last set — check that **before** blaming code for a 401.

Generic publishing procedure lives in the global skill
`~/.claude/skills/vscode-extension-publisher/`, so it applies to every extension.
This file holds only what is specific to this repo.

---

## Release sequence

### 1. Pre-flight — clean room, not an incremental build

```bash
rm -rf dist node_modules/vscode
npm ci && npm run build
npx tsc --noEmit
npm test          # 125 tests
npm run audit     # 19 pass · 1 warn · 0 fail
```

`rm -rf node_modules/vscode` is not optional. A stray stub there once made the
suite pass locally while CI failed with `Cannot find module 'vscode'` — local runs
were meaningless until it was removed.

### 2. Prove the gate still detects regressions

A green suite proves nothing unless the tests can fail. Reintroduce each bug class
into `dist/` and confirm failures, then restore:

| Sabotage | Expected failures |
|---|---|
| Delete `box.new`/`line.new`/`label.new` from the manual signatures | 5 |
| Replace `splitTopLevel` with `String.split(',')` in documentChecks | 2 |
| Revert `blankComments(blankStrings(text))` to `blankStrings(text)` | 3 |
| Make `removeStringLiterals` collapse to `""` | 1 |

### 3. Version consistency

Four places must agree: `package.json`, `CHANGELOG.md`, `README.md`, git tag.
`npm run audit` checks this.

### 4. Package and **execute** the packaged code

```bash
rm -f build/*.vsix && npx @vscode/vsce package --out build/
unzip -q build/*.vsix -d /tmp/vsix-check
```

Then stub `vscode` inside the extracted copy and run the validator against
`test/fixtures/corpus/`. Inspecting the file list is not enough — the failure this
catches is a `.vscodeignore` rule excluding something loaded at runtime, which
builds and installs fine and dies on activation.

### 5. Privacy check

```bash
git ls-tree -r HEAD --name-only examples/          # generic samples only
git grep -l "JP-MMG\|MmtDirGold\|MomDirGold\|PersonalTrader" HEAD -- .   # expect none
gh pr view <N> --json files --jq '.files[].path' | grep '\.pine$'        # fixtures only
```

`examples/` is gitignored, so nothing new there can reach the public repo. Eleven
generic samples committed before that rule remain tracked — `.gitignore` does not
untrack what is already committed.

### 6. Merge, tag, publish

```bash
gh pr merge <N> --squash
git checkout main && git pull
# re-run step 1 on main
git tag -a v0.5.1 -m "..." && git push origin v0.5.1
```

**Pushing the tag is the release.** `publish.yml` fires `vsce publish` on any
`v*.*.*`. It is not a dry run.

### 7. Confirm it actually landed

```bash
curl -s -X POST "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery" \
  -H "Accept: application/json;api-version=7.2-preview.1" -H "Content-Type: application/json" \
  -d '{"filters":[{"criteria":[{"filterType":7,"value":"jpantsjoha.pinescript-v6-extension"}]}],"flags":914}' \
  | python3 -c "import json,sys;x=json.load(sys.stdin)['results'][0]['extensions'][0];print(x['versions'][0]['version'],x['versions'][0]['lastUpdated'][:10])"
```

A green workflow is not proof. An uploaded version sits in **validation** before it
goes public — `vsce publish` will say "already exists" while the gallery still
serves the previous version. That state is normal and resolves in 5–15 minutes.

---

## Failures seen, and what they actually were

| Symptom | Real cause |
|---|---|
| `Failed request: (401)` from CI | `VSCE_PAT` set 2025-10-05, expired. The *local* PAT verified fine — the secret was the only stale thing. |
| "Extension still shows old warnings after installing the VSIX" | 0.4.4 and 0.5.0 both present in `~/.vscode/extensions/`; the host kept serving the old one. Remove the stale directory **and reload the window** — the reload is what matters. |
| `vsce publish` → "already exists", gallery unchanged | Uploaded, pending marketplace validation. Not an error. |
| Local tests green, CI red | Stray `node_modules/vscode` stub masking a real missing-module failure. |

---

## Standing rules

1. **A false positive is worse than a missed error.** Prove every validation change
   in both directions. No "still flags" test means the rule does not ship.
2. **Never declare a component the package does not ship.** Broken npm script
   targets, an MCP server requiring a zero-byte file, an `mcp.json` pointing at a
   nonexistent server — the same defect three times in one session.
3. **Green locally is not evidence.** CI is the signal.
4. **Diagnostics come from more than one module.** Any new source must reach
   `validate-cli.js` *and* the golden corpus; `scripts/audit.js` fails otherwise.
5. **The author's strategies never enter a public repo.** The CI corpus is
   synthetic and proven to catch the same defects.

---

## Related

- `~/.claude/skills/vscode-extension-publisher/` — generic publishing skill
- `~/local/pinescript-plugin/_plugin/planning/RELEASE-PROCESS.md` — three-artefact
  release order and the engine-distribution decision
- `STATUS.md` (tracked) — public-facing state and roadmap reconciliation
