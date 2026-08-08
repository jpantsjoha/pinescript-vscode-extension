/**
 * The published artefact, not the source tree.
 *
 * This packs `packages/validator` exactly as `npm publish` would, installs the
 * tarball into a throwaway project, and drives it through its public entry point —
 * `require('pinescript-v6-validator')` — with no path into this repository.
 *
 * WHY A SEPARATE SUITE
 *
 * Every recurring failure in this project's history has had the same shape: correct
 * in `src/`, broken in the thing users actually receive.
 *
 *   - doc anchors that resolved against the source registry and were dead in the
 *     shipped package, because the package had not been rebuilt
 *   - a VSIX that died at activation because the engine was excluded from the bundle
 *   - a local scratchpad path that leaked into a dependency range during testing,
 *     which would have made `npm install` fail for everyone
 *   - an MCP manifest declaring a server file that did not exist, which passed
 *     schema validation cleanly
 *
 * No suite that imports from `packages/validator/dist` can see any of those. This
 * one can, because it deliberately throws that access away.
 *
 * It runs the SAME corpus as test/regression-corpus.test.js. One table, two
 * environments: source and published cannot drift, because there is nothing to drift.
 *
 * COST: one `npm pack` plus one offline `npm install`, a few seconds. Set
 * SKIP_PACKAGE_TEST=1 to skip it during a tight edit loop — but never in CI, and
 * never before a release.
 */

'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CASES, SUPPRESSION_CASES } = require('./regression-corpus.js');

const PACKAGE_DIR = path.join(__dirname, '..', 'packages', 'validator');
const PACKAGE_NAME = 'pinescript-v6-validator';
const SKIP = process.env.SKIP_PACKAGE_TEST === '1';

