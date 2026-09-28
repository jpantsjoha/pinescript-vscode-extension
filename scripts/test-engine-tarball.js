#!/usr/bin/env node
/** Install an engine tarball into a temporary consumer and run the regression corpus. */
'use strict';

const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CASES, SUPPRESSION_CASES } = require('../test/regression-corpus.js');

const tarballArg = process.argv[2];
if (!tarballArg || tarballArg === '--help' || tarballArg === '-h') {
  console.log('usage: node scripts/test-engine-tarball.js <pinescript-v6-validator.tgz>');
  process.exitCode = tarballArg ? 0 : 1;
} else {
  const tarball = path.resolve(tarballArg);
  if (!fs.existsSync(tarball)) throw new Error(`tarball not found: ${tarball}`);

  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'pine-engine-tarball-'));
  try {
    fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({
      name: 'engine-tarball-consumer',
      version: '1.0.0',
      private: true,
    }, null, 2));

    execFileSync('npm', [
      'install', tarball, '--ignore-scripts', '--no-audit', '--no-fund',
      '--registry', 'https://registry.npmjs.org/',
    ], {
      cwd: workspace,
      stdio: 'inherit',
      env: { ...process.env, npm_config_cache: path.join(workspace, '.npm-cache') },
    });

    const packageName = 'pinescript-v6-validator';
    const installed = require(require.resolve(packageName, { paths: [workspace] }));
    let count = 0;
    for (const entry of [...CASES, ...SUPPRESSION_CASES]) {
      const diagnostics = installed.validatePineScript(entry.code);
      const ids = diagnostics.map(result =>
        result.checkId || (result.severity === 0 ? 'error' : 'warn'));

      if (entry.expect === null) {
        const real = diagnostics.filter(result =>
          result.checkId || result.severity === 0 || result.severity === 1);
        assert.strictEqual(real.length, 0,
          `${entry.name}: correct code produced ${ids.join(', ') || '(nothing)'}`);
      } else {
        assert.ok(ids.includes(entry.expect),
          `${entry.name}: expected ${entry.expect}; got ${ids.join(', ') || '(nothing)'}`);
      }
      count++;
    }

    console.log(`engine tarball corpus: PASS — ${count}/${count} cases`);
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}
