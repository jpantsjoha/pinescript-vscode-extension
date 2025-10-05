# Publishing Guide: Pine Script v6 Extension

Complete guide to publishing this VSCode extension to the Visual Studio Marketplace.

---

## Prerequisites

- [x] Node.js installed
- [x] Extension built and tested locally
- [ ] Extension icon created (256x256 PNG)
- [ ] Microsoft/Azure DevOps account
- [ ] Publisher identity on VS Marketplace

---

## Step 1: Install Publishing Tools

```bash
npm install -g @vscode/vsce
```

**Verify installation:**
```bash
vsce --version
```

---

## Step 2: Create Extension Icon

**Requirements:**
- **Format**: PNG (no SVG support)
- **Size**: Minimum 128x128px (recommended: 256x256px)
- **Location**: `/icon.png` in project root
- **Style**: Bold, monochrome, transparent background

**Design guidelines:**
- Use "P" + "S" monogram (Pine Script)
- Avoid TradingView branding/trademarks
- Keep it simple and recognizable at small sizes
- Test visibility in both light/dark VS Code themes

**Add to package.json:**
```json
{
  "icon": "icon.png"
}
```

---

## Step 3: Set Up Azure DevOps Account

1. **Create Azure DevOps account:**
   - Go to https://dev.azure.com/
   - Sign in with GitHub or Microsoft account
   - Create new organization (can use existing)

2. **Generate Personal Access Token (PAT):**
   - Click user profile icon → **Personal access tokens**
   - Click **+ New Token**
   - Configure token:
     - **Name**: "VSCode Extension Publishing"
     - **Organization**: "All accessible organizations"
     - **Expiration**: Custom (max 1 year, or shorter for security)
     - **Scopes**: Click "Show all scopes" → Check **Marketplace (Manage)**
   - Click **Create**
   - **⚠️ IMPORTANT**: Copy and save token immediately (cannot retrieve later)

---

## Step 4: Create Publisher Identity

1. **Go to Visual Studio Marketplace:**
   - Visit https://marketplace.visualstudio.com/manage
   - Sign in with same account used for Azure DevOps

2. **Create new publisher:**
   - Click **Create publisher**
   - Fill in details:
     - **ID**: `jaroslav` (or your chosen ID - must be unique, lowercase, no spaces)
     - **Name**: "Jaroslav" (display name)
     - **Email**: Your verified email
     - **Website** (optional): GitHub repo or personal site
   - Click **Create**

3. **Update package.json:**
   ```json
   {
     "publisher": "jaroslav"
   }
   ```

---

## Step 5: Prepare Extension for Publishing

### 5.1 Update README.md

Ensure `README.md` includes:
- Clear description of features
- Screenshots/GIFs demonstrating functionality
- Installation instructions
- Usage examples
- Known issues/limitations
- **Disclaimer** (see below)

### 5.2 Add Disclaimer

**REQUIRED** - Add to README.md footer:

```markdown
---

## Disclaimer

**THIS EXTENSION IS UNOFFICIAL AND NOT AFFILIATED WITH TRADINGVIEW.**

This is a community-developed extension for Pine Script v6. TradingView®, Pine Script™, and related trademarks are property of TradingView, Inc.

**USE AT YOUR OWN RISK. NO WARRANTY OR GUARANTEES ARE PROVIDED.**

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

---
```

### 5.3 Review Files to Include/Exclude

Check `.vscodeignore` excludes:
- Source files (`src/`)
- Tests (`test/`)
- Development docs (`docs/`)
- Build scripts (`v6/scripts/`)
- Raw data (`v6/raw/`)
- Examples (`examples/`)

**Included in VSIX:**
- `dist/` (compiled JavaScript)
- `README.md`
- `LICENSE`
- `package.json`
- `icon.png`
- `syntaxes/`
- `v6/*.ts` and `v6/*.json` (parameter data)

### 5.4 Version Number

Update version in `package.json`:
```json
{
  "version": "0.2.1"
}
```

**Semantic versioning:**
- `0.x.x` = Pre-release/beta
- `x.0.0` = Major (breaking changes)
- `x.x.0` = Minor (new features)
- `x.x.x` = Patch (bug fixes)

---

## Step 6: Build and Package Extension

### 6.1 Test Build Locally

```bash
# Clean build with tests
npm run rebuild

# Output: build/pine-script-extension-0.2.1.vsix
```

### 6.2 Test Installation Locally

```bash
# Install from VSIX
code --install-extension build/pine-script-extension-0.2.1.vsix

# Test in VS Code:
# 1. Open a .pine file
# 2. Verify syntax highlighting works
# 3. Test IntelliSense (Ctrl+Space)
# 4. Check diagnostics for errors
```

