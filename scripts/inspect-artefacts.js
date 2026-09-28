#!/usr/bin/env node
/**
 * Pre-release inspection of EVERY artefact a release ships — before go-live.
 *
 *   node scripts/inspect-artefacts.js [--ref <commit>] [--prev-tag vX.Y.Z]
 *        [--prev-engine X.Y.Z] [--out-dir <dir>] [--keep]
 *
 * npm 0.4.2 behaved correctly and still shipped the wrong contents: it was packed
 * from the iCloud working tree, and 22 sync-conflict copies went with it (#67). Tests
 * exercise behaviour; this inspects contents. For the candidate commit it:
 *
 *   1. exports the commit with `git archive` into a fresh directory outside iCloud
 *      (refuses any path containing "Mobile Documents") and builds every artefact
 *      there: the VSIX (`npm ci --ignore-scripts`, `npm run build`, pinned vsce) and
 *      the engine tarball (`npm pack` in packages/validator; its prepack guard runs);
 *   2. lists each artefact against its exact expected set (verify-vsix's allowlist,
 *      check-pack's derived list) and fails on sync-conflict names (`/ \d+\./`),
 *      dotfiles, TypeScript sources, source maps, tests and fixtures;
 *   3. prints size, file count and SHA-256 per artefact;
 *   4. compares each with the previous release's PUBLISHED artefact (the GitHub
 *      release VSIX of --prev-tag, npm's tarball of --prev-engine) and flags a size
 *      change over 10% or any file added or removed, listing each;
 *   5. runs each: the VSIX's packaged activate() (verify-vsix), the engine tarball
 *      installed by name against the regression corpus;
 *   6. writes `inspection.md` (paste into the release PR) and `inspection.json`
 *      (input to scripts/verify-published.js --pre) to --out-dir.
 *
 * Exit 1 on any FAIL. FLAGs do not fail; each needs a written answer in the
 * pre-go-live reflection (docs/guides/RELEASE-RUNBOOK.md).
 *
 * Adding an artefact: build it in buildArtefacts(), give it a `kind` that
 * scripts/lib/artefacts.js can list, check and run, and a previous-release fetcher.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./lib/artefacts');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : fallback;
}

function buildArtefacts(root) {
  const env = { ...process.env, npm_config_audit: 'false', npm_config_fund: 'false' };
  const run = (cmd, args, cwd) => A.sh(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  run('npm', ['ci', '--ignore-scripts'], root);
  run('npm', ['run', 'build'], root);
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  run(path.join(root, 'node_modules', '.bin', 'vsce'), ['package', '--out', 'build/'], root);
  const vsix = fs.readdirSync(path.join(root, 'build')).filter(f => f.endsWith('.vsix'));
  if (vsix.length !== 1) throw new Error(`expected one VSIX in build/, found ${vsix.length}`);
  const pkgDir = path.join(root, 'packages', 'validator');
  const out = path.join(root, 'build', 'engine');
  fs.mkdirSync(out, { recursive: true });
  const tgz = run('npm', ['pack', '--pack-destination', out], pkgDir).trim().split('\n').pop().trim();
  return [
    { kind: 'vsix', label: 'VS Code extension (Marketplace, Open VSX, GitHub release)', file: path.join(root, 'build', vsix[0]) },
    { kind: 'npm', label: 'engine (npm pinescript-v6-validator)', file: path.join(out, tgz) },
  ];
}

/** The previous release's published artefact of this kind, or null (with a reason). */
function fetchPrevious(kind, { prevTag, prevEngine }, dir) {
  try {
    if (kind === 'vsix') {
      if (!prevTag) return { skip: 'no previous tag' };
      const d = path.join(dir, 'prev-vsix');
      fs.mkdirSync(d, { recursive: true });
      A.sh('gh', ['release', 'download', prevTag, '-p', '*.vsix', '-D', d, '--clobber'], { cwd: A.REPO });
      const f = fs.readdirSync(d).find(n => n.endsWith('.vsix'));
      return f ? { file: path.join(d, f), source: `GitHub release ${prevTag}` } : { skip: `no VSIX on release ${prevTag}` };
    }
    if (!prevEngine) return { skip: 'no previous engine version' };
    const d = path.join(dir, 'prev-npm');
    fs.mkdirSync(d, { recursive: true });
    const name = A.sh('npm', ['pack', `pinescript-v6-validator@${prevEngine}`, '--pack-destination', d], { cwd: d })
      .trim().split('\n').pop().trim();
    return { file: path.join(d, name), source: `npm pinescript-v6-validator@${prevEngine}` };
  } catch (e) {
    return { skip: `could not fetch: ${String(e.stderr || e.message).split('\n')[0]}` };
  }
}

