/**
 * Engine parity — the extension's local copies must not drift from the package.
 *
 * ADR-0001 says a check is written once, in the engine. That holds for the
 * SEMANTIC checks, which the extension genuinely consumes. It does NOT yet hold
 * for the syntactic validator: `src/parser/accurateValidator.ts` and
 * `documentChecks.ts` are near-identical copies of the package sources, and
 * `v6/` duplicates `packages/validator/data/`.
 *
 * A code review caught the documentation claiming "consumed, never copied" while
 * two byte-identical files sat in the repo. Rather than assert the property, this
 * enforces it: if the copies diverge the build fails, and the agent and the editor
 * cannot end up disagreeing about the same file.
 *
 * The real fix is for the extension to import everything from the engine, as it
 * already does for semantic checks. Until then this is the guard.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/** Import paths legitimately differ between the two trees. */
function normalise(source) {
  return source
    .replace(/from '\.\.\/(?:\.\.\/v6|data)\//g, "from '<DATA>/")
    .replace(/\r\n/g, '\n')
    .trim();
}

const MIRRORED_MODULES = ['documentChecks', 'checkRegistry'];

for (const name of MIRRORED_MODULES) {
  test(`engine parity: src/parser/${name}.ts matches the package`, (t) => {
    const local = path.join(ROOT, 'src/parser', `${name}.ts`);
    const pkg = path.join(ROOT, 'packages/validator/src', `${name}.ts`);

    if (!fs.existsSync(local)) {
      t.skip(`${name} is not mirrored in the extension — nothing to drift`);
      return;
    }
    assert.ok(fs.existsSync(pkg), `package is missing ${name}.ts`);

    assert.strictEqual(
      normalise(fs.readFileSync(local, 'utf8')),
      normalise(fs.readFileSync(pkg, 'utf8')),
      `src/parser/${name}.ts has drifted from packages/validator/src/${name}.ts. ` +
      `Two copies of a check mean the editor and the agent can disagree about the ` +
      `same file — copy the package version over, or better, import it.`
    );
  });
}

test('engine parity: the v6 dataset matches the package data', () => {
  const dataDir = path.join(ROOT, 'packages/validator/data');
  const drifted = [];

  for (const file of fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'))) {
    const local = path.join(ROOT, 'v6', file);
    if (!fs.existsSync(local)) continue;
    const a = fs.readFileSync(local, 'utf8');
    const b = fs.readFileSync(path.join(dataDir, file), 'utf8');
    if (a !== b) drifted.push(file);
  }

  assert.deepStrictEqual(drifted, [],
    'The signature dataset exists in two places and they have diverged. The ' +
    'extension and the engine would then disagree about which parameters exist.');
});

test('engine parity: the extension consumes semantic checks rather than copying them', () => {
  // The one part of ADR-0001 that is genuinely satisfied — assert it stays that way.
  assert.ok(!fs.existsSync(path.join(ROOT, 'src/parser/semanticChecks.ts')),
    'Semantic checks must come from the engine, never be copied into src/parser/');

  const extension = fs.readFileSync(path.join(ROOT, 'src/extension.ts'), 'utf8');
  assert.match(extension, /require\(['"]\.\.\/engine\/index\.js['"]\)/,
    'extension.ts must load the semantic checks from the engine copy in dist/');
});
