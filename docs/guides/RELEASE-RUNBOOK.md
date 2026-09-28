# Release runbook — pinescript-vscode-extension

Operational detail for the release operator (JP). Despite an earlier "gitignored"
note here, the file is tracked and public — it names only where credentials live
(keychain, GitHub secret), never a credential value, so that is safe.
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
npm test          # all pass, 0 fail — the count itself drifts, don't hardcode it
npm run audit     # 0 fail; WARNs are advisory (currently: README version mention, v6 data currency)
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

### 4. Build and inspect every artefact from a clean export

```bash
node scripts/inspect-artefacts.js --out-dir /tmp/inspect-X.Y.Z   # outside iCloud
```

A release ships two artefacts: the VSIX (Marketplace, Open VSX, GitHub release) and,
when `packages/validator` is bumped, the engine tarball (npm). `inspect-artefacts`
exports the candidate commit with `git archive` into a fresh directory outside
iCloud (it refuses any path containing "Mobile Documents"), builds both there, and
for each one:

- lists it against the exact expected set (`verify-vsix`'s allowlist; the engine's
  `check-pack` list) and fails on sync-conflict names (`index 2.js`), dotfiles,
  TypeScript sources, source maps, tests and fixtures;
- prints file count, size and SHA-256;
- compares it with the previous release's **published** artefact (the GitHub release
  VSIX, npm's tarball) and FLAGs a size change over 10% or any file added or removed;
- runs it: the VSIX's packaged `activate()` (`verify-vsix`), the engine tarball
  installed by name against the regression corpus.

Paste `inspection.md` into the release PR. Keep `inspection.json`: step 8 compares
what went live against it. A FAIL blocks the release. A FLAG does not, but each one
needs a written answer in the reflection (step 5).

`verify-vsix` alone still runs in CI after packaging; inspecting the file list is not
enough on its own — a `.vscodeignore` rule excluding something loaded at runtime
builds and installs fine and dies on activation, which is why each artefact is run.

### 5. Pre-go-live reflection

