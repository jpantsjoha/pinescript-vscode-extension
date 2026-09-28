/**
 * Negative tests for the release guards (#67): every one must FAIL CLOSED.
 *
 * Deterministic and offline. Archives are built byte by byte here (tar, gzip, zip),
 * network and CLI calls are injected fakes, so nothing depends on a registry, a
 * GitHub release or the machine's git state.
 *
 *   - check-pack compares multisets: a duplicate archive entry fails;
 *   - check-pack refuses build configuration it does not model;
 *   - archives are validated BEFORE extraction: traversal, absolute paths, symlinks,
 *     duplicates, npm entries outside package/ — refused and never unpacked;
 *   - a previous release that cannot be downloaded fails the inspection;
 *   - verify-published refuses a missing or mismatched --pre, fails on every channel
 *     it cannot download, and prints any --skip-channel waiver;
 *   - an iCloud location behind a symlink alias is still refused;
 *   - only a complete PASS record binds; --publish needs the exact origin/main tip and
 *     a record of its tree; the public registry is pinned with CLI precedence and a
 *     publishConfig redirect is refused; an ambiguous release (two VSIX assets) fails;
 *     literal files entries it cannot model are refused; archive names are compared in
 *     canonical form; --help runs nothing.
 */
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const checkPack = require('../packages/validator/scripts/check-pack.js');
const A = require('../scripts/lib/artefacts');
const { unsafeEntries, zipListing } = require('../scripts/verify-vsix.js');
const { attachPrevious } = require('../scripts/inspect-artefacts.js');
const verifyPublished = require('../scripts/verify-published.js');

const tmp = prefix => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
const HEX = c => c.repeat(64);

/** A complete PASS inspection record: one VSIX, one engine tarball, hashes, runs ok. */
const passArtefacts = () => [
  { kind: 'vsix', name: 'x.vsix', sha256: HEX('a'), files: { 'extension/package.json': { size: 2, sha256: HEX('b') } }, failures: [], run: { ok: true } },
  { kind: 'npm', name: 'x.tgz', sha256: HEX('c'), files: { 'package.json': { size: 2, sha256: HEX('d') } }, failures: [], run: { ok: true } },
];

//────────────────────────────────────────────────────────
// Archive builders (no tar/zip binaries involved in creating them)
//────────────────────────────────────────────────────────

/** A .tgz from [{ name, data, type: '0' file | '2' symlink, link }]. */
function makeTgz(file, entries) {
  const blocks = [];
  for (const e of entries) {
    const data = Buffer.from(e.data || '');
    const h = Buffer.alloc(512);
    const put = (str, off, len) => h.write(str, off, len, 'utf8');
    const oct = (n, len) => n.toString(8).padStart(len - 1, '0') + '\0';
    put(e.name, 0, 100);
    put(oct(e.type === '2' ? 0o777 : 0o644, 8), 100, 8);
    put(oct(0, 8), 108, 8);
    put(oct(0, 8), 116, 8);
    put(oct(e.type === '2' ? 0 : data.length, 12), 124, 12);
    put(oct(0, 12), 136, 12);
    put('        ', 148, 8);
    put(e.type || '0', 156, 1);
    put(e.link || '', 157, 100);
    put('ustar\0', 257, 6);
    put('00', 263, 2);
    let sum = 0;
    for (const b of h) sum += b;
    put(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8);
    blocks.push(h);
    if (e.type !== '2') {
      blocks.push(data, Buffer.alloc((512 - (data.length % 512)) % 512));
    }
  }
  blocks.push(Buffer.alloc(1024));
  fs.writeFileSync(file, zlib.gzipSync(Buffer.concat(blocks)));
  return file;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** A stored (uncompressed) zip from [{ name, data, mode }], Unix attributes kept. */
function makeZip(file, entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name);
    const data = Buffer.from(e.data || '');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4); // made by Unix: external attributes carry the mode
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(((e.mode || 0o100644) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, data);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  fs.writeFileSync(file, Buffer.concat([...locals, cd, end]));
  return file;
}

//────────────────────────────────────────────────────────