### 6.3 Uninstall Test Extension

```bash
code --uninstall-extension jaroslav.pine-script-extension
```

---

## Step 7: Publish to Marketplace

### 7.1 Login with vsce

```bash
vsce login jaroslav
```

**Enter your Personal Access Token** when prompted.

### 7.2 Publish Extension

**Option A: Publish directly**
```bash
vsce publish
```

**Option B: Publish with version bump**
```bash
# Patch: 0.2.1 → 0.2.2
vsce publish patch

# Minor: 0.2.1 → 0.3.0
vsce publish minor

# Major: 0.2.1 → 1.0.0
vsce publish major
```

**Option C: Package then publish manually**
```bash
# Create VSIX
npm run package

# Upload manually at: https://marketplace.visualstudio.com/manage
```

---

## Step 8: Verify Publication

1. **Check marketplace listing:**
   - https://marketplace.visualstudio.com/items?itemName=jaroslav.pine-script-extension

2. **Verify metadata:**
   - Icon displays correctly
   - Description is accurate
   - Screenshots visible
   - Install/download stats tracking

3. **Test installation from marketplace:**
   ```bash
   code --install-extension jaroslav.pine-script-extension
   ```

---

## Step 9: Update and Republish

**To publish updates:**

1. Make code changes
2. Update version in `package.json`
3. Update `CHANGELOG.md` (recommended)
4. Run tests: `npm test`
5. Rebuild: `npm run rebuild`
6. Publish: `vsce publish`

**Auto-increment version:**
```bash
# Automatically bumps version and publishes
vsce publish patch   # 0.2.1 → 0.2.2
vsce publish minor   # 0.2.1 → 0.3.0
vsce publish major   # 0.2.1 → 1.0.0
```

---

## Troubleshooting

### "Publisher not found"
- Ensure publisher ID in `package.json` matches your marketplace publisher ID
- Re-login: `vsce logout` then `vsce login <publisher-id>`

### "Invalid Personal Access Token"
- Token must have **Marketplace (Manage)** scope
- Token must be for **All accessible organizations**
- Regenerate token if expired

### "Icon not found"
- Ensure `icon.png` is in project root
- Path in `package.json` should be `"icon": "icon.png"` (relative to root)
- Icon must be PNG (not SVG)

### "Package too large"
- Review `.vscodeignore` to exclude unnecessary files
- Check VSIX contents: `unzip -l build/*.vsix`
- Remove `v6/raw/` and `v6/scripts/` (should be gitignored)

### "Missing README"
- Ensure `README.md` exists in root
- Check it's not excluded in `.vscodeignore`

---

## Marketing and Promotion

### Create Supporting Content

1. **Blog post:**
   - Features overview
   - Installation guide
   - Code examples
   - Comparison with other Pine Script extensions

2. **Video tutorial:**
   - Screen recording of features
   - Live coding demonstration
   - Installation walkthrough
   - Upload to YouTube with keywords: "Pine Script", "VSCode", "TradingView", "v6"

3. **GitHub README:**
   - Add marketplace badge:
     ```markdown
     ![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/jaroslav.pine-script-extension)
     ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/jaroslav.pine-script-extension)
     ```

4. **Social media:**
   - Share on Twitter/X with #PineScript #VSCode #TradingView
   - Post in TradingView community forums
   - Share on Reddit: r/algotrading, r/vscode

### Marketplace Optimization

**Update package.json keywords:**
```json
{
  "keywords": [
    "pine",
    "pinescript",
    "pine-script",
    "tradingview",
    "trading",
    "indicator",
    "strategy",
    "v6",
    "syntax",
    "intellisense"
  ]
}
```

**Categories:**
```json
{
  "categories": [
    "Programming Languages",
    "Linters",
    "Snippets"
  ]
}
```

---

## Quick Command Reference

```bash
# Install vsce
npm install -g @vscode/vsce

# Login
vsce login <publisher-id>

# Package locally
npm run rebuild

# Test locally
code --install-extension build/*.vsix

# Publish
vsce publish

# Publish with version bump
vsce publish patch|minor|major

# Unpublish (careful!)
vsce unpublish jaroslav.pine-script-extension
```

---

## Resources

- **Official Publishing Guide**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **vsce CLI Reference**: https://github.com/microsoft/vscode-vsce
- **Azure DevOps**: https://dev.azure.com/
- **Marketplace Management**: https://marketplace.visualstudio.com/manage
- **Extension Guidelines**: https://code.visualstudio.com/api/references/extension-guidelines

---

**GOOD LUCK WITH YOUR EXTENSION! 🚀**
