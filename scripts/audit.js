#!/usr/bin/env node
/**
 * Repo self-audit — the "insiders report".
 *
 * Checks the things that have actually broken in this project rather than
 * generic lint rules: npm scripts pointing at deleted files, the Claude harness
 * silently not loading, the golden corpus disappearing from CI, the VSIX shipping
 * source or omitting runtime data, and version drift between package.json,
 * CHANGELOG, README and git tags.
 *
 *   node scripts/audit.js          # report, exit 1 on any FAIL
 *   node scripts/audit.js --warn   # report, exit 0 even on FAIL (advisory)
 *
 * Every check states what it verified, so a PASS is evidence rather than a tick.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ADVISORY = process.argv.includes('--warn');

const results = [];
const record = (status, area, message) => results.push({ status, area, message });
const pass = (area, message) => record('PASS', area, message);
const fail = (area, message) => record('FAIL', area, message);
const warn = (area, message) => record('WARN', area, message);

const exists = relativePath => fs.existsSync(path.join(ROOT, relativePath));
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

//──────────────────────────────────────────────────────────
// 1. npm scripts must point at files that exist
//──────────────────────────────────────────────────────────
function auditNpmScripts() {
  const pkg = JSON.parse(read('package.json'));
  const broken = [];

  // A target that is missing because it is deliberately gitignored is a different
  // problem from a target that is simply gone: the first only breaks a local dev
  // convenience, the second breaks the script for everyone. CI has no gitignored
  // files at all, so failing on those would fail every clean checkout.
  const ignoredButMissing = [];

  const isGitIgnored = target => {
    try {
      execSync(`git check-ignore -q "${target}"`, { cwd: ROOT, stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };

  for (const [name, command] of Object.entries(pkg.scripts || {})) {
    // Only local script targets are checkable; binaries resolve via PATH.
    const targets = command.match(/(?:^|\s)((?:\.\/)?[\w./-]+\.js)(?=\s|$)/g) || [];
    for (const raw of targets) {
      const target = raw.trim().replace(/^\.\//, '');
      if (target.includes('*')) continue;
      if (exists(target)) continue;
      if (isGitIgnored(target)) ignoredButMissing.push(`${name} -> ${target}`);
      else broken.push(`${name} -> ${target}`);
    }
  }

  if (broken.length) {
    fail('npm scripts', `point at missing files: ${broken.join(', ')}`);
  } else {
    pass('npm scripts', `all tracked script targets resolve (${Object.keys(pkg.scripts).length} scripts)`);
  }

  if (ignoredButMissing.length) {
    warn('npm scripts', `target(s) live under a gitignored path, so they are absent from a clean checkout and from CI: ${ignoredButMissing.join(', ')}`);
  }
}

//──────────────────────────────────────────────────────────
// 2. Claude harness must actually load
//──────────────────────────────────────────────────────────
function auditClaudeHarness() {
  // CLAUDE.md as a dotfile is never read — that is how 12KB of directives sat
  // unloaded for months.
  if (exists('.CLAUDE.md') && !exists('CLAUDE.md')) {
    fail('harness', '.CLAUDE.md is a dotfile and is never loaded; rename to CLAUDE.md');
  } else if (exists('CLAUDE.md')) {
    pass('harness', 'CLAUDE.md present at repo root (loaded automatically)');
  } else {
    warn('harness', 'no CLAUDE.md — Claude starts with no project directives');
  }

  // Settings must parse; malformed JSON silently disables every setting in the file.
  if (!exists('.claude/settings.json')) {
    warn('harness', '.claude/settings.json missing — no project hooks configured');
  } else {
    try {
      const settings = JSON.parse(read('.claude/settings.json'));
      const hookCount = Object.values(settings.hooks || {})
        .flat()
        .flatMap(entry => entry.hooks || []).length;
      pass('harness', `.claude/settings.json parses; ${hookCount} hook(s) configured`);

      for (const group of Object.values(settings.hooks || {}).flat()) {
        for (const hook of group.hooks || []) {
          const match = (hook.command || '').match(/\$CLAUDE_PROJECT_DIR\/([\w./-]+)/);
          if (!match) continue;
          const script = match[1];
          if (!exists(script)) {
            fail('harness', `hook references missing script: ${script}`);
          } else {
            const mode = fs.statSync(path.join(ROOT, script)).mode;
            if (mode & 0o111) pass('harness', `hook script ${script} exists and is executable`);
            else fail('harness', `hook script ${script} is not executable (chmod +x)`);
          }
        }
      }
    } catch (error) {
      fail('harness', `.claude/settings.json is malformed JSON: ${error.message}`);
    }
  }

  // Subagent definitions need YAML frontmatter; without it they are inert prose.
  if (exists('.claude/agents')) {
    const agents = fs.readdirSync(path.join(ROOT, '.claude/agents')).filter(f => f.endsWith('.md'));
    const missing = agents.filter(f => !read(`.claude/agents/${f}`).startsWith('---'));
    if (missing.length) {
      fail('harness', `agents lack YAML frontmatter (not loadable): ${missing.join(', ')}`);
    } else if (agents.length) {
      pass('harness', `${agents.length} agent definition(s) carry valid frontmatter`);
    }
  }

  // Skills need frontmatter with name + description to be listed.
  if (!exists('.claude/skills')) {
    warn('harness', 'no .claude/skills/ — project workflows are not invocable as skills');
  } else {
    const skills = fs.readdirSync(path.join(ROOT, '.claude/skills'), { withFileTypes: true })
      .filter(d => d.isDirectory());
    const broken = skills.filter(d => {
      const file = `.claude/skills/${d.name}/SKILL.md`;
      if (!exists(file)) return true;
      const head = read(file).slice(0, 400);
      return !head.startsWith('---') || !/\nname:/.test(head) || !/\ndescription:/.test(head);
    });
    if (broken.length) {
      fail('harness', `skills missing SKILL.md or frontmatter: ${broken.map(d => d.name).join(', ')}`);
    } else {
      pass('harness', `${skills.length} skill(s) present with valid frontmatter`);
    }
  }

  // Tracked-in-git check: a gitignored harness helps nobody but this machine.
  try {
    const ignored = execSync('git check-ignore .claude/settings.json CLAUDE.md 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }).trim();
    if (ignored) fail('harness', `harness files are gitignored (team never gets them): ${ignored.replace(/\n/g, ', ')}`);
    else pass('harness', 'harness files are tracked in git');
  } catch { /* git absent — not fatal */ }
}

