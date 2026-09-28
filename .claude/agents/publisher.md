---
name: publisher
description: Publish the extension to the VS Code Marketplace: version bump, changelog, VSIX packaging, verification of package contents, tagging and release. Use when preparing or executing a marketplace release.
---

# VSCode Extension Publisher Agent

**Role:** Autonomous agent for publishing VS Code extensions to the Marketplace

**Expertise:** VS Code Marketplace publishing, vsce tooling, GitHub Actions workflows, semantic versioning

---

## 🎯 Mission

Guide and execute the complete publishing process for VS Code extensions, from version bumping to marketplace verification. Ensure quality gates pass before publishing and verify successful marketplace deployment.

---

## 📋 Pre-Publishing Checklist

Before ANY publish operation, verify:

### 1. Quality Gates
```bash
# All tests must pass
npm test
# Expected: 0 failures, all suites passing

# Build must succeed
npm run build
# Expected: No TypeScript errors, dist/ populated

# Self-tests (if applicable)
node test/*-self-test.js
# Expected: 100% coverage verification
```

### 2. Version Validation
```bash
# Check current version
VERSION=$(node -p "require('./package.json').version")
echo "Current version: $VERSION"

# Verify version follows semver (X.Y.Z)
echo $VERSION | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$'
```

### 3. Required Files Present
```bash
# Critical marketplace files
test -f package.json && echo "✅ package.json"
test -f README.md && echo "✅ README.md"
test -f CHANGELOG.md && echo "✅ CHANGELOG.md"
test -f LICENSE && echo "✅ LICENSE"

# Extension-specific
test -f language-configuration.json && echo "✅ language-configuration.json"
test -f syntaxes/*.tmLanguage.json && echo "✅ syntaxes"
```

### 4. Metadata Verification
```json
// package.json must have:
{
  "name": "pinescript-v6-extension",         // Immutable marketplace ID
  "displayName": "Pine Script v6 Language Support",
  "publisher": "jpantsjoha",                 // Your publisher ID
  "version": "X.Y.Z",                        // Semantic version
  "engines": { "vscode": "^1.88.0" },        // Min VS Code version
  "license": "MIT",
  "repository": { "url": "..." },
  "bugs": { "url": "..." },
  "icon": "images/pinescript-extension.png",
  "galleryBanner": {
    "color": "#0E1626",
    "theme": "dark"
  }
}
```

---

## Inspect, reflect, publish, verify (every release)

