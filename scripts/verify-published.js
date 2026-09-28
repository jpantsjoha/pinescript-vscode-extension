#!/usr/bin/env node
/**
 * Post-release verification: inspect what ACTUALLY went live.
 *
 *   node scripts/verify-published.js <ext-version> [--engine <engine-version>]
 *        [--pre <inspection.json>] [--ref <git-ref>] [--out-dir <dir>]
 *   node scripts/verify-published.js --engine <engine-version>     # engine only
 *
 * Downloads every published copy:
 *   - the GitHub release VSIX of v<ext-version>;
 *   - the Open VSX file (files.download of open-vsx.org/api/jpantsjoha/pinescript-v6-extension/<v>);
 *   - the Marketplace VSIX from the public gallery endpoint, when it serves one without
 *     auth (optional), after confirming the version through the extensionquery API;
 *   - npm's tarball of pinescript-v6-validator@<engine-version> (`npm pack`).
 * Each copy gets the same inspection as scripts/inspect-artefacts.js, against a clean
 * export of --ref (default: tag v<ext-version>, or HEAD for engine-only): exact
 * expected set, no sync-conflict copies / dotfiles / sources / tests, SHA-256, and a
 * run (packaged activate(); regression corpus from the installed tarball).
 *
 * Then it compares: every VSIX channel must carry the same file list with the same
 * per-file SHA-256 (archive bytes may differ; zip timestamps are not content), and
 * with --pre, every published artefact must match the pre-release inspection's file
 * list and per-file hashes (and, for the engine tarball, its archive SHA-256 — the
 * publish script uploads the very tarball it inspected). Exit 1 on any mismatch.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./lib/artefacts');

const EXT = { publisher: 'jpantsjoha', name: 'pinescript-v6-extension' };

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function download(url, file) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

async function marketplaceVersion(version) {
  const res = await fetch('https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery', {
    method: 'POST',
    headers: { Accept: 'application/json;api-version=7.2-preview.1', 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: `${EXT.publisher}.${EXT.name}` }] }], flags: 0x1 | 0x2 | 0x10 | 0x80 | 0x100 }),
  });
  if (!res.ok) throw new Error(`extensionquery: HTTP ${res.status}`);
  const ext = (await res.json()).results[0].extensions[0];
  const versions = ext.versions.map(v => v.version);
  return { listed: versions.includes(version), latest: versions[0] };
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

async function main() {
  const extVersion = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
  const engineVersion = arg('--engine');
  if (!extVersion && !engineVersion) {
    console.error('usage: verify-published.js <ext-version> [--engine <v>] [--pre <inspection.json>] [--ref <ref>]');
    return 2;
  }
  const work = A.tempDir('verify-published-');
  const ref = arg('--ref') || (extVersion ? `v${extVersion}` : 'HEAD');
  const { sha, dir: root } = A.exportRef(ref, path.join(work, 'export'));
  // The export needs its own build only for verify-vsix's allowlist inputs (sources),
  // which are read from the tree; nothing is compiled.
  const records = [];
  const notes = [];
  const mismatches = [];

  if (extVersion) {
    const channels = [];
    try {
      const d = path.join(work, 'github');
      fs.mkdirSync(d);
      A.sh('gh', ['release', 'download', `v${extVersion}`, '-p', '*.vsix', '-D', d], { cwd: A.REPO });
      channels.push({ label: `GitHub release v${extVersion}`, file: path.join(d, fs.readdirSync(d).find(f => f.endsWith('.vsix'))) });
    } catch (e) {
      mismatches.push(`GitHub release v${extVersion}: no VSIX downloaded (${String(e.stderr || e.message).split('\n')[0]})`);
    }
    try {
      const meta = await (await fetch(`https://open-vsx.org/api/${EXT.publisher}/${EXT.name}/${extVersion}`)).json();
      if (!meta.files || !meta.files.download) throw new Error(meta.error || 'no files.download');
      const d = path.join(work, 'openvsx');
      fs.mkdirSync(d);
      channels.push({ label: `Open VSX ${extVersion}`, file: await download(meta.files.download, path.join(d, `${EXT.name}-${extVersion}.vsix`)) });
    } catch (e) {
      mismatches.push(`Open VSX ${extVersion}: ${e.message}`);
    }
    try {
      const mp = await marketplaceVersion(extVersion);
      if (!mp.listed) mismatches.push(`Marketplace: ${extVersion} is not listed (latest ${mp.latest})`);
      else notes.push(`Marketplace lists ${extVersion} (latest ${mp.latest})`);
      try {
        const d = path.join(work, 'marketplace');
        fs.mkdirSync(d);
        const url = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${EXT.publisher}/vsextensions/${EXT.name}/${extVersion}/vspackage`;
        const file = await download(url, path.join(d, `${EXT.name}-${extVersion}.vsix`));
        // The gallery may serve the package gzip-wrapped; unwrap to the zip.
        const buf = fs.readFileSync(file);
        if (buf[0] === 0x1f && buf[1] === 0x8b) fs.writeFileSync(file, require('zlib').gunzipSync(buf));
        channels.push({ label: `Marketplace ${extVersion}`, file });
      } catch (e) {
        notes.push(`Marketplace VSIX not downloaded (optional): ${e.message}`);
      }
    } catch (e) {
      mismatches.push(`Marketplace: version query failed (${e.message})`);
    }
    for (const c of channels) {
      console.error(`verify-published: inspecting ${c.label}…`);
      records.push(A.inspect({ kind: 'vsix', file: c.file, root, label: c.label }));
    }
    const vsixRecords = records.filter(r => r.kind === 'vsix');
    for (const r of vsixRecords.slice(1)) {
      mismatches.push(...diffContents(vsixRecords[0], r, `${r.label} vs ${vsixRecords[0].label}`));
      if (r.sha256 !== vsixRecords[0].sha256) notes.push(`${r.label}: archive SHA-256 differs from ${vsixRecords[0].label}; file contents compared above`);
    }
  }

  if (engineVersion) {
    try {
      const d = path.join(work, 'npm');
      fs.mkdirSync(d);
      const name = A.sh('npm', ['pack', `pinescript-v6-validator@${engineVersion}`, '--pack-destination', d], { cwd: d })
        .trim().split('\n').pop().trim();
      console.error(`verify-published: inspecting npm pinescript-v6-validator@${engineVersion}…`);
      records.push(A.inspect({ kind: 'npm', file: path.join(d, name), root, label: `npm pinescript-v6-validator@${engineVersion}` }));
    } catch (e) {
      mismatches.push(`npm pinescript-v6-validator@${engineVersion}: ${String(e.stderr || e.message).split('\n')[0]}`);
    }
  }

  const prePath = arg('--pre');
  if (prePath) {
    const pre = JSON.parse(fs.readFileSync(prePath, 'utf8'));
    for (const r of records) {
      const p = pre.artefacts.find(a => a.kind === r.kind);
      if (!p) { mismatches.push(`${r.label}: no ${r.kind} artefact in the pre-release inspection`); continue; }
      mismatches.push(...diffContents(p, r, `${r.label} vs pre-release ${p.name}`));
      if (r.kind === 'npm' && r.sha256 !== p.sha256) {
        mismatches.push(`${r.label}: tarball SHA-256 ${r.sha256} differs from the inspected ${p.sha256}`);
      }
    }
  }

  const meta = {
    'verified against': `${sha} (\`${ref}\`)`,
    'extension version': extVersion || '—',
    'engine version': engineVersion || '—',
    'pre-release inspection': prePath ? path.basename(prePath) : 'not given (channels compared with each other only)',
    date: new Date().toISOString().slice(0, 10),
  };
  let md = A.markdown('Published artefact verification', meta, records);
  if (notes.length) md += '\n\nNotes:\n' + notes.map(n => `- ${n}`).join('\n');
  md += '\n\n' + (mismatches.length
    ? `**Mismatches (${mismatches.length})**:\n` + mismatches.map(m => `- ${m}`).join('\n')
    : '**Mismatches**: none');
  const failed = mismatches.length || records.some(r => r.failures.length);
  md += `\n\n**verify-published: ${failed ? 'FAIL' : 'PASS'}**`;

  const outDir = A.refuseICloud(path.resolve(arg('--out-dir') || path.join(work, 'report')));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'published.md'), md + '\n');
  fs.writeFileSync(path.join(outDir, 'published.json'), JSON.stringify(A.toJson(records, { ...meta, sha, mismatches }), null, 2) + '\n');
  console.log(md);
  console.log(`\nverify-published: report in ${outDir}`);
  fs.rmSync(path.join(work, 'export'), { recursive: true, force: true });
  return failed ? 1 : 0;
}

if (require.main === module) {
  main().then(code => process.exit(code), e => {
    console.error(`verify-published: FAIL — ${e.stack || e.message}`);
    process.exit(1);
  });
}
