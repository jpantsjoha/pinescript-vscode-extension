/**
 * Evaluate .vscodeignore the way `vsce package` does, so the audit can ask
 * "would this file ship?" instead of pattern-matching the ignore file's text.
 *
 * vsce semantics (collectFiles in @vscode/vsce): comment and blank lines dropped;
 * a pattern ending in `/` means `pattern/**`; a file is excluded when it matches any
 * non-negated pattern and no `!` pattern, using minimatch with { dot: true } against
 * the path relative to the extension root. `package.json` is always re-included.
 *
 * minimatch comes from the `glob` runtime dependency, so no new dependency.
 */
'use strict';

function loadMinimatch() {
  try {
    const m = require('minimatch');
    return typeof m === 'function' ? m : m.minimatch;
  } catch {
    const path = require('path');
    const m = require(require.resolve('minimatch', { paths: [path.dirname(require.resolve('glob'))] }));
    return typeof m === 'function' ? m : m.minimatch;
  }
}

function compile(ignoreText) {
  const minimatch = loadMinimatch();
  const patterns = [...ignoreText.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#')), '!package.json']
    .map(p => (p.endsWith('/') ? `${p}**` : p));
  const ignored = patterns.filter(p => !p.startsWith('!'));
  const negated = patterns.filter(p => p.startsWith('!')).map(p => p.slice(1));
  const opts = { dot: true };
  return rel => !ignored.some(p => minimatch(rel, p, opts)) || negated.some(p => minimatch(rel, p, opts));
}

module.exports = { compile };
