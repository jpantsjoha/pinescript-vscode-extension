<!--
  Pre-go-live reflection: copy into the release PR and answer in writing before the
  tag. The independent reviewer checks each answer against the diff and the
  artefact inspection (scripts/inspect-artefacts.js). Procedure and a worked
  example: docs/guides/RELEASE-RUNBOOK.md, "Pre-go-live reflection".
-->

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