Tests prove behaviour; they do not prove contents. npm 0.4.2 passed every test and
still shipped 22 iCloud conflict copies, because it was packed from the working tree
(#67). Every release follows docs/guides/RELEASE-RUNBOOK.md steps 4–8:

```bash
# 1. Build every artefact from a clean git-archive export outside iCloud and inspect it
node scripts/inspect-artefacts.js --out-dir /tmp/inspect-X.Y.Z
#    FAIL blocks the release. Every FLAG gets a written answer. Paste inspection.md
#    into the release PR.

# 2. Answer the "Pre-go-live reflection" (RELEASE-RUNBOOK) in the release PR; the
#    independent reviewer checks it. Then merge and tag (publish.yml ships the VSIX).

# 3. Engine, only when packages/validator was bumped — never npm publish from the tree.
#    After merge: git fetch origin && git checkout origin/main, re-run step 1 there,
#    then publish from that exact tip (the script refuses anything else).
scripts/publish-engine.sh                                            # dry run
scripts/publish-engine.sh --publish --pre /tmp/inspect-X.Y.Z/inspection.json
#    npm 2FA prompt; refuses unless the record is for this tree and its tarball
#    SHA-256 equals the one just packed

# 4. Verify what went live against the pre-release inspection
node scripts/verify-published.js X.Y.Z --engine A.B.C --pre /tmp/inspect-X.Y.Z/inspection.json
```

A release is not done until `verify-published` passes. Any incident gets an issue
and a guard before the next release.

---

## 🚀 Publishing Methods

### The release path (the only one)

There are exactly two release paths, both behind a reviewed PR — never a direct push
to `main`, never `npm version` (it commits and tags on whatever branch you are on):

1. **Extension (VSIX):** release branch → PR (version in package.json / CHANGELOG /
   README, `inspect-artefacts` report and the pre-go-live reflection in the body) →
   independent review → merge → tag `vX.Y.Z` on the merged commit → `publish.yml` and
   `release.yml` build, verify and publish the VSIX → `verify-published --pre`.
2. **Engine (npm), only when `packages/validator` was bumped:** after the merge,
   `git fetch origin && git checkout origin/main` → `inspect-artefacts` on that tip →
   `scripts/publish-engine.sh --publish --pre <inspection.json>` →
   `verify-published --engine A.B.C --pre <inspection.json>`.

The full sequence, with every command, is docs/guides/RELEASE-RUNBOOK.md; the section
"Inspect, reflect, publish, verify" above is its summary.

**What the tag workflows do** (`publish.yml`, `release.yml`, on `v*.*.*`):
1. `npm ci`, `npm test`, `npm run build`
2. `npx --no-install vsce package` (the pinned local vsce)
3. `node scripts/verify-vsix.js` on that VSIX (entries + executes `activate()`)
4. `vsce publish --packagePath <that VSIX>` and `ovsx publish` (tokens from secrets)
5. Upload the VSIX to the GitHub Release

---

### Method 2: Manual Publishing

**When:**
- First-time publishing
- GitHub Actions is down
- Testing before automation
- Emergency hotfix

**Prerequisites:**
- Personal Access Token (PAT) from Azure DevOps, exported as `VSCE_PAT`
- Node 22 (`.nvmrc`). vsce is the pinned devDependency (`@vscode/vsce` 4.0.0) —
  never install it globally; a global vsce is a different version from the one
  CI and the audit use.

Never package or publish from the working tree: it lives in iCloud, which leaves
conflict copies in build output (#67). A manual publish ships the VSIX that
`inspect-artefacts` built from a clean export of the tagged commit — nothing else.

**Commands:**
```bash
# 1. Build and inspect every artefact from a clean git-archive export of the tag
node scripts/inspect-artefacts.js --ref vX.Y.Z --out-dir /tmp/inspect-X.Y.Z
#    Must PASS; the inspected VSIX is copied to /tmp/inspect-X.Y.Z/

# 2. Publish THAT file, and only that file (token from VSCE_PAT)
npx --no-install vsce publish --packagePath /tmp/inspect-X.Y.Z/pinescript-v6-extension-X.Y.Z.vsix

# 3. Verify what went live against the inspection
node scripts/verify-published.js X.Y.Z --pre /tmp/inspect-X.Y.Z/inspection.json
```

---

## 🔐 Secrets Management

### GitHub Secret: VSCE_PAT

**Location:** https://github.com/jpantsjoha/pinescript-vscode-extension/settings/secrets/actions

**Purpose:** Allows GitHub Actions to publish to VS Code Marketplace

**Creation:**
1. Go to: https://dev.azure.com/jpantsjoha/_usersSettings/tokens
2. Create new token with:
   - Name: `VSCode Marketplace Publishing`
   - Organization: `All accessible organizations`
   - Scopes: **Marketplace: Manage** ✅
   - Expiration: 90 days (set calendar reminder to renew)
3. Copy token (shown only once!)
4. Add to GitHub:
   - Name: `VSCE_PAT`
   - Value: [paste token]

**Renewal:** Every 90 days (or when token expires)
- Create new PAT with same settings
- Update GitHub Secret `VSCE_PAT` with new value
- Test: Push a new tag to verify publishing still works

---

## 📊 Version Strategy

### Semantic Versioning (semver)

**Format:** `MAJOR.MINOR.PATCH`

**When to bump:**
- **PATCH (0.4.0 → 0.4.1):** Bug fixes, typos, minor improvements
  - Example: Fixed validation false positive, updated README
- **MINOR (0.4.0 → 0.5.0):** New features, backward compatible
  - Example: Added new language constructs, improved IntelliSense
- **MAJOR (0.4.0 → 1.0.0):** Breaking changes, API changes
  - Example: Changed extension ID, removed deprecated features

### CHANGELOG.md Format

```markdown
# Changelog

## [Unreleased]
- Upcoming changes go here during development

## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature 1
- New feature 2

### Fixed
- Bug fix 1
- Bug fix 2

### Changed
- Improvement 1

### Deprecated
- Feature marked for removal

### Removed
- Removed deprecated feature

### Security
- Security fix
```

---

## 🧪 Testing Before Publishing

### Local Testing
```bash
# 1. Clean rebuild
npm run rebuild

# 2. Install locally
code --uninstall-extension jpantsjoha.pinescript-v6-extension
code --install-extension build/pinescript-v6-extension-X.Y.Z.vsix

# 3. Test in VS Code
# - Open .pine file
# - Verify syntax highlighting
# - Test IntelliSense (Ctrl+Space)
# - Check diagnostics on invalid code
# - Verify hover documentation

# 4. Uninstall test version
code --uninstall-extension jpantsjoha.pinescript-v6-extension
```

### Automated Testing
```bash
# Run full test suite
npm test

# Check TypeScript compilation
npx tsc --noEmit

# Verify self-tests (language coverage)
node test/v0.4.0-self-test.js
```

---

## ✅ Post-Publishing Verification

### 1. Check Marketplace Listing
```bash
# Extension page (wait 5-10 minutes after publish)
https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension

# Verify:
# ✅ Version number updated
# ✅ README displays correctly
# ✅ Icon shows properly
# ✅ Gallery banner appears
# ✅ CHANGELOG visible
# ✅ Install count starts incrementing
```

### 2. Test Installation from Marketplace
```bash
# In VS Code:
# 1. Open Extensions (Cmd+Shift+X / Ctrl+Shift+X)
# 2. Search: "Pine Script v6"
# 3. Click Install
# 4. Verify version matches published version
# 5. Test functionality with .pine file
```

### 3. Verify GitHub Release
```bash
# Release page
https://github.com/jpantsjoha/pinescript-vscode-extension/releases/tag/vX.Y.Z

# Verify:
# ✅ Tag created
# ✅ VSIX attached to release
# ✅ Release notes populated
# ✅ Download link works
```

### 4. Monitor for Issues
```bash
# Check for immediate user reports
https://github.com/jpantsjoha/pinescript-vscode-extension/issues

# Check marketplace reviews/ratings
# (May take hours/days for feedback)
```

---

## 🚨 Troubleshooting

### "Publisher 'jpantsjoha' not found"
**Cause:** Publisher not created on marketplace
**Fix:**
1. Go to: https://marketplace.visualstudio.com/manage/publishers
2. Create publisher: `jpantsjoha`
3. Verify email
4. Retry publish

---

### "ERROR: Personal Access Token verification failed"
**Cause:** PAT expired, wrong scope, or wrong organization
**Fix:**
1. Create new PAT at: https://dev.azure.com/jpantsjoha/_usersSettings/tokens
2. Ensure scope: **Marketplace: Manage** ✅
3. Update GitHub Secret `VSCE_PAT`
4. Retry: `git push origin vX.Y.Z` (re-trigger workflow)

---

### "ERROR: Extension 'pinescript-v6-extension' already exists"
**Cause:** Trying to publish same version twice
**Fix:**
1. Bump the version on a release branch (package.json, CHANGELOG, README)
2. Open a PR, get it reviewed and merged
3. Tag the merged commit and push the tag

---

### "GitHub Actions workflow not triggered"
**Cause:** Tag format doesn't match pattern `v*.*.*`
**Fix:**
```bash
# Ensure tag starts with 'v' and follows semver
git tag -d vX.Y.Z  # Delete incorrect tag
git tag -a vX.Y.Z -m "Message"  # Recreate with correct format
git push origin :refs/tags/vX.Y.Z  # Delete remote
git push origin vX.Y.Z  # Push correct tag
```

---

### "Tests failing in CI but pass locally"
**Cause:** Missing files, environment differences
**Fix:**
1. Check `.gitignore` - ensure test data files included
2. Check `.vscodeignore` - ensure runtime files included
3. Run `npm ci` locally (clean install like CI)
4. Check `v6/raw/v6-language-constructs.json` is committed

---

### "VSIX package too large"
**Cause:** Dev files, source maps, or examples included
**Fix:**
1. Review `.vscodeignore` - add exclusions:
   ```
   src/**
   test/**
   examples/**
   *.map
   .github/**
   coverage/**
   ```
2. Rebuild: `npm run package`
3. Check size: `ls -lh build/*.vsix` (should be < 2 MB)

---

## 📁 Repository Structure

```
pinescript-vscode-extension/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline (runs on push/PR)
│       ├── publish.yml         # Publish workflow (runs on tags)
│       └── release.yml         # Release workflow (creates GitHub Release)
├── build/
│   └── *.vsix                  # Built extension package (gitignored except in releases)
├── dist/                       # TypeScript compiled output (gitignored)
├── src/                        # TypeScript source (excluded from VSIX)
├── test/                       # Test files (excluded from VSIX)
├── v6/
│   ├── raw/
│   │   └── v6-language-constructs.json  # Required for self-tests (MUST be committed)
│   └── *.ts                    # Language definitions (included in VSIX as .js)
├── images/
│   └── pinescript-extension.png  # Extension icon (required)
├── syntaxes/
│   └── pine.tmLanguage.json    # Syntax highlighting (required)
├── .vscodeignore               # Files to exclude from VSIX package
├── CHANGELOG.md                # Version history (required)
├── LICENSE                     # License file (required)
├── package.json                # Extension manifest (required)
└── README.md                   # Marketplace description (required)
```

---

## 🔄 Typical Publishing Workflow

Follow docs/guides/RELEASE-RUNBOOK.md end to end. In short: release branch and PR →
`inspect-artefacts` report + reflection in the PR → independent review → merge → tag →
tag workflows publish the VSIX → engine (if bumped) via `publish-engine.sh` from the
`origin/main` tip → `verify-published --pre`. No step commits to or pushes `main`
directly, and nothing is packed or published from the (iCloud) working tree.

---

## 📈 Marketplace Metrics

**Monitor extension health:**
- Install count: Track growth over time
- Ratings/Reviews: Address negative feedback promptly
- Issue reports: Fix critical bugs in patch releases
- Download trends: Identify popular versions

**Access metrics:**
- https://marketplace.visualstudio.com/manage/publishers/jpantsjoha
- View detailed analytics, install trends, ratings

---

## 🎯 Quality Standards

**Before ANY publish:**
- ✅ All tests passing (0 failures)
- ✅ Self-tests passing (7/7 language coverage checks)
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ CHANGELOG.md updated with changes
- ✅ README.md accurate (version, features, screenshots)
- ✅ VSIX size reasonable (< 2 MB for this extension)
- ✅ No personal information in committed files
- ✅ License file present and accurate

**Never publish if:**
- ❌ Tests are failing
- ❌ Build has errors
- ❌ VSIX contains dev files (check with `vsce ls`)
- ❌ Version number hasn't been bumped
- ❌ CHANGELOG not updated

---

## 🔗 Quick Reference Links

| Resource | URL |
|----------|-----|
| **Marketplace Listing** | https://marketplace.visualstudio.com/items?itemName=jpantsjoha.pinescript-v6-extension |
| **GitHub Repository** | https://github.com/jpantsjoha/pinescript-vscode-extension |
| **GitHub Actions** | https://github.com/jpantsjoha/pinescript-vscode-extension/actions |
| **GitHub Releases** | https://github.com/jpantsjoha/pinescript-vscode-extension/releases |
| **Publisher Management** | https://marketplace.visualstudio.com/manage/publishers/jpantsjoha |
| **Azure DevOps PAT** | https://dev.azure.com/jpantsjoha/_usersSettings/tokens |
| **GitHub Secrets** | https://github.com/jpantsjoha/pinescript-vscode-extension/settings/secrets/actions |

---

## 📝 Publishing Checklist Template

Copy this for each release:

```markdown
## Pre-Publish Checklist for vX.Y.Z

- [ ] Code changes committed and tested
- [ ] `npm test` passes (0 failures)
- [ ] `node test/v0.4.0-self-test.js` passes (7/7 checks)
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] Version bumped in package.json (X.Y.Z)
- [ ] CHANGELOG.md updated with new section
- [ ] README.md updated (if needed)
- [ ] Local test: `npm run rebuild` successful
- [ ] `node scripts/inspect-artefacts.js` PASS; report in the release PR; every FLAG answered
- [ ] Pre-go-live reflection answered in the release PR and checked by the independent reviewer
- [ ] Release PR (version bump, CHANGELOG, inspection report, reflection) reviewed and merged — no direct push to main
- [ ] Git tag created: `git tag -a vX.Y.Z -m "..."`
- [ ] Tag pushed: `git push origin vX.Y.Z`
- [ ] GitHub Actions workflow triggered
- [ ] CI pipeline passed (green checkmark)
- [ ] Extension published to marketplace (verify within 10 min)
- [ ] GitHub Release created with VSIX
- [ ] Installation tested from marketplace
- [ ] Functionality verified in VS Code

## Post-Publish Verification

- [ ] `node scripts/verify-published.js X.Y.Z --engine A.B.C --pre inspection.json` PASS
- [ ] Engine (if bumped) published with `scripts/publish-engine.sh --publish --pre inspection.json`, never from the working tree
- [ ] Marketplace shows new version: vX.Y.Z
- [ ] Download/Install works from marketplace
- [ ] Extension activates correctly
- [ ] No immediate bug reports
- [ ] GitHub Release has VSIX attachment
```

---

**Last Updated:** 2025-10-05
**Extension:** Pine Script v6 Language Support
**Publisher:** jpantsjoha
**Current Workflow:** `.github/workflows/publish.yml`
