/**
 * Shared inspection of release artefacts (the VSIX and the engine tarball), used by
 * scripts/inspect-artefacts.js (before go-live) and scripts/verify-published.js
 * (after). One inspection, two moments, so the two records are comparable.
 *
 * An inspection of one artefact answers:
 *   - what is in it: every file with its size and SHA-256, the archive's SHA-256;
 *   - is that exactly what should be in it: the expected set is derived from the
 *     source tree the artefact was built from (verify-vsix's allowlist for the VSIX,
 *     packages/validator/scripts/check-pack.js for the engine);
 *   - is anything in it that never belongs in a release: sync-conflict copies
 *     ("index 2.js"), dotfiles, TypeScript sources, source maps, tests, fixtures;
 *   - does it run: the VSIX's packaged activate() (verify-vsix), the engine tarball
 *     installed by name against the regression corpus (engine-tarball-smoke);
 *   - how does it differ from the previous release: count, size, files added/removed.
 */
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const { expectedFiles, compare: compareEngine } = require('../../packages/validator/scripts/check-pack.js');
const { checkListing } = require('../verify-vsix.js');

const ICLOUD = 'Mobile Documents';
const SIZE_FLAG = 0.10;

function refuseICloud(p) {
  if (p.includes(ICLOUD)) throw new Error(`refusing a path inside iCloud ("${ICLOUD}"): ${p}`);
  return p;
}

/** A fresh directory under the real temp dir, never inside iCloud. */
function tempDir(prefix) {
  const base = fs.realpathSync(os.tmpdir());
  return refuseICloud(fs.realpathSync(fs.mkdtempSync(path.join(base, prefix))));
}

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28, ...opts });
}