function main() {
  const ref = arg('--ref', 'HEAD');
  const work = A.tempDir('artefact-inspect-');
  const { sha, dir: root } = A.exportRef(ref, path.join(work, 'export'));
  const extVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const engineVersion = JSON.parse(fs.readFileSync(path.join(root, 'packages', 'validator', 'package.json'), 'utf8')).version;

  let prevTag = arg('--prev-tag');
  if (!prevTag) {
    try { prevTag = A.sh('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*.*.*', `${sha}^`], { cwd: A.REPO }).trim(); } catch { /* none */ }
  }
  let prevEngine = arg('--prev-engine');
  let enginePublished = false;
  try {
    const versions = JSON.parse(A.sh('npm', ['view', 'pinescript-v6-validator', 'versions', '--json']));
    enginePublished = versions.includes(engineVersion);
    if (!prevEngine) prevEngine = versions.filter(v => v !== engineVersion).pop();
  } catch { /* offline: no previous engine */ }

  console.error(`inspect-artefacts: ${sha.slice(0, 12)} exported to ${root}; building…`);
  const built = buildArtefacts(root);
  const records = [];
  for (const b of built) {
    console.error(`inspect-artefacts: inspecting ${path.basename(b.file)}…`);
    const r = A.inspect({ ...b, root });
    const prev = fetchPrevious(b.kind, { prevTag, prevEngine }, work);
    if (prev.file) r.previous = { ...A.comparePrevious(r, A.describe(b.kind, prev.file)), source: prev.source };
    else r.flags.push(`no previous artefact compared (${prev.skip})`);
    records.push(r);
  }
  if (enginePublished) {
    records.find(r => r.kind === 'npm').flags.push(
      `engine ${engineVersion} is already on npm: this release does not publish the engine (bump packages/validator to publish)`);
  }

  const meta = {
    candidate: `${sha} (\`${ref}\`)`,
    'built from': 'clean `git archive` export outside iCloud',
    'extension version': extVersion,
    'engine version': engineVersion,
    'previous release': `${prevTag || 'none'} / engine ${prevEngine || 'none'}`,
    node: process.version,
    date: new Date().toISOString().slice(0, 10),
  };
  const md = A.markdown('Artefact inspection', meta, records);
  const outDir = A.refuseICloud(path.resolve(arg('--out-dir', path.join(work, 'report'))));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'inspection.md'), md + '\n');
  fs.writeFileSync(path.join(outDir, 'inspection.json'), JSON.stringify(A.toJson(records, { ...meta, sha }), null, 2) + '\n');
  for (const r of records) fs.copyFileSync(r.file, path.join(outDir, r.name));

  console.log(md);
  console.log(`\ninspect-artefacts: report and artefacts in ${outDir}`);
  if (!process.argv.includes('--keep')) fs.rmSync(path.join(work, 'export'), { recursive: true, force: true });
  return records.some(r => r.failures.length) ? 1 : 0;
}

if (require.main === module) {
  try {
    process.exit(main());
  } catch (e) {
    console.error(`inspect-artefacts: FAIL — ${String(e.stderr || '').trim() || e.message}`);
    process.exit(1);
  }
}
