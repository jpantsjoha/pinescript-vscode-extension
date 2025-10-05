# ADR-003: TradingView Documentation Synchronization Strategy

**Status**: Accepted
**Date**: 2025-10-05
**Related**: ADR-001 (Validation Strategy), ADR-002 (Test Strategy)
**Version**: 0.3.0

---

## Context

Pine Script v6 is actively developed by TradingView with periodic updates:
- New functions added
- Parameter specifications changed
- Constants and namespaces expanded
- Breaking changes in major versions

**Challenge**: Keep extension synchronized with official TradingView docs to maintain accuracy and completeness.

---

## Decision

Implement an **automated synchronization workflow** with quarterly re-scraping and validation against official TradingView documentation.

---

## Synchronization Strategy

### 1. Official Data Sources

```typescript
const OFFICIAL_SOURCES = {
  // Primary source - complete function reference
  v6Reference: 'https://www.tradingview.com/pine-script-reference/v6/',

  // Secondary sources - documentation and examples
  userManual: 'https://www.tradingview.com/pine-script-docs/',
  releaseNotes: 'https://www.tradingview.com/pine-script-docs/release-notes/',
  builtIns: 'https://www.tradingview.com/pine-script-docs/language/built-ins/',

  // Tertiary - community and examples
  publicLibrary: 'https://www.tradingview.com/scripts/',
  community: 'https://www.tradingview.com/u/#published-scripts'
};
```

### 2. Automated Scraping Schedule

**Quarterly Re-scrape**: Every 3 months (Jan, Apr, Jul, Oct)

**Manual Re-scrape Triggers**:
- TradingView announces major version update
- Community reports missing functions
- New namespace discovered
- Breaking changes detected

---

## Re-Scraping Workflow

### Step 1: Download Latest Documentation

**Script**: `v6/scripts/scrape-v6-reference.sh`

```bash
#!/bin/bash
# Download latest Pine Script v6 reference

DATE=$(date +%Y-%m-%d)
OUTPUT_DIR="v6/raw"

echo "📥 Downloading Pine Script v6 Reference ($DATE)"

# Download main reference page
curl -o "$OUTPUT_DIR/index-$DATE.html" \
  'https://www.tradingview.com/pine-script-reference/v6/'

# Download release notes for changelog
curl -o "$OUTPUT_DIR/release-notes-$DATE.html" \
  'https://www.tradingview.com/pine-script-docs/release-notes/'

echo "✅ Downloaded to $OUTPUT_DIR"
```

**Run**: `./v6/scripts/scrape-v6-reference.sh`

**Output**:
- `v6/raw/index-2025-10-05.html` - Latest reference
- `v6/raw/release-notes-2025-10-05.html` - Changelog

---

### Step 2: Parse and Generate Function Database

**Script**: `v6/scripts/parse-main-page.js`

**Process**:
```
Raw HTML
    ↓
Parse with Cheerio/Playwright
    ↓
Extract:
  - Function names
  - Parameters (required/optional)
  - Signatures
  - Return types
  - Descriptions
    ↓
Generate TypeScript:
  v6/parameter-requirements-generated.ts
    ↓
Merge with manual overrides:
  v6/parameter-requirements-merged.ts
```

**Command**:
```bash
cd v6/scripts
node parse-main-page.js
```

**Output**:
- `v6/parameter-requirements-generated.ts` - 457+ functions
- Metadata: Generation date, source URL, function count

---

### Step 3: Diff Analysis

**Purpose**: Identify changes between versions

**Script**: `v6/scripts/diff-function-database.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');

// Load old and new databases
const oldDB = require('../parameter-requirements-generated-old.js');
const newDB = require('../parameter-requirements-generated.js');

// Compare
const changes = {
  added: [],
  removed: [],
  modified: [],
  unchanged: 0
};

// Find added functions
for (const func in newDB.PINE_FUNCTIONS) {
  if (!oldDB.PINE_FUNCTIONS[func]) {
    changes.added.push(func);
  }
}

// Find removed functions
for (const func in oldDB.PINE_FUNCTIONS) {
  if (!newDB.PINE_FUNCTIONS[func]) {
    changes.removed.push(func);
  }
}

// Find modified functions
for (const func in newDB.PINE_FUNCTIONS) {
  if (oldDB.PINE_FUNCTIONS[func]) {
    const oldSpec = oldDB.PINE_FUNCTIONS[func];
    const newSpec = newDB.PINE_FUNCTIONS[func];

    if (JSON.stringify(oldSpec) !== JSON.stringify(newSpec)) {
      changes.modified.push({
        function: func,
        old: oldSpec,
        new: newSpec
      });
    } else {
      changes.unchanged++;
    }
  }
}

// Generate report
console.log('📊 Function Database Changes\n');
console.log(`✅ Unchanged: ${changes.unchanged}`);
console.log(`➕ Added: ${changes.added.length}`);
console.log(`➖ Removed: ${changes.removed.length}`);
console.log(`🔄 Modified: ${changes.modified.length}\n`);

if (changes.added.length > 0) {
  console.log('New Functions:');
  changes.added.forEach(f => console.log(`  + ${f}`));
}

if (changes.removed.length > 0) {
  console.log('\nRemoved Functions:');
  changes.removed.forEach(f => console.log(`  - ${f}`));
}

if (changes.modified.length > 0) {
  console.log('\nModified Functions:');
  changes.modified.forEach(m => {
    console.log(`  ~ ${m.function}`);
    console.log(`    Old params: ${m.old.requiredParams.join(', ')}`);
    console.log(`    New params: ${m.new.requiredParams.join(', ')}`);
  });
}

// Save report
fs.writeFileSync(
  `../sync-report-${new Date().toISOString().split('T')[0]}.json`,
  JSON.stringify(changes, null, 2)
);
```