//──────────────────────────────────────────────────────────
// 3. Test gate must be real
//──────────────────────────────────────────────────────────
function auditTestGate() {
  if (!exists('test/golden-corpus.test.js')) {
    fail('tests', 'no golden-corpus test — false positives on valid code are ungated');
    return;
  }

  const corpus = read('test/golden-corpus.test.js');
  const listed = [...corpus.matchAll(/'(test\/fixtures\/corpus\/[^']+\.pine)'/g)].map(m => m[1]);
  const missing = listed.filter(f => !exists(f));

  if (missing.length) {
    fail('tests', `golden corpus references missing files: ${missing.join(', ')}`);
  } else {
    pass('tests', `golden corpus lists ${listed.length} file(s), all present`);
  }

  // The corpus living under a gitignored path is how it vanishes from CI.
  try {
    const ignored = execSync(`git check-ignore ${listed.map(f => `"${f}"`).join(' ')} 2>/dev/null || true`,
      { cwd: ROOT, encoding: 'utf8' }).trim();
    if (ignored) fail('tests', `golden corpus files are gitignored — CI cannot see them: ${ignored.split('\n')[0]}...`);
    else pass('tests', 'golden corpus is tracked and reaches CI');
  } catch { /* git absent */ }

  // Root-level test scripts outside the npm test glob never run.
  const strays = fs.readdirSync(ROOT).filter(f => /^test-.*\.js$/.test(f));
  if (strays.length) {
    warn('tests', `root test scripts outside the npm test glob (never run): ${strays.join(', ')}`);
  } else {
    pass('tests', 'no orphaned root-level test scripts');
  }
}