Answer the [reflection](#pre-go-live-reflection) in writing in the release PR,
before the tag. The independent reviewer checks the answers against the inspection
and the diff; an unanswered question or an unexplained FLAG is a finding.

### 6. Privacy check

```bash
git ls-tree -r HEAD --name-only examples/          # generic samples only
git grep -l "JP-MMG\|MmtDirGold\|MomDirGold\|PersonalTrader" HEAD -- .   # expect none
gh pr view <N> --json files --jq '.files[].path' | grep '\.pine$'        # fixtures only
```

`examples/` is gitignored, so nothing new there can reach the public repo. Eleven
generic samples committed before that rule remain tracked — `.gitignore` does not
untrack what is already committed.

### 7. Merge, tag, publish

```bash
gh pr merge <N> --squash
git checkout main && git pull
# re-run step 1 on main
git tag -a vX.Y.Z -m "..." && git push origin vX.Y.Z
```

**Pushing the tag is the release.** `publish.yml` fires `vsce publish` on any
`v*.*.*`. It is not a dry run.

**Engine (npm), when `packages/validator` was bumped.** Never `npm publish` from the
working tree — 0.4.2 shipped 22 iCloud conflict copies that way (#67).

```bash
scripts/publish-engine.sh             # dry run: clean export, build, check-pack, file list, corpus
scripts/publish-engine.sh --publish   # the same, then npm publish of THAT tarball (npm 2FA prompt)
```

The script refuses a dirty tree or a HEAD not on `origin/main`, packs from a
`git archive` export under `$TMPDIR`, prints every file, the count (25 for 0.4.3) and
the SHA-256, and runs the regression corpus against the tarball installed by name.
`packages/validator`'s `prepack` runs `scripts/check-pack.js`, so even a manual
`npm pack` or `npm publish` refuses a dist with anything beyond the expected files.

### 8. Confirm it actually landed — and that it is what was inspected

```bash
node scripts/verify-published.js X.Y.Z --engine A.B.C --pre /tmp/inspect-X.Y.Z/inspection.json
```

`verify-published` downloads what went live — the GitHub release VSIX, the Open VSX
file, the Marketplace VSIX (optional; the version is confirmed through the
extensionquery API either way) and npm's tarball — re-runs the same inspection
against an export of the tag, and compares file lists and per-file SHA-256 across
channels and with the pre-release inspection (the engine tarball's archive SHA-256
too: `publish-engine.sh` uploads the very tarball it inspected). Any mismatch exits
non-zero. Record the result in the release PR and STATUS; any incident gets an issue
and a guard before the next release.

A green workflow is not proof. An uploaded version sits in **validation** before it
goes public — `vsce publish` will say "already exists" while the gallery still
serves the previous version. That state is normal and resolves in 5–15 minutes;
re-run `verify-published` once it clears.

---

## Pre-go-live reflection

Copy into the release PR (the same block is in
[docs/templates/release-reflection.md](../templates/release-reflection.md)) and answer
in writing before the tag. The independent reviewer checks each answer against the
diff and the artefact inspection.

```markdown
### Pre-go-live reflection — vX.Y.Z (engine A.B.C)

1. **What changed since the last release?** (user-visible, engine, build, release tooling)
2. **Which path builds each artefact, and is any step manual?**
   VSIX: CI (`publish.yml`) from the tag / local. Engine: `scripts/publish-engine.sh` from a clean export / other.
3. **What could make the shipped artefact differ from what was tested?**
   Build location (synced folder, working tree), stale output, dependency drift, registry behaviour.
4. **Did the artefact inspection show any unexpected file, size or count change — and why?**
   Answer every FLAG in `inspection.md` by name.
5. **Which incidents from previous releases are now guarded, and by what?**
   - 0.6.5 publish — a missing registry token could leave a split release (Marketplace live, Open VSX behind): `publish.yml` checks both tokens before publishing anything.
   - 0.7.0 test race (#64) — `npm-package.test.js` rebuilt the shared engine dist while parallel test files loaded it: the test now builds and packs an isolated copy.
   - engine 0.4.2 iCloud copies (#67) — published from the working tree with 22 conflict copies: `check-pack` (prepack + test), `publish-engine.sh`, `inspect-artefacts`, `verify-published`.
   - (add this release's new guards)
6. **What is the rollback?** VSIX: re-publish the previous tag's code as a new patch
   version (the Marketplace does not roll back). Engine: `npm deprecate` the bad
   version with a message, then publish a fixed patch; consumers pin with `^`.
7. **After go-live:** `verify-published` result (PASS/FAIL, link), and the issue number
   for any incident, with the guard that will exist before the next release.
```

### Worked example — engine 0.4.2 (published 2026-09-28), answered after the fact

1. **What changed?** The npm engine caught up with the 0.7.0 extension (#54): one
   engine, the invalid-cast rule, 135 regression cases.
2. **Which path built it?** Manual: `npm publish` from `packages/validator` in the
   iCloud working tree. No script, no clean export.
3. **What could make it differ from what was tested?** The build location. `files:
   ["dist"]` packs everything under `dist/`, and iCloud re-created `* 2.*` conflict
   copies after the build's `rm -rf`. The tests loaded `index.js` and never saw them.
4. **Unexpected files?** Nobody inspected the tarball. It held 47 files where 25 were
   intended (+22, 228.3 KB vs 131.3 KB for a clean build), among them
   `dist/src/accurateValidator 2.js`, a stale validator. The entry point never loads
   the copies, so installed from npm it still passes 135/135 regression cases — right
   behaviour, wrong contents.
5. **Guarded now?** Not then. Since #67: `check-pack` fails `npm pack`/`npm publish`
   and `npm-package.test.js` on any file outside the derived set; `publish-engine.sh`
   packs only from a `git archive` export outside iCloud; `inspect-artefacts` flags
   the 22 as files removed versus 0.4.2; `verify-published --engine 0.4.2` reports
   the 22 extra files and exits 1.
6. **Rollback?** Publish 0.4.3 from the clean path, deprecate 0.4.2, bump
   pinescript-plugin to `^0.4.3`.
7. **After go-live:** the incident became #67; this reflection and the guards above
   are its fix.

---

## Failures seen, and what they actually were

| Symptom | Real cause |
|---|---|
| `Failed request: (401)` from CI | `VSCE_PAT` set 2025-10-05, expired. The *local* PAT verified fine — the secret was the only stale thing. |
| "Extension still shows old warnings after installing the VSIX" | 0.4.4 and 0.5.0 both present in `~/.vscode/extensions/`; the host kept serving the old one. Remove the stale directory **and reload the window** — the reload is what matters. |
| `vsce publish` → "already exists", gallery unchanged | Uploaded, pending marketplace validation. Not an error. |
| Local tests green, CI red | Stray `node_modules/vscode` stub masking a real missing-module failure. |
| v0.7.0 publish run failed at "Run tests" (`Cannot read properties of undefined (reading 'request.security')`); the re-run passed | `npm-package.test.js` rebuilt `packages/validator/dist` while parallel test files loaded it (#64). The test now builds an isolated copy. |
| npm 0.4.2: 47 files, 25 intended; behaviour correct | Published from the iCloud working tree; `files: ["dist"]` packed 22 conflict copies (#67). `check-pack` (prepack), `publish-engine.sh`, `inspect-artefacts`, `verify-published`. |

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
