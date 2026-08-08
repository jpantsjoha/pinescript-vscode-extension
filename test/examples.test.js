/**
 * examples/ must stay valid, and the negative fixtures must stay invalid.
 *
 * This directory is user-facing and is also where the accumulator defect propagated:
 * a demo file carried a `var` total that a loop re-accumulated on every bar, the
 * validator called it clean, and a person found it by eye. A demo file teaches
 * whatever it contains, so it is held to the same standard as shipped code.
 *
 * Two categories, distinguished by a marker rather than a hard-coded list — a list
 * drifts, a marker sits in the file it describes:
 *
 *   normal    -> zero ERRORS. Warnings are allowed: several examples legitimately
 *                demonstrate S1 on higher-timeframe data, and suppressing those
 *                would misrepresent what the tool does.
 *
 *   marked    -> `// pine-expect: invalid` in the header. These exist to prove the
 *                validator catches something, so they must produce at least one
 *                error. The marker excuses a file from the clean sweep; it does NOT
 *                exempt it from being checked. Without this half, marking a file
 *                would be a way to silence a real regression.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { validatePineScript } = require('../packages/validator/dist/index.js');

const EXAMPLES = path.join(__dirname, '..', 'examples');
const MARKER = /^\s*\/\/\s*pine-expect:\s*invalid\b/m;

function collect(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, found);
    else if (entry.name.endsWith('.pine')) found.push(full);
  }
  return found;
}

const files = collect(EXAMPLES).map(full => {
  const source = fs.readFileSync(full, 'utf8');
  return {
    rel: path.relative(EXAMPLES, full),
    source,
    negative: MARKER.test(source),
  };
});

describe('examples/', () => {
  test('there are example files to check', () => {
    // Guards against a glob that silently matches nothing, which would make every
    // assertion below vacuously true.
    assert.ok(files.length > 5, `only found ${files.length} .pine files`);
  });

  for (const file of files.filter(f => !f.negative)) {
    test(`${file.rel} has no errors`, () => {
      const errors = validatePineScript(file.source).filter(d => d.severity === 0);
      assert.deepStrictEqual(
        errors.map(e => `L${e.line}: ${e.message}`), [],
        'An example that cannot compile teaches whatever it contains. Fix the Pine, ' +
        'or mark the file `// pine-expect: invalid` if it is a negative fixture.'
      );
    });
  }

  for (const file of files.filter(f => f.negative)) {
    test(`${file.rel} is a negative fixture and still fails`, () => {
      const errors = validatePineScript(file.source).filter(d => d.severity === 0);
      assert.ok(errors.length > 0,
        'This file is marked `pine-expect: invalid` but now validates clean. Either ' +
        'the validator has regressed and stopped catching what this fixture proves, ' +
        'or the file was fixed and the marker should be removed.');
    });
  }

  test('no example carries an unreset var accumulator', () => {
    // The specific defect that reached a user. Belt and braces over S3 itself: if
    // the check regresses, this still fails, and it fails pointing at examples/.
    const offenders = [];
    for (const file of files) {
      for (const d of validatePineScript(file.source)) {
        if (d.checkId === 'S3') offenders.push(`${file.rel}:${d.line}`);
      }
    }
    assert.deepStrictEqual(offenders, [],
      'S3 fires on an example. `var` persists across bars, so a per-bar total must ' +
      'not be var, or must be reset before the loop.');
  });
});
