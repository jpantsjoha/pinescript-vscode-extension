/**
 * The ONLY way a script in this repository spawns npm (#67).
 *
 * Three release-review rounds found the same defect in three places: an npm call that
 * trusted ambient configuration — a working-tree .npmrc, an unpinned registry, an
 * inspection `npm ci` inheriting the shell's npm_config_*. Fixing each call site did
 * not stop the next one, so every call goes through here instead, and
 * test/npm-guard.test.js fails on any direct npm spawn anywhere else.
 *
 * Every invocation gets:
 *   - an environment with every inherited npm_config_* / NPM_CONFIG_* removed;
 *     `userconfig` = ~/.npmrc (authentication only), `globalconfig` = /dev/null
 *     (empty), registry = the public registry, audit/fund/update-notifier off;
 *   - `--registry https://registry.npmjs.org/` on the command line for every command
 *     that can reach a registry (any caller-supplied --registry is replaced): a CLI
 *     flag outranks .npmrc, the environment and publishConfig;
 *   - a refusal when its working directory is inside iCloud ("Mobile Documents"),
 *     except for `npm run` (a local script) and `npm --version`.
 *
 * Lives in packages/validator/scripts so the package's own prepack guard can use it
 * when the package is copied on its own; scripts/lib/npm.js re-exports it. The shell
 * twin is scripts/lib/npm-clean.sh.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REGISTRY = 'https://registry.npmjs.org/';
const ICLOUD = 'Mobile Documents';

/** Subcommands that can talk to a registry: each gets --registry pinned. */
const REGISTRY_COMMANDS = new Set([
  'ci', 'install', 'i', 'add', 'update', 'up', 'pack', 'publish', 'unpublish', 'view', 'info',
  'show', 'v', 'dist-tag', 'deprecate', 'outdated', 'audit', 'exec', 'x', 'search', 'whoami',
  'ping', 'access', 'owner', 'token', 'login', 'logout', 'adduser', 'fund', 'doctor',
]);
/** Subcommands allowed with a working directory inside iCloud: local-only work. */
const ICLOUD_OK = new Set(['run', 'run-script', '--version']);

function subcommand(args) {
  if (args.includes('--version') && args.filter(a => !a.startsWith('-')).length === 0) return '--version';
  return args.find(a => !a.startsWith('-')) || '';
}

/** Canonical path: realpath of the longest existing prefix plus the remainder. */
function canonical(p) {
  let head = path.resolve(p);
  const rest = [];
  while (!fs.existsSync(head)) {
    const parent = path.dirname(head);
    if (parent === head) break;
    rest.unshift(path.basename(head));
    head = parent;
  }
  return path.join(fs.realpathSync(head), ...rest);
}

/** The sanitised environment npm runs with. `base` defaults to process.env. */
function npmEnv(base = process.env) {
  const env = {};
  for (const [k, v] of Object.entries(base)) if (!/^npm_config_/i.test(k)) env[k] = v;
  env.npm_config_userconfig = path.join(os.homedir(), '.npmrc');
  env.npm_config_globalconfig = '/dev/null';
  env.npm_config_registry = REGISTRY;
  env.npm_config_audit = 'false';
  env.npm_config_fund = 'false';
  env.npm_config_update_notifier = 'false';
  return env;
}

/** The argv npm runs with: any caller --registry removed; the public one pinned where it matters. */
function npmArgs(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--registry') { i++; continue; }
    if (String(args[i]).startsWith('--registry=')) continue;
    out.push(String(args[i]));
  }
  if (REGISTRY_COMMANDS.has(subcommand(out))) out.push('--registry', REGISTRY);
  return out;
}

/**
 * What would be spawned, without spawning it: { file, args, options }. Throws when the
 * working directory is inside iCloud (except npm run / npm --version).
 */
function npmInvocation(args, opts = {}) {
  const cwd = path.resolve(opts.cwd || process.cwd());
  const sub = subcommand(args);
  if (!ICLOUD_OK.has(sub) && canonical(cwd).includes(ICLOUD)) {
    throw new Error(`npm ${sub} refused: working directory ${cwd} is inside iCloud ("${ICLOUD}"); run it from a clean export`);
  }
  return {
    file: 'npm',
    args: npmArgs(args),
    options: {
      cwd,
      env: npmEnv(opts.env || process.env),
      encoding: 'utf8',
      stdio: opts.stdio || ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1 << 28,
    },
  };
}

/** Run npm through the policy above; returns stdout (execFileSync semantics). */
function npm(args, opts = {}) {
  const inv = npmInvocation(args, opts);
  return execFileSync(inv.file, inv.args, inv.options);
}

module.exports = { REGISTRY, REGISTRY_COMMANDS, npm, npmInvocation, npmEnv, npmArgs };