describe('check-pack: exact multiset, modelled configuration only', () => {
  test('a duplicate entry fails even when every expected file is present', () => {
    const r = checkPack.compare(['a', 'b'], ['a', 'b', 'b']);
    assert.deepStrictEqual([r.extra, r.missing], [[], []]);
    assert.ok(r.problems.some(p => /duplicate entry in the package: b/.test(p)), r.problems.join('\n'));
    const { ok } = checkPack.report('x', ['a', 'b'], ['a', 'b', 'b'], r);
    assert.strictEqual(ok, false);
  });

  test('a tarball carrying the same path twice fails; its listing is kept whole', () => {
    const dir = tmp('guards-dup-');
    const tgz = makeTgz(path.join(dir, 'p.tgz'), [
      { name: 'package/package.json', data: '{}' },
      { name: 'package/dist/index.js', data: '1' },
      { name: 'package/dist/index.js', data: '2' },
    ]);
    const files = checkPack.tarballFiles(tgz);
    assert.strictEqual(files.length, 3);
    const r = checkPack.compare(['dist/index.js', 'package.json'], files);
    assert.ok(r.problems.some(p => /duplicate/.test(p)));
  });

  test('configuration it cannot model is refused with an "update the expected set" message', () => {
    const dir = tmp('guards-cfg-');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0', files: ['dist/**/*.js'] }));
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({
      extends: './base.json', include: ['src'], compilerOptions: { outDir: 'dist', declarationDir: 'types' },
    }));
    const { problems } = checkPack.expectedFiles(dir);
    for (const needle of ['"extends"', 'declarationDir', 'include "src"', 'files entry "dist/**/*.js"', 'update the expected set']) {
      assert.ok(problems.some(p => p.includes(needle)), `expected a problem mentioning ${needle}:\n${problems.join('\n')}`);
    }
  });

  test('the real package is modelled without problems (25 files)', () => {
    const { expected, problems } = checkPack.expectedFiles(path.join(__dirname, '..', 'packages', 'validator'));
    assert.deepStrictEqual(problems, []);
    assert.strictEqual(expected.length, 25);
  });
});

describe('archives are validated before anything is extracted', () => {
  test('npm tarball: traversal, absolute, symlink, duplicate, outside package/ — all refused, nothing unpacked', () => {
    const dir = tmp('guards-tgz-');
    const marker = `escape-${process.pid}-${Date.now()}`;
    const tgz = makeTgz(path.join(dir, 'evil.tgz'), [
      { name: 'package/package.json', data: '{}' },
      { name: `package/../../${marker}`, data: 'x' },
      { name: 'package/link', type: '2', link: '/etc/passwd' },
      { name: 'package/a.js', data: '1' },
      { name: 'package/a.js', data: '2' },
      { name: 'other/x.js', data: 'x' },
    ]);
    const listing = A.listArchive('npm', tgz);
    const all = listing.failures.join('\n');
    assert.match(all, /unsafe archive entry[^\n]*\.\./);
    assert.match(all, /unsafe archive entry[^\n]*package\/link/);
    assert.match(all, /duplicate archive entry[^\n]*package\/a\.js/);
    assert.match(all, /outside package\/[^\n]*other\/x\.js/);

    const unpacked = A.contents('npm', tgz);
    assert.strictEqual(unpacked.files, null, 'a refused archive must not be extracted');
    const record = A.inspect({ kind: 'npm', file: tgz, root: path.join(__dirname, '..') });
    assert.ok(record.failures.some(f => /refused before extraction/.test(f)));
    assert.strictEqual(record.run, null, 'a refused archive must not be run');
    for (const base of [os.tmpdir(), fs.realpathSync(os.tmpdir()), path.dirname(dir)]) {
      assert.ok(!fs.existsSync(path.join(base, marker)), `the traversal entry was written to ${base}`);
    }
  });

  test('VSIX (zip): traversal, symlink and duplicate refused by the shared pre-extraction check', () => {
    const dir = tmp('guards-zip-');
    const zip = makeZip(path.join(dir, 'evil.vsix'), [
      { name: 'extension/package.json', data: '{}' },
      { name: 'extension/../../escape.js', data: 'x' },
      { name: 'extension/link', data: '/etc/passwd', mode: 0o120777 },
      { name: 'extension/a.js', data: '1' },
      { name: 'extension/a.js', data: '2' },
    ]);
    const { entries, modes } = zipListing(zip);
    const all = unsafeEntries(entries, modes).join('\n');
    assert.match(all, /unsafe archive entry[^\n]*escape\.js/);
    assert.match(all, /unsafe archive entry[^\n]*extension\/link/);
    assert.match(all, /duplicate archive entry[^\n]*extension\/a\.js/);
    assert.strictEqual(A.contents('vsix', zip).files, null);
  });

  test('a clean archive passes the listing check', () => {
    const dir = tmp('guards-ok-');
    const tgz = makeTgz(path.join(dir, 'ok.tgz'), [{ name: 'package/package.json', data: '{}' }]);
    assert.deepStrictEqual(A.listArchive('npm', tgz).failures, []);
    const zip = makeZip(path.join(dir, 'ok.vsix'), [{ name: 'extension/package.json', data: '{}' }]);
    assert.deepStrictEqual(A.listArchive('vsix', zip).failures, []);
  });
});

