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
 *   - an iCloud location behind a symlink alias is still refused.
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
    for (const needle of ['"extends"', 'declarationDir', 'include "src"', 'files pattern "dist/**/*.js"', 'update the expected set']) {
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
  const record = (dir, rec) => {
    const file = path.join(dir, 'inspection.json');
    fs.writeFileSync(file, JSON.stringify({ meta: {}, artefacts: [], record: rec }));
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
    assert.match(r.out.join('\n'), /carries no candidate record/);
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