let workspace = null;
/** The module object, obtained by name from the installed package. */
let installed = null;
/** package.json as it exists INSIDE the tarball. */
let publishedManifest = null;

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('Published npm package', { skip: SKIP && 'SKIP_PACKAGE_TEST=1' }, () => {
  before(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'pine-pkg-'));

    // Build first. Packing a stale dist/ is precisely the drift this suite exists
    // to catch, and it would produce a confusing pass rather than a useful failure.
    run('npm', ['run', 'build'], PACKAGE_DIR);

    const packed = run('npm', ['pack', '--pack-destination', workspace], PACKAGE_DIR)
      .trim().split('\n').pop().trim();
    const tarball = path.join(workspace, packed);

    fs.writeFileSync(
      path.join(workspace, 'package.json'),
      JSON.stringify({ name: 'consumer', version: '1.0.0', private: true }, null, 2)
    );

    run('npm', ['install', tarball, '--no-audit', '--no-fund'], workspace);

    const installedDir = path.join(workspace, 'node_modules', PACKAGE_NAME);
    publishedManifest = JSON.parse(
      fs.readFileSync(path.join(installedDir, 'package.json'), 'utf8')
    );

    // By NAME, resolved from the consumer project — the same resolution a user gets.
    installed = require(require.resolve(PACKAGE_NAME, { paths: [workspace] }));
  }, { timeout: 300000 });

  after(() => {
    if (workspace) fs.rmSync(workspace, { recursive: true, force: true });
  });

  //────────────────────────────────────────────────────────
  // The package installs and presents its API
  //────────────────────────────────────────────────────────

  test('installs from a tarball and loads by name', () => {
    assert.ok(installed, 'require() by package name must resolve');
  });

  test('exports everything downstream code depends on', () => {
    // The extension and the MCP server both consume these. Dropping one is a major
    // break that a source-tree test would never notice.
    for (const name of [
      'validatePineScript', 'runSemanticChecks', 'runDocumentChecks',
      'AccurateValidator', 'SEMANTIC_CHECKS', 'Severity',
      'extractSuppressions', 'applySuppressions',
      'blankComments', 'blankStrings', 'PINE_FUNCTIONS_MERGED',
    ]) {
      assert.ok(name in installed, `the published package must export ${name}`);
    }
  });

  test('ships type declarations alongside the entry point', () => {
    const dir = path.join(workspace, 'node_modules', PACKAGE_NAME);
    assert.ok(fs.existsSync(path.join(dir, publishedManifest.main)),
      `main "${publishedManifest.main}" is missing from the tarball`);
    assert.ok(fs.existsSync(path.join(dir, publishedManifest.types)),
      `types "${publishedManifest.types}" is missing from the tarball`);
  });

  //────────────────────────────────────────────────────────
  // The manifest is publishable
  //────────────────────────────────────────────────────────

  test('no dependency in ANY manifest resolves to a local path', () => {
    // `npm install ./some.tgz` rewrites package.json in place. Committing that ships
    // something nobody else can install and leaks a local directory layout. It has
    // happened here: a scratchpad tarball path landed in a dependency range during
    // testing and was caught by eye, not by a gate.
    //
    // Checking only the published manifest would be vacuous — the engine has no
    // dependencies at all, so that assertion could never fail. The risk lives in the
    // CONSUMERS, so every manifest in the repo is checked.
    const manifests = [
      path.join(__dirname, '..', 'package.json'),
      path.join(PACKAGE_DIR, 'package.json'),
    ];

    const offenders = [];
    for (const file of manifests) {
      if (!fs.existsSync(file)) continue;
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      const deps = {
        ...(manifest.dependencies || {}),
        ...(manifest.devDependencies || {}),
        ...(manifest.peerDependencies || {}),
      };
      for (const [name, range] of Object.entries(deps)) {
        if (/^(file:|link:|\/|\.\.?\/)/.test(String(range))) {
          offenders.push(`${path.basename(path.dirname(file))}/package.json: ${name} -> ${range}`);
        }
      }
    }
    assert.deepStrictEqual(offenders, [],
      'a dependency points at a local path and would break `npm install` for users');
  });

  test('the extension depends on a version of the engine that exists', () => {
    // The extension bundles the engine into dist/engine at build time. A pin ahead of
    // what is published produces a VSIX whose engine cannot be installed, which is
    // only discovered at activation — on a user's machine.
    const root = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );
    const pin = (root.dependencies || {})[PACKAGE_NAME];
    assert.ok(pin, 'the extension must depend on the engine explicitly');

    const wanted = pin.replace(/^[\^~]/, '');
    const [wantMajor, wantMinor] = wanted.split('.').map(Number);
    const [haveMajor, haveMinor] = publishedManifest.version.split('.').map(Number);

    assert.ok(
      haveMajor > wantMajor || (haveMajor === wantMajor && haveMinor >= wantMinor),
      `the extension pins ${pin} but the engine in this tree is ` +
      `${publishedManifest.version} — publish the engine before the extension`
    );
  });

  test('the tarball carries no absolute path from this machine', () => {
    const dir = path.join(workspace, 'node_modules', PACKAGE_NAME);
    const offenders = [];
    const walk = current => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!/\.(js|json|d\.ts|md)$/.test(entry.name)) continue;
        const text = fs.readFileSync(full, 'utf8');
        if (/\/Users\/|\/home\/[a-z]|[A-Z]:\\\\Users/.test(text)) {
          offenders.push(path.relative(dir, full));
        }
      }
    };
    walk(dir);
    assert.deepStrictEqual(offenders, [],
      'these published files embed an absolute path from the build machine');
  });

  test('declares a version, a licence and a repository', () => {
    assert.match(publishedManifest.version, /^\d+\.\d+\.\d+/, 'version');
    assert.ok(publishedManifest.license, 'licence');
    assert.ok(publishedManifest.repository, 'repository');
  });

  //────────────────────────────────────────────────────────
  // The regression corpus, against the published artefact
  //────────────────────────────────────────────────────────

  describe('regression corpus', () => {
    for (const entry of [...CASES, ...SUPPRESSION_CASES]) {
      test(entry.name, () => {
        const diagnostics = installed.validatePineScript(entry.code);
        const ids = diagnostics.map(
          d => d.checkId || (d.severity === 0 ? 'error' : 'warn')
        );
        const context =
          `\n\n  Regression found ${entry.found}\n  ${entry.why}` +
          `\n\n  Got: ${ids.join(', ') || '(nothing)'}` +
          `\n\n  This ran against the PUBLISHED package. If the same case passes in` +
          `\n  test/regression-corpus.test.js, the source is right and the build or` +
          `\n  the "files" field is wrong.`;

        if (entry.expect === null) {
          const real = diagnostics.filter(d => d.checkId || d.severity === 0);
          assert.strictEqual(real.length, 0,
            'This code is CORRECT and must produce no findings.' + context);
        } else {
          assert.ok(ids.includes(entry.expect), `Expected ${entry.expect}.` + context);
        }
      });
    }
  });

  //────────────────────────────────────────────────────────
  // The check registry survives publication
  //────────────────────────────────────────────────────────

  test('every semantic check reaches consumers with its metadata intact', () => {
    const registry = installed.SEMANTIC_CHECKS;
    assert.deepStrictEqual(Object.keys(registry).sort(),
      ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']);

    for (const [id, check] of Object.entries(registry)) {
      assert.strictEqual(check.id, id);
      assert.ok(check.title && check.title.length > 15, `${id}: title`);
      // Resolution against real headings is enforced by `make anchors` in the
      // plugin repo, which owns the skills. Here we only prove the field survived
      // the build — the anchors were once correct in src/ and dead in the package.
      const [skill, anchor] = String(check.docAnchor || '').split('#');
      assert.match(skill, /^pinescript-[a-z0-9]+$/, `${id}: docAnchor skill`);
      assert.ok(anchor && anchor.length > 3, `${id}: docAnchor section`);
    }
  });

  test('the published version matches the working tree', () => {
    const local = JSON.parse(
      fs.readFileSync(path.join(PACKAGE_DIR, 'package.json'), 'utf8')
    );
    assert.strictEqual(publishedManifest.version, local.version,
      'the packed tarball is not built from the current package.json');
  });
});
