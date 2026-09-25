/**
 * Single engine — there is ONE validator and ONE dataset, and no copies.
 *
 * ADR-0001 says a check is written once, in the engine. Until issue #55 that held
 * only for the semantic checks: `src/parser/accurateValidator.ts`,
 * `src/parser/documentChecks.ts` and six `v6/` data files were near-identical
 * copies of `packages/validator`, kept in step by a parity test. Two copies drift,
 * and a drifted copy means the editor and the agent disagree about the same file.
 *
 * Now the extension, IntelliSense, validate-cli.js, the MCP server and the tests
 * all load `dist/engine/`, which the build copies from the LOCAL compile of
 * `packages/validator`. This suite fails if a copy reappears, if anything imports
 * around the engine, or if the build goes back to shipping the published npm
 * package (npm 0.4.1 failed 27 of 107 regression cases the local source passed).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PKG_SRC = path.join(ROOT, 'packages/validator/src');
const PKG_DATA = path.join(ROOT, 'packages/validator/data');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const tsModules = dir => fs.readdirSync(dir).filter(f => f.endsWith('.ts')).map(f => f.replace(/\.ts$/, ''));
const rel = p => path.relative(ROOT, p);

test('single engine: no copy of an engine module exists outside packages/validator', () => {
  const engineNames = new Set([...tsModules(PKG_SRC), ...tsModules(PKG_DATA)]);
  const copies = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'v6'))]
    .filter(f => f.endsWith('.ts'))
    .filter(f => engineNames.has(path.basename(f, '.ts')));

  assert.deepStrictEqual(copies.map(rel), [],
    'An engine module has been copied back into the extension. Import it through ' +
    'src/engine.ts instead — a second copy is how the editor and the agent end up ' +
    'disagreeing about the same file.');
});

test('single engine: extension sources load the engine only through src/engine.ts', () => {
  const offenders = [];
  for (const file of walk(path.join(ROOT, 'src')).filter(f => f.endsWith('.ts'))) {
    const body = fs.readFileSync(file, 'utf8');
    const specifiers = [...body.matchAll(/(?:from\s+|require\()\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    for (const spec of specifiers) {
      const isEngineLoader = rel(file) === path.join('src', 'engine.ts');
      if (spec === 'pinescript-v6-validator' || spec.startsWith('pinescript-v6-validator/')) {
        offenders.push(`${rel(file)} -> ${spec} (published npm package)`);
      } else if (/packages\/validator/.test(spec) && !(isEngineLoader && /packages\/validator\/dist\//.test(spec))) {
        offenders.push(`${rel(file)} -> ${spec}`);
      } else if (/\/engine\//.test(spec) && !isEngineLoader) {
        offenders.push(`${rel(file)} -> ${spec}`);
      } else if (/\/v6\//.test(spec) && !/\/v6\/v6-manual$/.test(spec)) {
        offenders.push(`${rel(file)} -> ${spec} (reference data lives in the engine)`);
      }
    }
  }
  assert.deepStrictEqual(offenders, []);

  const loader = fs.readFileSync(path.join(ROOT, 'src/engine.ts'), 'utf8');
  assert.match(loader, /require\(['"]\.\.\/engine\/index\.js['"]\)/,
    'src/engine.ts must load the engine from dist/engine at runtime');
  // Only type imports from the package declarations: a value import would make
  // `tsc -p .` compile a second copy of the engine into dist/packages/.
  for (const m of loader.matchAll(/^import\s+(.*?)\s+from\s+'\.\.\/packages\/validator\/[^']+';$/gm)) {
    assert.match(m[1], /^type\b/, `src/engine.ts must use \`import type\` for the package: ${m[0]}`);
  }
  assert.doesNotMatch(loader, /^export\s+\{[^}]*\}\s+from\s+'\.\.\/packages/m,
    'src/engine.ts may only re-export TYPES from the package declarations');
});

test('single engine: the VSIX ships the local build, not the published npm package', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(!(manifest.dependencies || {})['pinescript-v6-validator'],
    'pinescript-v6-validator is a runtime dependency again. The extension loads ' +
    'dist/engine (the local build); a runtime dependency on the published package ' +
    'invites a build that ships last release\'s engine.');

  const build = manifest.scripts.build;
  assert.match(build, /tsc -p packages\/validator/, 'build must compile packages/validator');
  assert.match(build, /cp -R packages\/validator\/dist\/\* dist\/engine\//,
    'build must copy the LOCAL packages/validator build into dist/engine');
  assert.doesNotMatch(build, /node_modules\/pinescript-v6-validator/,
    'build must not copy the published npm engine into dist/engine');
});

test('single engine: dist/engine is byte-identical to the packages/validator build, and nothing ships twice', (t) => {
  const pkgDist = path.join(ROOT, 'packages/validator/dist');
  const engineDist = path.join(ROOT, 'dist/engine');
  if (!fs.existsSync(engineDist) || !fs.existsSync(pkgDist)) {
    t.skip('not built — run `npm run build` (npm test does)');
    return;
  }

  const listing = dir => walk(dir).map(f => path.relative(dir, f)).sort();
  assert.deepStrictEqual(listing(engineDist), listing(pkgDist),
    'dist/engine and packages/validator/dist list different files');
  const differing = listing(pkgDist).filter(f =>
    !fs.readFileSync(path.join(pkgDist, f)).equals(fs.readFileSync(path.join(engineDist, f))));
  assert.deepStrictEqual(differing, [], 'dist/engine differs from the local engine build');

  // The extension's own compile must not contain a second engine.
  const extensionOut = [...walk(path.join(ROOT, 'dist/src')), ...walk(path.join(ROOT, 'dist/v6')),
    ...walk(path.join(ROOT, 'dist/packages'))];
  const engineNames = new Set([...tsModules(PKG_SRC), ...tsModules(PKG_DATA), 'index']);
  const duplicated = extensionOut
    .filter(f => f.endsWith('.js'))
    .filter(f => rel(f).startsWith(path.join('dist', 'packages')) || engineNames.has(path.basename(f, '.js')));
  assert.deepStrictEqual(duplicated.map(rel), [], 'engine code compiled twice into dist/');
});