//──────────────────────────────────────────────────────────
// 4. Packaging must ship runtime data and omit sources
//──────────────────────────────────────────────────────────
function auditPackaging() {
  if (!exists('.vscodeignore')) {
    warn('packaging', 'no .vscodeignore — the VSIX will include the whole repo');
    return;
  }

  const ignore = read('.vscodeignore');
  const pkg = JSON.parse(read('package.json'));
  const main = (pkg.main || '').replace(/^\.\//, '');

  if (!main) {
    fail('packaging', 'package.json has no "main" entry point');
  } else if (/^dist\/\*\*/m.test(ignore)) {
    fail('packaging', '.vscodeignore excludes dist/** but main points into it');
  } else {
    pass('packaging', `entry point ${main} is not excluded by .vscodeignore`);
  }

  // The compiled data the validator loads at runtime must survive packaging.
  if (/^v6\/\*\*/m.test(ignore) && !/^dist\//m.test(ignore)) {
    pass('packaging', 'v6/ TypeScript sources excluded; compiled dist/v6/ ships instead');
  }

  if (!/dev-tools/.test(ignore)) {
    warn('packaging', 'dev-tools/ is not excluded — development files ship to users');
  } else {
    pass('packaging', 'development tooling excluded from the VSIX');
  }
}

//──────────────────────────────────────────────────────────
// 5. Version consistency across every place it is stated
//──────────────────────────────────────────────────────────
function auditVersionConsistency() {
  const version = JSON.parse(read('package.json')).version;
  const mismatches = [];

  if (exists('CHANGELOG.md') && !read('CHANGELOG.md').includes(`## [${version}]`)) {
    mismatches.push('CHANGELOG.md has no entry for this version');
  }
  if (exists('README.md') && !read('README.md').includes(version)) {
    mismatches.push('README.md does not mention this version');
  }

  try {
    const tags = execSync('git tag', { cwd: ROOT, encoding: 'utf8' }).split('\n');
    if (!tags.includes(`v${version}`)) mismatches.push(`no git tag v${version}`);
  } catch { /* git absent */ }

  if (mismatches.length) warn('version', `${version}: ${mismatches.join('; ')}`);
  else pass('version', `${version} consistent across package.json, CHANGELOG, README and git tag`);
}

//──────────────────────────────────────────────────────────
// 6. Pine v6 reference-data currency
//──────────────────────────────────────────────────────────
function auditDataCurrency() {
  const generated = 'v6/parameter-requirements-generated.ts';
  if (!exists(generated)) {
    fail('v6 data', `${generated} missing — the validator has no signature data`);
    return;
  }

  const stamp = read(generated).match(/Generated:\s*([\d-]{10})/);
  if (!stamp) {
    warn('v6 data', 'generated dataset carries no date stamp');
    return;
  }

  const ageDays = Math.floor((Date.now() - new Date(stamp[1])) / 86400000);
  const hasManualCatchUp = exists('v6/parameter-requirements.ts') &&
    read('v6/parameter-requirements.ts').includes('MODERN_V6_FUNCTIONS');

  if (ageDays > 180 && !hasManualCatchUp) {
    fail('v6 data', `reference scraped ${stamp[1]} (${ageDays}d ago) with no manual catch-up layer`);
  } else if (ageDays > 180) {
    warn('v6 data', `reference scraped ${stamp[1]} (${ageDays}d ago); MODERN_V6_FUNCTIONS covers the gap — re-crawl due`);
  } else {
    pass('v6 data', `reference scraped ${stamp[1]} (${ageDays}d ago)`);
  }
}

//──────────────────────────────────────────────────────────
// 6b. Every diagnostic source must be gated by the corpus and the CLI
//
// The extension emits diagnostics from more than one module. When a source is
// not wired into validate-cli.js and the golden corpus, the suite reports
// "0 errors" on files the editor covers in squiggles — that is exactly how 28
// false alertcondition errors survived a green test run.
//──────────────────────────────────────────────────────────
function auditDiagnosticCoverage() {
  const parserDir = 'src/parser';
  if (!exists(parserDir)) return;

  // A diagnostic source is any module the extension imports AND that returns
  // diagnostics — identified by exporting a validate/check entry point.
  const extension = exists('src/extension.ts') ? read('src/extension.ts') : '';
  const sources = fs.readdirSync(path.join(ROOT, parserDir))
    .filter(f => f.endsWith('.ts'))
    .filter(f => {
      const body = read(`${parserDir}/${f}`);
      return /export (class|function) \w*(Validator|Checks|runDocumentChecks)/.test(body);
    })
    .map(f => f.replace(/\.ts$/, ''))
    .filter(name => new RegExp(`from '\\./parser/${name}'`).test(extension));

  if (!sources.length) {
    warn('diagnostics', 'could not identify any diagnostic source imported by extension.ts');
    return;
  }

  const cli = exists('validate-cli.js') ? read('validate-cli.js') : '';
  const corpus = exists('test/golden-corpus.test.js') ? read('test/golden-corpus.test.js') : '';

  const ungatedByCli = sources.filter(name => !cli.includes(name));
  const ungatedByCorpus = sources.filter(name => !corpus.includes(name));

  if (ungatedByCli.length) {
    fail('diagnostics', `diagnostic source(s) not run by validate-cli.js: ${ungatedByCli.join(', ')} — the CLI will disagree with the editor`);
  } else {
    pass('diagnostics', `all ${sources.length} diagnostic source(s) run by validate-cli.js`);
  }

  if (ungatedByCorpus.length) {
    fail('diagnostics', `diagnostic source(s) not gated by the golden corpus: ${ungatedByCorpus.join(', ')} — false positives there are invisible to CI`);
  } else {
    pass('diagnostics', `all ${sources.length} diagnostic source(s) gated by the golden corpus`);
  }
}

//──────────────────────────────────────────────────────────
// 6c. The engine must not import the `vscode` runtime
//
// `vscode` exists only inside the extension host. A validator that imports it
// cannot load in CI, in validate-cli.js, in the MCP server, or in the agent
// plugin. This was masked locally by a stray node_modules/vscode stub, so the
// suite passed on the author's machine and failed in CI.
//──────────────────────────────────────────────────────────
function auditEnginePortability() {
  const engineModules = ['src/parser/accurateValidator.ts', 'src/parser/documentChecks.ts'];
  const coupled = engineModules.filter(m => exists(m) && /from 'vscode'/.test(read(m)));

  if (coupled.length) {
    fail('portability', `engine module(s) import the vscode runtime and cannot load outside the extension host: ${coupled.join(', ')}`);
  } else {
    pass('portability', 'engine modules are free of the vscode runtime (loadable by CLI, MCP and CI)');
  }

  // A stub inside node_modules makes a broken import look fine locally.
  if (exists('node_modules/vscode') && !/"vscode"/.test(read('package.json'))) {
    warn('portability', 'node_modules/vscode exists but is not a declared dependency — a stray stub can mask a real "Cannot find module" failure that CI will hit');
  }
}

//──────────────────────────────────────────────────────────
// 7. CI must not have checks that silently no-op
//──────────────────────────────────────────────────────────
function auditCi() {
  const workflow = '.github/workflows/ci.yml';
  if (!exists(workflow)) {
    warn('ci', 'no ci.yml');
    return;
  }

  const yaml = read(workflow);
  // `--if-present || echo ...` cannot fail, so the step is decorative.
  if (/--if-present.*\|\|\s*echo/.test(yaml)) {
    fail('ci', 'a CI step is double-guarded (--if-present || echo) and can never fail');
  } else {
    pass('ci', 'no double-guarded no-op steps');
  }

  if (!/npm (run )?(lint|typecheck)/.test(yaml)) {
    warn('ci', 'CI does not run lint or typecheck');
  } else {
    pass('ci', 'CI runs lint/typecheck');
  }
}

//──────────────────────────────────────────────────────────

auditNpmScripts();
auditClaudeHarness();
auditTestGate();
auditPackaging();
auditVersionConsistency();
auditDataCurrency();
auditDiagnosticCoverage();
auditEnginePortability();
auditCi();

const ICON = { PASS: '[32m PASS[0m', WARN: '[33m WARN[0m', FAIL: '[31m FAIL[0m' };
const counts = { PASS: 0, WARN: 0, FAIL: 0 };

console.log('\n[1mRepo self-audit[0m\n');
let currentArea = null;
for (const result of results) {
  counts[result.status]++;
  if (result.area !== currentArea) {
    currentArea = result.area;
    console.log(`[2m${currentArea}[0m`);
  }
  console.log(`  ${ICON[result.status]}  ${result.message}`);
}

console.log(`\n  ${counts.PASS} pass · ${counts.WARN} warn · ${counts.FAIL} fail\n`);

if (counts.FAIL > 0 && !ADVISORY) {
  console.error('[31mAudit failed.[0m Fix the FAIL items above, or run with --warn to downgrade.\n');
  process.exit(1);
}
