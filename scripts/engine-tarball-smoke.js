#!/usr/bin/env node
/**
 * Run the regression corpus against a BUILT engine tarball, installed by name.
 *
 *   node scripts/engine-tarball-smoke.js <pinescript-v6-validator-X.Y.Z.tgz> [--corpus <file>]
 *
 * Installs the tarball into a throwaway consumer project outside this repository,
 * `require('pinescript-v6-validator')` from there, and runs every case in
 * test/regression-corpus.js (the same table test/npm-package.test.js runs). Used by
 * scripts/publish-engine.sh, scripts/inspect-artefacts.js and
 * scripts/verify-published.js, so the file that is published — or was published —
 * is the file that is exercised. `--corpus` runs another tree's corpus (the export of
 * a released tag). Exit 1 on any failing case.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PACKAGE_NAME = 'pinescript-v6-validator';

function smoke(tarball, corpus = path.join(__dirname, '..', 'test', 'regression-corpus.js')) {
  const { CASES, SUPPRESSION_CASES } = require(path.resolve(corpus));
  const workspace = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'engine-smoke-')));
  try {
    fs.writeFileSync(path.join(workspace, 'package.json'),
      JSON.stringify({ name: 'consumer', version: '1.0.0', private: true }));
    execFileSync('npm', ['install', path.resolve(tarball), '--no-audit', '--no-fund', '--ignore-scripts'],
      { cwd: workspace, stdio: ['ignore', 'pipe', 'pipe'] });
    const engine = require(require.resolve(PACKAGE_NAME, { paths: [workspace] }));
    const failures = [];
    const cases = [...CASES, ...SUPPRESSION_CASES];
    for (const entry of cases) {
      const diagnostics = engine.validatePineScript(entry.code);
      const ids = diagnostics.map(d => d.checkId || (d.severity === 0 ? 'error' : 'warn'));
      if (entry.expect === null) {
        const real = diagnostics.filter(d => d.checkId || d.severity === 0 || d.severity === 1);
        if (real.length) failures.push(`${entry.name}: must be silent, got ${ids.join(', ')}`);
      } else if (!ids.includes(entry.expect)) {
        failures.push(`${entry.name}: expected ${entry.expect}, got ${ids.join(', ') || '(nothing)'}`);
      }
    }
    const version = JSON.parse(fs.readFileSync(
      path.join(workspace, 'node_modules', PACKAGE_NAME, 'package.json'), 'utf8')).version;
    return { version, total: cases.length, passed: cases.length - failures.length, failures };
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

module.exports = { smoke };

if (require.main === module) {
  const tarball = process.argv[2];
  if (!tarball || !fs.existsSync(tarball)) {
    console.error(`engine-tarball-smoke: no tarball at ${tarball || '(none given)'}`);
    process.exit(1);
  }
  const at = process.argv.indexOf('--corpus');
  const r = smoke(tarball, at !== -1 ? process.argv[at + 1] : undefined);
  for (const f of r.failures) console.error(`  FAIL ${f}`);
  console.log(`engine-tarball-smoke: ${PACKAGE_NAME}@${r.version} installed from ${path.basename(tarball)}; ` +
    `regression corpus ${r.passed}/${r.total} passed`);
  process.exit(r.failures.length ? 1 : 0);
}
