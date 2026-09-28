#!/usr/bin/env node
/**
 * Post-release verification: inspect what ACTUALLY went live, against the record of
 * what was inspected before go-live.
 *
 *   node scripts/verify-published.js <ext-version> [--engine <engine-version>]
 *        --pre <inspection.json> [--ref <git-ref>] [--skip-channel <name>]... [--out-dir <dir>]
 *   node scripts/verify-published.js --engine <engine-version> --pre <inspection.json>
 *
 * `--pre` is required: the inspection.json written by scripts/inspect-artefacts.js.
 * It is refused unless it records a complete PASS inspection (no failures, one
 * artefact per kind verified, hashes present, run ok), its versions equal the ones
 * being verified, and its tree SHA equals the tree of --ref (default: tag
 * v<ext-version>; engine-only, the first of the record's commit, origin/main, HEAD
 * whose tree matches). The tree, not the commit, binds it: a squash merge changes the
 * commit and keeps the tree.
 *
 * Downloads every published copy — the GitHub release VSIX, the Open VSX file
 * (files.download of open-vsx.org/api/jpantsjoha/pinescript-v6-extension/<v>), the
 * Marketplace VSIX from the public gallery endpoint (after confirming the version
 * through extensionquery), npm's tarball of pinescript-v6-validator@<engine-version>.
 * A channel that cannot be downloaded is a FAIL. `--skip-channel github|openvsx|
 * marketplace|npm` waives one explicitly, and the waiver is printed in the result.
 *
 * Each copy gets the inspection of scripts/inspect-artefacts.js against a clean
 * export of --ref: listing validated before extraction, exact expected set, no
 * sync-conflict copies / dotfiles / sources / tests, SHA-256, and a run. Then every
 * VSIX channel must carry the same file list and per-file SHA-256 as the others and
 * as the pre-release record (archive bytes may differ; zip timestamps are not
 * content), and the npm tarball must also match the record's archive SHA-256
 * (scripts/publish-engine.sh publishes the very tarball it inspected). Exit 1 on any
 * mismatch or failure; exit 2 on a refused or missing --pre.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const A = require('./lib/artefacts');
const N = require('./lib/npm'); // the only way to spawn npm (test/npm-guard.test.js)
const { checkPreRecord } = require('./lib/publish-policy');

const EXT = { publisher: 'jpantsjoha', name: 'pinescript-v6-extension' };
const CHANNELS = ['github', 'openvsx', 'marketplace', 'npm'];

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : undefined;
}
function args(argv, name) {
  return argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));
}

/** Same file list and per-file hashes? Returns the differences as strings. */
function diffContents(a, b, label) {
  const out = [];
  const an = Object.keys(a.files);
  const bn = Object.keys(b.files);
  for (const n of bn.filter(n => !(n in a.files))) out.push(`${label}: extra file ${n}`);
  for (const n of an.filter(n => !(n in b.files))) out.push(`${label}: missing file ${n}`);
  for (const n of an.filter(n => n in b.files)) {
    if (a.files[n].sha256 !== b.files[n].sha256) out.push(`${label}: content differs: ${n}`);
  }
  return out;
}

/**
 * Load and bind the pre-release record. Returns { pre } or { refused: reason }.
 * `treeOf(ref)` resolves a ref to its tree SHA.
 */
function bindPre(prePath, { extVersion, engineVersion, ref }, treeOf) {
  if (!prePath) return { refused: '--pre <inspection.json> is required (written by scripts/inspect-artefacts.js)' };
  let pre;
  try {
    pre = JSON.parse(fs.readFileSync(prePath, 'utf8'));
  } catch (e) {
    return { refused: `cannot read the pre-release record ${prePath}: ${e.message}` };
  }
  // Only a complete PASS inspection binds: a record whose inspection failed, lacks an
  // artefact being verified, or lacks hashes or a successful run is refused.
  const kinds = [...(extVersion ? ['vsix'] : []), ...(engineVersion ? ['npm'] : [])];
  const problems = checkPreRecord(pre, kinds);
  if (problems.length) return { refused: `${prePath} is not a complete PASS inspection: ${problems.join('; ')}` };
  const rec = pre.record;
  if (extVersion && rec.extensionVersion !== extVersion) {
    return { refused: `the record inspected extension ${rec.extensionVersion}, not ${extVersion}` };
  }
  if (engineVersion && rec.engineVersion !== engineVersion) {
    return { refused: `the record inspected engine ${rec.engineVersion}, not ${engineVersion}` };
  }
  // The ref whose tree must equal the record's: --ref, else the release tag; for an
  // engine-only check (no tag) the record's own commit, else origin/main, else HEAD —
  // the pre-squash commit may not exist in a fresh clone, the tree does.
  const candidates = ref ? [ref] : extVersion ? [`v${extVersion}`] : [rec.sha, 'origin/main', 'HEAD'];
  const seen = [];
  for (const candidate of candidates) {
    let tree;
    try {
      tree = treeOf(candidate);
    } catch (e) {
      seen.push(`${candidate}: cannot resolve`);
      continue;
    }
    if (tree === rec.tree) return { pre, ref: candidate };
    seen.push(`${candidate}: tree ${tree}`);
  }
  return { refused: `the record's tree ${rec.tree} (commit ${rec.sha}) is not the tree of ${candidates.join(' / ')} (${seen.join('; ')})` };
}

