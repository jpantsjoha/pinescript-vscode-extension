#!/usr/bin/env node
/**
 * The engine publish policy, as pure checks — used by scripts/publish-engine.sh (via
 * the CLI below), scripts/verify-published.js and test/release-guards.test.js, so the
 * rules the shell script enforces are the rules the offline tests prove.
 *
 *   node scripts/lib/publish-policy.js tip <head-sha> <origin-main-sha>
 *   node scripts/lib/publish-policy.js publish-config <package.json>
 *   node scripts/lib/publish-policy.js pre <inspection.json> <tree> <engine-version> <tarball-sha256>
 *
 * Each command prints nothing and exits 0 when the rule holds, or prints the reasons
 * and exits 1.
 */
'use strict';

const fs = require('fs');

/** The only registry the engine is published to or verified against. */
const REGISTRY = 'https://registry.npmjs.org/';

const sameRegistry = url => String(url || '').replace(/\/+$/, '') === REGISTRY.replace(/\/+$/, '');

/** --publish runs only on the exact current origin/main tip (fetched just before). */
function checkTip(head, originMain) {
  if (!head || !originMain) return ['cannot resolve HEAD or origin/main'];
  return head === originMain ? [] : [`HEAD ${head} is not the current origin/main tip ${originMain}; check out origin/main, re-inspect, then publish`];
}

/** A manifest may not redirect publishing: publishConfig.registry must be absent or the public registry. */
function checkPublishConfig(manifest) {
  const pc = manifest.publishConfig || {};
  const out = [];
  for (const [key, value] of Object.entries(pc)) {
    if (/registry$/i.test(key) && !sameRegistry(value)) {
      out.push(`package.json publishConfig.${key} is ${value}; the engine publishes only to ${REGISTRY}`);
    }
  }
  return out;
}

/**
 * A pre-release record binds only if its inspection PASSED and is complete: a record
 * block, and for every kind asked for exactly one artefact with an archive SHA-256,
 * a non-empty per-file hash list, no failures and a successful run. Any failure in any
 * artefact of the record makes the whole record a FAIL.
 */
function checkPreRecord(pre, kinds) {
  const out = [];
  if (!pre || typeof pre !== 'object') return ['the record is not an inspection.json object'];
  const rec = pre.record || {};
  for (const k of ['sha', 'tree', 'extensionVersion', 'engineVersion']) {
    if (!rec[k]) out.push(`record.${k} is missing (re-run scripts/inspect-artefacts.js)`);
  }
  const arts = Array.isArray(pre.artefacts) ? pre.artefacts : [];
  if (!arts.length) out.push('the record lists no artefacts');
  for (const a of arts) {
    if ((a.failures || []).length) out.push(`the inspection FAILED for ${a.name || a.kind}: ${a.failures.length} failure(s), e.g. ${a.failures[0]}`);
  }
  for (const kind of kinds) {
    const matching = arts.filter(a => a.kind === kind);
    if (matching.length !== 1) { out.push(`the record has ${matching.length} ${kind} artefact(s); exactly one is required`); continue; }
    const a = matching[0];
    if (!/^[0-9a-f]{64}$/.test(a.sha256 || '')) out.push(`${kind} artefact has no archive SHA-256`);
    const files = a.files && typeof a.files === 'object' ? Object.entries(a.files) : [];
    if (!files.length) out.push(`${kind} artefact lists no files`);
    if (files.some(([, f]) => !f || !/^[0-9a-f]{64}$/.test(f.sha256 || ''))) out.push(`${kind} artefact has files without a SHA-256`);
    if (!a.run || a.run.ok !== true) out.push(`${kind} artefact was not run successfully in the inspection`);
  }
  return out;
}

/** publish-engine's binding: a PASS record for this tree, this engine version and this exact tarball. */
function checkPreForPublish(pre, { tree, version, sha256 }) {
  const out = checkPreRecord(pre, ['npm']);
  const rec = (pre && pre.record) || {};
  const npm = ((pre && pre.artefacts) || []).find(a => a.kind === 'npm') || {};
  if (rec.tree && rec.tree !== tree) out.push(`record tree ${rec.tree} is not the tree being published ${tree}`);
  if (rec.engineVersion && rec.engineVersion !== version) out.push(`record engine ${rec.engineVersion} is not ${version}`);
  if (npm.sha256 && npm.sha256 !== sha256) out.push(`record tarball sha256 ${npm.sha256} is not the packed ${sha256}`);
  return out;
}

module.exports = { REGISTRY, checkTip, checkPublishConfig, checkPreRecord, checkPreForPublish };

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log('usage: publish-policy.js tip <head> <origin-main> | publish-config <package.json> | pre <inspection.json> <tree> <version> <sha256>');
    process.exit(cmd ? 0 : 2);
  }
  let problems;
  try {
    if (cmd === 'tip') problems = checkTip(rest[0], rest[1]);
    else if (cmd === 'publish-config') problems = checkPublishConfig(JSON.parse(fs.readFileSync(rest[0], 'utf8')));
    else if (cmd === 'pre') problems = checkPreForPublish(JSON.parse(fs.readFileSync(rest[0], 'utf8')), { tree: rest[1], version: rest[2], sha256: rest[3] });
    else problems = [`unknown command ${cmd}`];
  } catch (e) {
    problems = [e.message];
  }
  if (problems.length) {
    console.log(problems.join('; '));
    process.exit(1);
  }
}