**Run**: `node v6/scripts/diff-function-database.js`

**Output Example**:
```
📊 Function Database Changes

✅ Unchanged: 445
➕ Added: 12
➖ Removed: 0
🔄 Modified: 5

New Functions:
  + matrix.eigenvalues
  + matrix.eigenvectors
  + request.economic
  + chart.left_visible_bar_time
  + chart.right_visible_bar_time
  ...

Modified Functions:
  ~ strategy.entry
    Old params: id, direction
    New params: id, direction, qty
```

---

### Step 4: Update Tests

**Action**: Review test expectations for changed functions

```bash
# 1. Run existing tests
npm test

# 2. Review failures
# Expected: Some tests may fail if function signatures changed

# 3. Update test fixtures
#    - test/fixtures/valid.pine
#    - test/fixtures/invalid.pine
#    - test/comprehensive-validation-test.js

# 4. Re-run tests
npm test

# Expected: All tests pass
```

---

### Step 5: Validation

**Run comprehensive validation**:
```bash
# Test against real Pine Script examples
node test/comprehensive-validation-test.js

# Check metrics
cat test/metrics-v0.X.0.json
```

**Quality Gates**:
- ✅ False Positives = 0
- ✅ False Negatives < 5
- ✅ All tests pass
- ✅ Performance acceptable

---

## Version Detection Strategy

**Problem**: Detect when TradingView updates Pine Script

**Solution**: Automated checker

**Script**: `v6/scripts/check-updates.js`

```javascript
#!/usr/bin/env node
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const RELEASE_NOTES_URL = 'https://www.tradingview.com/pine-script-docs/release-notes/';
const LAST_CHECK_FILE = 'v6/last-update-check.json';

async function checkForUpdates() {
  console.log('🔍 Checking for Pine Script updates...\n');

  // Fetch release notes
  const html = await fetch(RELEASE_NOTES_URL);
  const $ = cheerio.load(html);

  // Extract latest version
  const latestVersion = $('.release-version').first().text().trim();
  const latestDate = $('.release-date').first().text().trim();

  // Load last known version
  let lastCheck = { version: 'v6.0.0', date: '2023-01-01' };
  if (fs.existsSync(LAST_CHECK_FILE)) {
    lastCheck = JSON.parse(fs.readFileSync(LAST_CHECK_FILE));
  }

  // Compare
  if (latestVersion !== lastCheck.version) {
    console.log('🆕 NEW VERSION DETECTED!\n');
    console.log(`   Previous: ${lastCheck.version} (${lastCheck.date})`);
    console.log(`   Latest:   ${latestVersion} (${latestDate})\n`);
    console.log('📋 Action Required:');
    console.log('   1. Run: ./v6/scripts/scrape-v6-reference.sh');
    console.log('   2. Run: node v6/scripts/parse-main-page.js');
    console.log('   3. Run: node v6/scripts/diff-function-database.js');
    console.log('   4. Review changes and update tests');
    console.log('   5. Run: npm test\n');

    // Save new version
    fs.writeFileSync(LAST_CHECK_FILE, JSON.stringify({
      version: latestVersion,
      date: latestDate,
      checkDate: new Date().toISOString()
    }, null, 2));

    process.exit(1); // Non-zero to trigger CI alert
  } else {
    console.log('✅ No updates detected');
    console.log(`   Current version: ${latestVersion}`);
    console.log(`   Last check: ${lastCheck.checkDate}\n`);
  }
}

checkForUpdates().catch(console.error);
```

**Run**: `node v6/scripts/check-updates.js`

**Automated Schedule**: GitHub Actions (weekly)