/** `git archive <ref>` of this repository into a fresh directory. */
function exportRef(ref, into) {
  const sha = sh('git', ['rev-parse', `${ref}^{commit}`], { cwd: REPO }).trim();
  const dir = refuseICloud(into || tempDir('artefact-export-'));
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('/bin/sh', ['-c', 'git archive --format=tar "$1" | tar -x -C "$2"', 'sh', sha, dir], { cwd: REPO });
  return { sha, dir };
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Every regular file in the archive -> { size, sha256 }. VSIX is zip; engine is .tgz. */
function contents(kind, file) {
  const dir = tempDir('artefact-unpack-');
  try {
    let names;
    if (kind === 'vsix') {
      names = sh('unzip', ['-Z1', file]).split('\n').filter(n => n && !n.endsWith('/'));
      sh('unzip', ['-q', '-o', file, '-d', dir]);
    } else {
      names = sh('tar', ['-tzf', file]).split('\n').filter(n => n && !n.endsWith('/'));
      sh('tar', ['-xzf', file, '-C', dir]);
    }
    const files = {};
    for (const name of names.sort()) {
      const abs = path.join(dir, name);
      const key = kind === 'vsix' ? name : name.replace(/^package\//, '');
      files[key] = { size: fs.statSync(abs).size, sha256: sha256(abs) };
    }
    return files;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Things that never belong in a release artefact, whatever the allowlist says. */
function hygiene(names) {
  const problems = [];
  for (const n of names) {
    const segs = n.split('/');
    const base = segs[segs.length - 1];
    // A conflict copy is reported once, as what it is ("index.d 2.ts" is not a source).
    if (/ \d+(\.|$)/.test(base)) { problems.push(`sync-conflict copy: ${n}`); continue; }
    if (segs.some(s => s.startsWith('.'))) problems.push(`dotfile: ${n}`);
    if (/\.tsx?$/.test(base) && !/\.d\.ts$/.test(base)) problems.push(`TypeScript source: ${n}`);
    if (/\.map$/.test(base)) problems.push(`source map: ${n}`);
    if (/^tsconfig[^/]*\.json$/.test(base)) problems.push(`build config: ${n}`);
    if (/\.pine$/.test(base)) problems.push(`Pine fixture: ${n}`);
    if (segs.slice(0, -1).some(s => /^(test|tests|__tests__|coverage|examples)$/.test(s)) || /\.test\.[jt]s$/.test(base)) {
      problems.push(`test or fixture: ${n}`);
    }
  }
  return problems;
}

/** Listing against the exact expected set, derived from the source tree `root`. */
function expectedSetFailures(kind, file, root, names) {
  if (kind === 'vsix') return checkListing(file, root).failures;
  const { expected, problems } = expectedFiles(path.join(root, 'packages', 'validator'));
  const r = compareEngine(expected, names, problems);
  return [
    ...r.extra.map(f => `not in the expected set: ${f}`),
    ...r.missing.map(f => `missing from the package: ${f}`),
    ...r.problems,
    ...(r.extra.length || r.missing.length ? [`packed ${names.length} files, expected ${expected.length}`] : []),
  ];
}

/** Install or activate the artefact. Runs the checker from `root` when it has one. */
function runArtefact(kind, file, root) {
  const script = kind === 'vsix'
    ? [path.join(REPO, 'scripts', 'verify-vsix.js'), file, '--root', root]
    : [path.join(REPO, 'scripts', 'engine-tarball-smoke.js'), file,
      '--corpus', fs.existsSync(path.join(root, 'test', 'regression-corpus.js'))
        ? path.join(root, 'test', 'regression-corpus.js')
        : path.join(REPO, 'test', 'regression-corpus.js')];
  const r = spawnSync(process.execPath, script, { encoding: 'utf8', maxBuffer: 1 << 26 });
  const output = `${r.stdout || ''}${r.stderr || ''}`.trim();
  const summary = output.split('\n').filter(l => /^(verify-vsix|engine-tarball-smoke):/.test(l)).slice(-2).join(' / ');
  return { ok: r.status === 0, summary: summary || output.split('\n').slice(-1)[0], output };
}

/** Difference from a previous artefact of the same kind. Flags are for the reflection. */
function comparePrevious(cur, prev) {
  const curNames = Object.keys(cur.files);
  const prevNames = Object.keys(prev.files);
  const added = curNames.filter(n => !(n in prev.files));
  const removed = prevNames.filter(n => !(n in cur.files));
  // Same name, different bytes: expected in any release with code changes; reported, not flagged.
  const changed = curNames.filter(n => n in prev.files && prev.files[n].sha256 !== cur.files[n].sha256);
  const sizeDelta = prev.size ? (cur.size - prev.size) / prev.size : 0;
  const flags = [];
  if (Math.abs(sizeDelta) > SIZE_FLAG) {
    flags.push(`size ${fmtBytes(prev.size)} -> ${fmtBytes(cur.size)} (${pct(sizeDelta)}), over the ${SIZE_FLAG * 100}% threshold`);
  }
  if (curNames.length !== prevNames.length) flags.push(`file count ${prevNames.length} -> ${curNames.length}`);
  const prevDirty = new Map(hygiene(prevNames).map(p => [p.slice(p.indexOf(": ") + 2), p.slice(0, p.indexOf(": "))]));
  for (const n of added) flags.push(`added: ${n}`);
  for (const n of removed) flags.push(prevDirty.has(n) ? `removed: ${n} (the previous release shipped a ${prevDirty.get(n)})` : `removed: ${n}`);
  for (const [n, what] of prevDirty) if (!removed.includes(n)) flags.push(`previous release carried a ${what}, still present: ${n}`);
  return { name: prev.name, count: prevNames.length, size: prev.size, sha256: prev.sha256, sizeDelta, added, removed, changed, flags };
}

/**
 * Inspect one artefact. `root` is the export it should have been built from.
 * Returns a record; `failures` non-empty means it must not ship (or did not ship right).
 */
function inspect({ kind, file, root, label, run = true }) {
  const files = contents(kind, file);
  const names = Object.keys(files);
  const record = {
    kind, label: label || kind, name: path.basename(file), file,
    size: fs.statSync(file).size, sha256: sha256(file), count: names.length, files,
    failures: [], flags: [], run: null, previous: null,
  };
  const dirty = hygiene(names);
  // One line per offending file: a file already named by the hygiene check is not
  // repeated as "not in the expected set".
  const named = new Set(dirty.map(p => p.slice(p.indexOf(": ") + 2)));
  const listing = expectedSetFailures(kind, file, root, names)
    .filter(f => ![...named].some(n => f.endsWith(n)));
  record.failures.push(...dirty, ...listing);
  if (run) {
    record.run = runArtefact(kind, file, root);
    if (!record.run.ok) record.failures.push(`run failed: ${record.run.summary}`);
  }
  return record;
}

/** Load a previous artefact's listing (no run, no expected-set check: it is history). */
function describe(kind, file) {
  return { kind, name: path.basename(file), size: fs.statSync(file).size, sha256: sha256(file), files: contents(kind, file) };
}

const fmtBytes = n => (n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`);
const pct = x => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

/** The markdown block for a release PR. */
function markdown(title, meta, records) {
  const out = [`### ${title}`, ''];
  for (const [k, v] of Object.entries(meta)) out.push(`- **${k}**: ${v}`);
  out.push('', '| Artefact | Files | Size | SHA-256 | Listing | Runs | vs previous |', '|---|---|---|---|---|---|---|');
  for (const r of records) {
    const listing = r.failures.filter(f => !f.startsWith('run failed')).length ? `FAIL (${r.failures.length})` : 'exact';
    const runs = r.run ? (r.run.ok ? 'PASS' : 'FAIL') : 'not run';
    const prev = r.previous
      ? `${r.previous.name}: ${r.previous.count} files, ${fmtBytes(r.previous.size)} (${pct(r.previous.sizeDelta)}); ${r.previous.flags.length} flag(s)`
      : 'none';
    out.push(`| ${r.label} \`${r.name}\` | ${r.count} | ${fmtBytes(r.size)} | \`${r.sha256.slice(0, 16)}…\` | ${listing} | ${runs} | ${prev} |`);
  }
  for (const r of records) {
    out.push('', `**${r.label}** \`${r.name}\` — sha256 \`${r.sha256}\``);
    if (r.run) out.push(`- run: ${r.run.ok ? 'PASS' : 'FAIL'} — ${r.run.summary}`);
    if (r.failures.length) for (const f of r.failures) out.push(`- FAIL: ${f}`);
    else out.push('- listing: exactly the expected set; no conflict copies, dotfiles, sources or tests');
    for (const f of r.flags) out.push(`- FLAG: ${f}`);
    if (r.previous) {
      if (r.previous.flags.length) for (const f of r.previous.flags) out.push(`- FLAG vs ${r.previous.name}: ${f}`);
      else out.push(`- vs ${r.previous.name}: same file list, size within ${SIZE_FLAG * 100}%`);
      out.push(`- vs ${r.previous.name}: ${r.previous.changed.length} file(s) with changed content${r.previous.changed.length ? `: ${r.previous.changed.join(", ")}` : ""}`);
    }
  }
  const failed = records.some(r => r.failures.length);
  const flagged = records.some(r => r.flags.length || (r.previous && r.previous.flags.length));
  out.push('', `**Result: ${failed ? 'FAIL' : 'PASS'}**${flagged ? ' — every FLAG needs a written answer in the pre-go-live reflection' : ''}`);
  return out.join('\n');
}

/** A JSON-safe record (no local paths, no process output) for later comparison. */
function toJson(records, meta) {
  return {
    meta,
    artefacts: records.map(r => ({
      kind: r.kind, label: r.label, name: r.name, size: r.size, sha256: r.sha256, count: r.count,
      files: r.files, failures: r.failures, run: r.run && { ok: r.run.ok, summary: r.run.summary },
    })),
  };
}

module.exports = {
  REPO, refuseICloud, tempDir, sh, exportRef, sha256, contents, hygiene,
  inspect, describe, comparePrevious, markdown, toJson, fmtBytes,
};