const realDeps = () => ({
  fetch: globalThis.fetch,
  sh: A.sh,
  npm: N.npm,
  exportRef: A.exportRef,
  inspect: A.inspect,
  treeOf: ref => A.sh('git', ['rev-parse', `${ref}^{tree}`], { cwd: A.REPO }).trim(),
  log: s => console.log(s),
  err: s => console.error(s),
});

async function download(fetchFn, url, file) {
  const res = await fetchFn(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  let buf = Buffer.from(await res.arrayBuffer());
  // The gallery may serve the package gzip-wrapped; unwrap to the zip.
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
  fs.writeFileSync(file, buf);
  return file;
}

const USAGE = 'usage: verify-published.js <ext-version> [--engine <v>] --pre <inspection.json> [--ref <ref>] [--skip-channel <name>]... [--out-dir <dir>]';

async function run(argv = process.argv.slice(2), deps = realDeps()) {
  if (argv.includes('--help') || argv.includes('-h')) {
    deps.log(USAGE);
    return 0;
  }
  const extVersion = argv[0] && !argv[0].startsWith('--') ? argv[0] : null;
  const engineVersion = arg(argv, '--engine');
  const skip = args(argv, '--skip-channel');
  if (!extVersion && !engineVersion) {
    deps.err(USAGE);
    return 2;
  }
  const badSkip = skip.filter(c => !CHANNELS.includes(c));
  if (badSkip.length) {
    deps.err(`verify-published: unknown --skip-channel ${badSkip.join(', ')} (one of ${CHANNELS.join(', ')})`);
    return 2;
  }
  const bound = bindPre(arg(argv, '--pre'), { extVersion, engineVersion, ref: arg(argv, '--ref') }, deps.treeOf);
  if (bound.refused) {
    deps.err(`verify-published: REFUSED — ${bound.refused}`);
    return 2;
  }
  const { pre, ref } = bound;

  const work = A.tempDir('verify-published-');
  const { sha, dir: root } = deps.exportRef(ref, path.join(work, 'export'));
  const records = [];
  const notes = [];
  const mismatches = [];
  const skipped = (channel, what) => {
    if (!skip.includes(channel)) return false;
    notes.push(`**SKIPPED by --skip-channel ${channel}**: ${what} was not downloaded, inspected or compared`);
    return true;
  };

  if (extVersion) {
    const channels = [];
    if (!skipped('github', `GitHub release v${extVersion}`)) {
      try {
        const d = path.join(work, 'github');
        fs.mkdirSync(d);
        deps.sh('gh', ['release', 'download', `v${extVersion}`, '-p', '*.vsix', '-D', d], { cwd: A.REPO });
        channels.push({ label: `GitHub release v${extVersion}`, file: A.singleAsset(d, '.vsix', 'release assets') });
      } catch (e) {
        mismatches.push(`GitHub release v${extVersion}: no VSIX downloaded (${String(e.stderr || e.message).trim().split('\n')[0]})`);
      }
    }
    if (!skipped('openvsx', `Open VSX ${extVersion}`)) {
      try {
        const res = await deps.fetch(`https://open-vsx.org/api/${EXT.publisher}/${EXT.name}/${extVersion}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const meta = await res.json();
        if (!meta.files || !meta.files.download) throw new Error(meta.error || 'no files.download');
        const d = path.join(work, 'openvsx');
        fs.mkdirSync(d);
        channels.push({ label: `Open VSX ${extVersion}`, file: await download(deps.fetch, meta.files.download, path.join(d, `${EXT.name}-${extVersion}.vsix`)) });
      } catch (e) {
        mismatches.push(`Open VSX ${extVersion}: no VSIX downloaded (${e.message})`);
      }
    }
    if (!skipped('marketplace', `Marketplace ${extVersion}`)) {
      try {
        const res = await deps.fetch('https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery', {
          method: 'POST',
          headers: { Accept: 'application/json;api-version=7.2-preview.1', 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: `${EXT.publisher}.${EXT.name}` }] }], flags: 0x1 | 0x2 | 0x10 | 0x80 | 0x100 }),
        });
        if (!res.ok) throw new Error(`extensionquery: HTTP ${res.status}`);
        const ext = (await res.json()).results[0].extensions[0];
        const versions = ext.versions.map(v => v.version);
        if (!versions.includes(extVersion)) throw new Error(`${extVersion} is not listed (latest ${versions[0]})`);
        notes.push(`Marketplace lists ${extVersion} (latest ${versions[0]})`);
        const d = path.join(work, 'marketplace');
        fs.mkdirSync(d);
        const url = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${EXT.publisher}/vsextensions/${EXT.name}/${extVersion}/vspackage`;
        channels.push({ label: `Marketplace ${extVersion}`, file: await download(deps.fetch, url, path.join(d, `${EXT.name}-${extVersion}.vsix`)) });
      } catch (e) {
        mismatches.push(`Marketplace ${extVersion}: ${e.message}`);
      }
    }
    for (const c of channels) {
      deps.err(`verify-published: inspecting ${c.label}…`);
      records.push(deps.inspect({ kind: 'vsix', file: c.file, root, label: c.label }));
    }
    const vsixRecords = records.filter(r => r.kind === 'vsix');
    for (const r of vsixRecords.slice(1)) {
      mismatches.push(...diffContents(vsixRecords[0], r, `${r.label} vs ${vsixRecords[0].label}`));
      if (r.sha256 !== vsixRecords[0].sha256) notes.push(`${r.label}: archive SHA-256 differs from ${vsixRecords[0].label}; file contents compared above`);
    }
  }

  if (engineVersion && !skipped('npm', `npm pinescript-v6-validator@${engineVersion}`)) {
    try {
      const d = path.join(work, 'npm');
      fs.mkdirSync(d);
      const name = deps.npm(['pack', `pinescript-v6-validator@${engineVersion}`, '--pack-destination', d], { cwd: d })
        .trim().split('\n').pop().trim();
      deps.err(`verify-published: inspecting npm pinescript-v6-validator@${engineVersion}…`);
      records.push(deps.inspect({ kind: 'npm', file: path.join(d, name), root, label: `npm pinescript-v6-validator@${engineVersion}` }));
    } catch (e) {
      mismatches.push(`npm pinescript-v6-validator@${engineVersion}: ${String(e.stderr || e.message).trim().split('\n')[0]}`);
    }
  }

  for (const r of records) {
    const p = pre.artefacts.find(a => a.kind === r.kind);
    if (!p) { mismatches.push(`${r.label}: no ${r.kind} artefact in the pre-release inspection`); continue; }
    mismatches.push(...diffContents(p, r, `${r.label} vs pre-release ${p.name}`));
    if (r.kind === 'npm' && r.sha256 !== p.sha256) {
      mismatches.push(`${r.label}: tarball SHA-256 ${r.sha256} differs from the inspected ${p.sha256}`);
    }
  }

  const meta = {
    'verified against': `${sha} (\`${ref}\`), tree ${pre.record.tree}`,
    'extension version': extVersion || '—',
    'engine version': engineVersion || '—',
    'pre-release inspection': `${path.basename(arg(argv, '--pre'))} (commit ${pre.record.sha})`,
    'skipped channels': skip.length ? `**${skip.join(', ')} (operator waiver)**` : 'none',
    date: new Date().toISOString().slice(0, 10),
  };
  let md = A.markdown('Published artefact verification', meta, records);
  if (notes.length) md += '\n\nNotes:\n' + notes.map(n => `- ${n}`).join('\n');
  md += '\n\n' + (mismatches.length
    ? `**Mismatches (${mismatches.length})**:\n` + mismatches.map(m => `- ${m}`).join('\n')
    : '**Mismatches**: none');
  const failed = mismatches.length || records.some(r => r.failures.length);
  md += `\n\n**verify-published: ${failed ? 'FAIL' : 'PASS'}**${skip.length ? ` — channels skipped: ${skip.join(', ')}` : ''}`;

  const outDir = A.refuseICloud(arg(argv, '--out-dir') || path.join(work, 'report'));
  fs.mkdirSync(outDir, { recursive: true });
  A.refuseICloud(outDir);
  fs.writeFileSync(path.join(outDir, 'published.md'), md + '\n');
  fs.writeFileSync(path.join(outDir, 'published.json'), JSON.stringify(A.toJson(records, { ...meta, sha, mismatches, skipped: skip }), null, 2) + '\n');
  deps.log(md);
  deps.log(`\nverify-published: report in ${outDir}`);
  fs.rmSync(path.join(work, 'export'), { recursive: true, force: true });
  return failed ? 1 : 0;
}

module.exports = { run, bindPre, diffContents, CHANNELS };

if (require.main === module) {
  run().then(code => process.exit(code), e => {
    console.error(`verify-published: FAIL — ${e.stack || e.message}`);
    process.exit(1);
  });
}