```yaml
name: Check TradingView Updates
on:
  schedule:
    - cron: '0 0 * * 0' # Every Sunday at midnight

jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node v6/scripts/check-updates.js
      - name: Create Issue if Update Found
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🆕 Pine Script Update Detected',
              body: 'A new Pine Script version has been released. Please run synchronization workflow.',
              labels: ['documentation', 'sync-needed']
            })
```

---

## Manual Review Checklist

**Before releasing after sync**:

- [ ] Review `sync-report-YYYY-MM-DD.json`
- [ ] Check all added functions are in database
- [ ] Verify removed functions (confirm deprecation in release notes)
- [ ] Test modified functions manually
- [ ] Update CHANGELOG.md with TradingView version
- [ ] Run full test suite: `npm test`
- [ ] Run comprehensive validation: `node test/comprehensive-validation-test.js`
- [ ] Test on real examples: `examples/demo/*.pine`
- [ ] Update version number if breaking changes
- [ ] Document in ADR if major changes

---

## Versioning Strategy

**Extension Version** ↔ **Pine Script Version**

| Extension | Pine Script | Notes |
|-----------|-------------|-------|
| v0.1.x | v5 | Legacy support |
| v0.2.x | v6 (partial) | 457 functions |
| v0.3.x | v6 (complete) | 457 functions, zero false positives |
| v0.4.x | v6 (enhanced) | Navigation features |
| v1.0.x | v6 (full) | LSP architecture |

**Versioning Rules**:
- **Patch** (0.3.1): Bug fixes, no new functions
- **Minor** (0.4.0): New functions added, backward compatible
- **Major** (1.0.0): Breaking changes, new architecture

---

## Future Enhancements

### 1. TradingView API Integration (If Available)

**Ideal Future**:
```typescript
import { TradingViewAPI } from '@tradingview/pine-script-api';

const api = new TradingViewAPI();
const functions = await api.getFunctions('v6');
const constants = await api.getConstants('v6');

// Always up-to-date, no scraping needed
```

**Current Status**: No public API available

**Monitor**: TradingView developer docs for API announcements

### 2. Community Contribution System

**Allow users to report**:
- Missing functions
- Incorrect parameter specs
- New constants

**Process**:
1. User opens GitHub issue with function details
2. Maintainer verifies against official docs
3. Add to manual overrides: `v6/parameter-requirements.ts`
4. Release patch version

### 3. AST Parser Enhancement

**Current**: Regex-based validation
**Future**: Full AST parsing with tree-sitter

**Benefits**:
- Type checking
- Scope analysis
- Multi-line statement support
- Better error messages

**Timeline**: v1.0.0+ (major refactor)

---

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Check for updates | Weekly (automated) | GitHub Actions |
| Re-scrape docs | Quarterly | Maintainer |
| Review sync report | After re-scrape | Maintainer |
| Update tests | After sync | Maintainer |
| Release sync version | Within 1 week of sync | Maintainer |
| Community issue review | Monthly | Maintainer |
| Performance audit | Per release | Maintainer |

---

## Rollback Strategy

**If sync introduces regressions**:

1. **Identify Issue**:
   ```bash
   npm test # Failing tests?
   node test/comprehensive-validation-test.js # Increased false positives?
   ```

2. **Revert Generated Files**:
   ```bash
   git checkout HEAD~1 v6/parameter-requirements-generated.ts
   git checkout HEAD~1 v6/parameter-requirements-merged.ts
   ```

3. **Document Issue**:
   - Create GitHub issue with details
   - Note which functions/constants problematic
   - Add to `unreliableParamFunctions` blacklist

4. **Manual Override**:
   - Update `v6/parameter-requirements.ts` with correct specs
   - Merge and test

5. **Release Hotfix**: Patch version (e.g., v0.3.1)

---

## References

- [Pine Script v6 Reference](https://www.tradingview.com/pine-script-reference/v6/)
- [Pine Script Release Notes](https://www.tradingview.com/pine-script-docs/release-notes/)
- [ADR-001: Validation Strategy](./ADR-001-VALIDATION-STRATEGY.md)
- [ADR-002: Test Strategy](./ADR-002-TEST-STRATEGY.md)

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2025-10-05 | Dev Team | Accepted | Initial sync strategy |

---

## Next Actions

**Immediate** (v0.3.0 Release):
- [x] Document sync strategy
- [ ] Set up weekly update checker
- [ ] Test sync workflow once

**Short-term** (Next 3 months):
- [ ] Run first quarterly re-scrape
- [ ] Implement automated GitHub Actions
- [ ] Create sync playbook for maintainers

**Long-term** (v1.0.0+):
- [ ] Investigate TradingView API options
- [ ] Implement AST parser with tree-sitter
- [ ] Community contribution system