describe('inspect-artefacts: the previous-release comparison fails closed', () => {
  const blank = () => ({ kind: 'npm', files: {}, size: 1, failures: [], flags: [], previous: null });

  test('a failed download is a FAIL, not a skipped comparison', () => {
    const r = attachPrevious(blank(), { error: 'download failed: HTTP 503' });
    assert.ok(r.failures.some(f => /previous release not compared — download failed/.test(f)), r.failures.join('\n'));
    assert.strictEqual(r.previous, null);
  });

  test('a previous artefact refused before extraction is a FAIL', () => {
    const r = attachPrevious(blank(), { file: '/nowhere.tgz', source: 'x' }, {
      describe: () => { throw new Error('refused before extraction: duplicate'); },
    });
    assert.ok(r.failures.some(f => /refused before extraction/.test(f)));
  });

  test('--first-release is the only waiver, and it is recorded', () => {
    const r = attachPrevious(blank(), {}, { firstRelease: true });
    assert.deepStrictEqual(r.failures, []);
    assert.ok(r.flags.some(f => /--first-release/.test(f)));
  });
});

describe('verify-published: bound to the pre-release record, fails closed per channel', () => {
  const noCall = name => () => { throw new Error(`${name} must not be called`); };
  const offlineDeps = extra => {
    const out = [];
    return {
      out,
      deps: {
        fetch: noCall('fetch'), sh: noCall('sh'), exportRef: noCall('exportRef'), inspect: noCall('inspect'),
        treeOf: () => 'tree-A',
        log: s => out.push(s), err: s => out.push(s),
        ...extra,
      },
    };
  };
  const record = (dir, rec, artefacts = passArtefacts()) => {
    const file = path.join(dir, `inspection-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(file, JSON.stringify({ meta: {}, artefacts, record: rec }));
    return file;
  };
  const goodRecord = { sha: 'c0ffee', tree: 'tree-A', extensionVersion: '9.9.9', engineVersion: '8.8.8' };

  test('no --pre: refused (exit 2) before any download', async () => {
    const { out, deps } = offlineDeps();
    assert.strictEqual(await verifyPublished.run(['9.9.9'], deps), 2);
    assert.match(out.join('\n'), /--pre <inspection\.json> is required/);
  });

  test('a record for another version or another tree is refused', async () => {
    const dir = tmp('guards-pre-');
    const pre = record(dir, goodRecord);
    let r = offlineDeps();
    assert.strictEqual(await verifyPublished.run(['9.9.8', '--pre', pre], r.deps), 2);
    assert.match(r.out.join('\n'), /inspected extension 9\.9\.9, not 9\.9\.8/);
    r = offlineDeps();
    assert.strictEqual(await verifyPublished.run(['--engine', '8.8.7', '--pre', pre], r.deps), 2);
    assert.match(r.out.join('\n'), /inspected engine 8\.8\.8, not 8\.8\.7/);
    r = offlineDeps({ treeOf: () => 'tree-B' });
    assert.strictEqual(await verifyPublished.run(['9.9.9', '--pre', pre], r.deps), 2);
    assert.match(r.out.join('\n'), /is not the tree of v9\.9\.9/);
    r = offlineDeps();
    const bare = record(dir, undefined);
    assert.strictEqual(await verifyPublished.run(['9.9.9', '--pre', bare], r.deps), 2);
    assert.match(r.out.join('\n'), /not a complete PASS inspection: record\.sha is missing/);
  });

  test('every channel that cannot be downloaded is a mismatch; exit 1', async () => {
    const dir = tmp('guards-dl-');
    const pre = record(dir, goodRecord);
    const { out, deps } = offlineDeps({
      exportRef: () => ({ sha: 'c0ffee', tree: 'tree-A', dir }),
      sh: () => { const e = new Error('offline'); e.stderr = 'HTTP 404: release not found'; throw e; },
      fetch: async url => ({ ok: false, status: /extensionquery/.test(url) ? 200 : 503, json: async () => ({}) }),
    });
    const code = await verifyPublished.run(['9.9.9', '--engine', '8.8.8', '--pre', pre, '--out-dir', path.join(dir, 'r')], deps);
    const text = out.join('\n');
    assert.strictEqual(code, 1, text);
    assert.match(text, /GitHub release v9\.9\.9: no VSIX downloaded/);
    assert.match(text, /Open VSX 9\.9\.9: no VSIX downloaded/);
    assert.match(text, /Marketplace 9\.9\.9:/);
    assert.match(text, /npm pinescript-v6-validator@8\.8\.8:/);
    assert.match(text, /verify-published: FAIL/);
  });

  test('a Marketplace that lists the version but will not serve the VSIX is a FAIL', async () => {
    const dir = tmp('guards-mp-');
    const pre = record(dir, goodRecord);
    const { out, deps } = offlineDeps({
      exportRef: () => ({ sha: 'c0ffee', tree: 'tree-A', dir }),
      fetch: async url => (/extensionquery/.test(url)
        ? { ok: true, status: 200, json: async () => ({ results: [{ extensions: [{ versions: [{ version: '9.9.9' }] }] }] }) }
        : { ok: false, status: 401 }),
    });
    const code = await verifyPublished.run(['9.9.9', '--pre', pre, '--skip-channel', 'github', '--skip-channel', 'openvsx',
      '--out-dir', path.join(dir, 'r')], deps);
    const text = out.join('\n');
    assert.strictEqual(code, 1, text);
    assert.match(text, /Marketplace 9\.9\.9: .*HTTP 401/);
  });

  test('--skip-channel is an explicit waiver, printed in the result', async () => {
    const dir = tmp('guards-skip-');
    const pre = record(dir, goodRecord);
    const { out, deps } = offlineDeps({ exportRef: () => ({ sha: 'c0ffee', tree: 'tree-A', dir }) });
    const code = await verifyPublished.run(['9.9.9', '--pre', pre, '--skip-channel', 'github', '--skip-channel', 'openvsx',
      '--skip-channel', 'marketplace', '--out-dir', path.join(dir, 'r')], deps);
    const text = out.join('\n');
    assert.strictEqual(code, 0, text);
    assert.match(text, /SKIPPED by --skip-channel marketplace/);
    assert.match(text, /verify-published: PASS\*\* — channels skipped: github, openvsx, marketplace/);
  });

  test('an unknown channel name is refused', async () => {
    const { deps } = offlineDeps();
    assert.strictEqual(await verifyPublished.run(['9.9.9', '--skip-channel', 'marketplce'], deps), 2);
  });
});

describe('iCloud refusal sees through symlinks', () => {
  test('an alias whose text omits "Mobile Documents" is still refused', () => {
    const dir = tmp('guards-icloud-');
    const real = path.join(dir, 'Library', 'Mobile Documents', 'x');
    fs.mkdirSync(real, { recursive: true });
    const alias = path.join(dir, 'alias');
    fs.symlinkSync(real, alias);
    assert.throws(() => A.refuseICloud(path.join(alias, 'report')), /inside iCloud/);
    assert.strictEqual(A.refuseICloud(path.join(dir, 'fine', 'report')), path.join(dir, 'fine', 'report'));
  });
});

//────────────────────────────────────────────────────────
// Review round 2 (delta review of 29e130c)
//────────────────────────────────────────────────────────

const policy = require('../scripts/lib/publish-policy.js');
const { fetchPrevious } = require('../scripts/inspect-artefacts.js');
const { spawnSync } = require('node:child_process');

describe('only a complete PASS inspection binds (verify-published and publish-engine)', () => {
  const full = () => ({ meta: {}, artefacts: passArtefacts(), record: { sha: 'c0ffee', tree: 'tree-A', extensionVersion: '9.9.9', engineVersion: '8.8.8' } });

  test('a complete PASS record binds', () => {
    assert.deepStrictEqual(policy.checkPreRecord(full(), ['vsix', 'npm']), []);
  });

  test('a record whose inspection FAILED is refused', () => {
    const pre = full();
    pre.artefacts[1].failures = ['previous release not compared — download failed: HTTP 503'];
    assert.match(policy.checkPreRecord(pre, ['vsix']).join('\n'), /the inspection FAILED for x\.tgz/);
  });

  test('a record whose artefact did not run successfully is refused', () => {
    const pre = full();
    pre.artefacts[0].run = { ok: false };
    assert.match(policy.checkPreRecord(pre, ['vsix']).join('\n'), /vsix artefact x\.vsix was not run successfully/);
    delete pre.artefacts[0].run;
    assert.match(policy.checkPreRecord(pre, ['vsix']).join('\n'), /vsix artefact x\.vsix was not run successfully/);
  });

  test('a record missing the artefact, its hash or its file hashes is refused', () => {
    let pre = full();
    pre.artefacts = pre.artefacts.filter(a => a.kind !== 'npm');
    assert.match(policy.checkPreRecord(pre, ['npm']).join('\n'), /0 npm artefact\(s\); exactly one is required/);
    pre = full();
    pre.artefacts.push({ ...pre.artefacts[0] });
    assert.match(policy.checkPreRecord(pre, ['vsix']).join('\n'), /2 vsix artefact\(s\)/);
    pre = full();
    delete pre.artefacts[0].sha256;
    pre.artefacts[0].files['extension/package.json'].sha256 = '';
    const all = policy.checkPreRecord(pre, ['vsix']).join('\n');
    assert.match(all, /no archive SHA-256/);
    assert.match(all, /files without a SHA-256/);
    pre = full();
    delete pre.record.tree;
    assert.match(policy.checkPreRecord(pre, []).join('\n'), /record\.tree is missing/);
  });

  test('verify-published refuses a FAILED record before any download', async () => {
    const dir = tmp('guards-failrec-');
    const pre = full();
    pre.artefacts[0].failures = ['run failed: activate() threw'];
    const file = path.join(dir, 'inspection.json');
    fs.writeFileSync(file, JSON.stringify(pre));
    const out = [];
    const boom = () => { throw new Error('must not be called'); };
    const code = await verifyPublished.run(['9.9.9', '--pre', file], {
      fetch: boom, sh: boom, exportRef: boom, inspect: boom, treeOf: () => 'tree-A', log: s => out.push(s), err: s => out.push(s),
    });
    assert.strictEqual(code, 2);
    assert.match(out.join('\n'), /is not a complete PASS inspection: the inspection FAILED for x\.vsix/);
  });

  test('publish-engine binding: stale tree, other version or other tarball refused; FAIL record refused', () => {
    const bind = { tree: 'tree-A', version: '8.8.8', sha256: HEX('c') };
    assert.deepStrictEqual(policy.checkPreForPublish(full(), bind), []);
    assert.match(policy.checkPreForPublish(full(), { ...bind, tree: 'tree-MAIN' }).join('\n'),
      /record tree tree-A is not the tree being published tree-MAIN/);
    assert.match(policy.checkPreForPublish(full(), { ...bind, version: '8.8.9' }).join('\n'), /record engine 8\.8\.8 is not 8\.8\.9/);
    assert.match(policy.checkPreForPublish(full(), { ...bind, sha256: HEX('e') }).join('\n'), /record tarball sha256/);
    const failed = full();
    failed.artefacts[1].failures = ['x'];
    assert.match(policy.checkPreForPublish(failed, bind).join('\n'), /the inspection FAILED/);
  });

  test('publish-engine CLI exits 1 with the reasons on a stale record', () => {
    const dir = tmp('guards-cli-');
    const file = path.join(dir, 'inspection.json');
    fs.writeFileSync(file, JSON.stringify(full()));
    const script = path.join(__dirname, '..', 'scripts', 'lib', 'publish-policy.js');
    const ok = spawnSync(process.execPath, [script, 'pre', file, 'tree-A', '8.8.8', HEX('c')], { encoding: 'utf8' });
    assert.strictEqual(ok.status, 0, ok.stdout);
    const stale = spawnSync(process.execPath, [script, 'pre', file, 'tree-NEWER', '8.8.8', HEX('c')], { encoding: 'utf8' });
    assert.strictEqual(stale.status, 1);
    assert.match(stale.stdout, /is not the tree being published tree-NEWER/);
  });
});

describe('--publish runs only on the exact origin/main tip', () => {
  test('HEAD equal to the fetched tip passes; an older ancestor is refused', () => {
    assert.deepStrictEqual(policy.checkTip('abc', 'abc'), []);
    assert.match(policy.checkTip('old', 'new').join('\n'), /is not the current origin\/main tip new/);
    assert.match(policy.checkTip('', 'new').join('\n'), /cannot resolve/);
  });
});

describe('the public registry is pinned with CLI precedence', () => {
  test('a publishConfig registry pointing elsewhere is refused; the public one is allowed', () => {
    assert.deepStrictEqual(policy.checkPublishConfig({}), []);
    assert.deepStrictEqual(policy.checkPublishConfig({ publishConfig: { registry: 'https://registry.npmjs.org' } }), []);
    assert.match(policy.checkPublishConfig({ publishConfig: { registry: 'https://evil.example/' } }).join('\n'),
      /publishConfig\.registry is https:\/\/evil\.example\//);
    assert.match(policy.checkPublishConfig({ publishConfig: { '@scope:registry': 'https://evil.example/' } }).join('\n'),
      /publishConfig\.@scope:registry/);
  });

  test('the real engine manifest does not redirect publishing', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'packages', 'validator', 'package.json'), 'utf8'));
    assert.deepStrictEqual(policy.checkPublishConfig(manifest), []);
  });

  test('registry reads go through the npm helper (sanitised env, --registry pinned)', () => {
    process.env.npm_config_registry_probe = 'x';
    process.env.NPM_CONFIG_REGISTRY = 'https://evil.example/';
    try {
      const env = A.npmEnv();
      assert.ok(!('npm_config_registry_probe' in env) && !('NPM_CONFIG_REGISTRY' in env));
      assert.strictEqual(env.npm_config_registry, policy.REGISTRY);
    } finally {
      delete process.env.npm_config_registry_probe;
      delete process.env.NPM_CONFIG_REGISTRY;
    }
    // inspect-artefacts' previous-engine download uses the injected helper, not a raw spawn.
    const calls = [];
    const dir = tmp('guards-reg-');
    const noSh = () => { throw new Error('npm must not go through the generic shell runner'); };
    fetchPrevious('npm', { prevEngine: '1.0.0' }, dir, noSh, (args, opts) => { calls.push({ args, opts }); return 'x.tgz\n'; });
    assert.deepStrictEqual(calls[0].args.slice(0, 2), ['pack', 'pinescript-v6-validator@1.0.0']);
    assert.strictEqual(calls[0].opts.cwd, path.join(dir, 'prev-npm'));
  });

  test('publish-engine.sh runs every npm command through npm_clean and refuses a publishConfig redirect', () => {
    const text = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'publish-engine.sh'), 'utf8');
    const code = text.split('\n').filter(l => !/^\s*(#|')/.test(l)).map(l => l.replace(/'[^']*'/g, ''));
    assert.ok(code.filter(l => /\bnpm_clean (ci|pack|view|publish|run|--version)\b/.test(l)).length >= 6, code.join('\n'));
    assert.match(text, /source "\$WORK\/src\/scripts\/lib\/npm-clean\.sh"/);
    assert.match(text, /publish-policy\.js" publish-config/);
  });
});

describe('an ambiguous release (more than one VSIX asset) fails', () => {
  test('singleAsset refuses zero or several', () => {
    const dir = tmp('guards-assets-');
    assert.throws(() => A.singleAsset(dir, '.vsix', 'r'), /0 \.vsix asset/);
    fs.writeFileSync(path.join(dir, 'a-1.0.0.vsix'), 'x');
    assert.strictEqual(A.singleAsset(dir, '.vsix', 'r'), path.join(dir, 'a-1.0.0.vsix'));
    fs.writeFileSync(path.join(dir, 'a-0.9.0.vsix'), 'y');
    assert.throws(() => A.singleAsset(dir, '.vsix', 'r'), /2 \.vsix asset\(s\) \(a-0\.9\.0\.vsix, a-1\.0\.0\.vsix\)/);
  });

  test('inspect-artefacts: two VSIX assets on the previous release is a FAIL', () => {
    const dir = tmp('guards-prev2-');
    const prev = fetchPrevious('vsix', { prevTag: 'v1.0.0' }, dir, (cmd, args) => {
      const d = args[args.indexOf('-D') + 1];
      fs.writeFileSync(path.join(d, 'x-1.0.0.vsix'), '1');
      fs.writeFileSync(path.join(d, 'x-old.vsix'), '2');
      return '';
    });
    assert.match(prev.error, /2 \.vsix asset\(s\)/);
    const r = attachPrevious({ kind: 'vsix', files: {}, size: 1, failures: [], flags: [], previous: null }, prev);
    assert.ok(r.failures.some(f => /previous release not compared — .*2 \.vsix asset/.test(f)), r.failures.join('\n'));
  });

  test('verify-published: two VSIX assets on the GitHub release is a mismatch', async () => {
    const dir = tmp('guards-gh2-');
    const pre = path.join(dir, 'inspection.json');
    fs.writeFileSync(pre, JSON.stringify({ meta: {}, artefacts: passArtefacts(), record: { sha: 'c', tree: 'tree-A', extensionVersion: '9.9.9', engineVersion: '8.8.8' } }));
    const out = [];
    const code = await verifyPublished.run(['9.9.9', '--pre', pre, '--skip-channel', 'openvsx', '--skip-channel', 'marketplace',
      '--out-dir', path.join(dir, 'r')], {
      fetch: () => { throw new Error('no'); },
      sh: (cmd, args) => {
        const d = args[args.indexOf('-D') + 1];
        fs.writeFileSync(path.join(d, 'x-9.9.9.vsix'), '1');
        fs.writeFileSync(path.join(d, 'x-9.9.9-old.vsix'), '2');
        return '';
      },
      exportRef: () => ({ sha: 'c', tree: 'tree-A', dir }),
      inspect: () => { throw new Error('an ambiguous asset must not be inspected'); },
      treeOf: () => 'tree-A', log: s => out.push(s), err: s => out.push(s),
    });
    assert.strictEqual(code, 1, out.join('\n'));
    assert.match(out.join('\n'), /GitHub release v9\.9\.9: no VSIX downloaded \(release assets: 2 \.vsix asset\(s\)/);
  });
});

describe('check-pack: literal files entries it cannot model', () => {
  test('files: ["dist", "docs"] is refused with the configuration message, not "rebuild"', () => {
    const dir = tmp('guards-files-');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0', files: ['dist', 'docs', 'README.md'] }));
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({ include: ['src/**/*.ts'], compilerOptions: { outDir: 'dist' } }));
    const { problems } = checkPack.expectedFiles(dir);
    assert.ok(problems.some(p => p.includes('files entry "docs" is not modelled')), problems.join('\n'));
    assert.ok(!problems.some(p => p.includes('"dist"') || p.includes('"README.md"')), problems.join('\n'));
    const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'packages', 'validator', 'scripts', 'check-pack.js'), dir],
      { encoding: 'utf8', env: { PATH: '' } });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /the expected set cannot be derived/);
    assert.match(r.stderr, /update the expected set/);
    assert.doesNotMatch(r.stderr, /Rebuild/);
  });
});

describe('archive names are compared in canonical form', () => {
  test('dist/./index.js and dist//index.js are non-canonical duplicates of dist/index.js', () => {
    const all = unsafeEntries(['package/dist/index.js', 'package/dist/./index.js', 'package/dist//index.js'], ['-', '-', '-']).join('\n');
    assert.match(all, /non-canonical archive entry[^\n]*dist\/\.\/index\.js/);
    assert.match(all, /non-canonical archive entry[^\n]*dist\/\/index\.js/);
    assert.match(all, /duplicate archive entry[^\n]*dist\/\.\/index\.js/);
    assert.match(all, /duplicate archive entry[^\n]*dist\/\/index\.js/);
  });

  test('a tarball using ./ to smuggle a second copy is refused before extraction', () => {
    const dir = tmp('guards-canon-');
    const tgz = makeTgz(path.join(dir, 'c.tgz'), [
      { name: 'package/package.json', data: '{}' },
      { name: 'package/dist/index.js', data: '1' },
      { name: 'package/dist/./index.js', data: '2' },
    ]);
    const unpacked = A.contents('npm', tgz);
    assert.strictEqual(unpacked.files, null);
    assert.ok(unpacked.failures.some(f => /duplicate archive entry/.test(f)));
  });
});

describe('--help does nothing but print usage', () => {
  // PATH is emptied: any git, npm, tar or network tool the script tried to run would fail.
  const scripts = [
    ['scripts/inspect-artefacts.js', /usage: node scripts\/inspect-artefacts\.js/],
    ['packages/validator/scripts/check-pack.js', /usage: node scripts\/check-pack\.js/],
    ['scripts/verify-vsix.js', /usage: node scripts\/verify-vsix\.js/],
    ['scripts/verify-published.js', /usage: verify-published\.js/],
    ['scripts/engine-tarball-smoke.js', /usage: node scripts\/engine-tarball-smoke\.js/],
    ['scripts/lib/publish-policy.js', /usage: publish-policy\.js/],
  ];
  for (const [script, usage] of scripts) {
    for (const flag of ['--help', '-h']) {
      test(`${script} ${flag}`, () => {
        const cwd = tmp('guards-help-');
        const r = spawnSync(process.execPath, [path.join(__dirname, '..', script), flag], { cwd, encoding: 'utf8', env: { PATH: '' } });
        assert.strictEqual(r.status, 0, r.stderr);
        assert.match(r.stdout, usage);
        assert.deepStrictEqual(fs.readdirSync(cwd), [], 'help must not write anything');
      });
    }
  }

  test('scripts/publish-engine.sh --help (bash builtins only, nothing on PATH)', () => {
    const cwd = tmp('guards-help-sh-');
    const r = spawnSync('/bin/bash', [path.join(__dirname, '..', 'scripts', 'publish-engine.sh'), '--help'],
      { cwd, encoding: 'utf8', env: { PATH: '/nonexistent' } });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /Release sequence: merge -> git fetch/);
    assert.deepStrictEqual(fs.readdirSync(cwd), []);
  });
});

describe('round 3: a record binds only when EVERY artefact in it is complete and PASS', () => {
  const full = () => ({ meta: {}, artefacts: passArtefacts(), record: { sha: 'c0ffee', tree: 'tree-A', extensionVersion: '9.9.9', engineVersion: '8.8.8' } });
  const bind = { tree: 'tree-A', version: '8.8.8', sha256: HEX('c') };

  test('a record truncated to the engine artefact does not bind an engine publish', () => {
    const pre = full();
    pre.artefacts = pre.artefacts.filter(a => a.kind === 'npm');
    assert.match(policy.checkPreForPublish(pre, bind).join('\n'), /0 vsix artefact\(s\); exactly one is required/);
  });

  test('an incomplete VSIX artefact blocks an engine-only binding too', () => {
    for (const breakIt of [a => { a.run = { ok: false }; }, a => { delete a.sha256; }, a => { a.files = {}; }]) {
      const pre = full();
      breakIt(pre.artefacts[0]);
      const problems = policy.checkPreForPublish(pre, bind);
      assert.ok(problems.some(p => /^vsix artefact x\.vsix /.test(p)), problems.join('\n'));
      assert.ok(policy.checkPreRecord(pre, ['npm']).length > 0);
    }
  });
});
