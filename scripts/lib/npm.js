/**
 * The repository's npm helper: every script spawns npm through this module (or its
 * shell twin, scripts/lib/npm-clean.sh). The implementation lives in
 * packages/validator/scripts/npm-clean.js so the engine package's prepack guard can
 * use it when the package is copied on its own. test/npm-guard.test.js fails on any
 * direct npm spawn outside these helpers.
 */
'use strict';

module.exports = require('../../packages/validator/scripts/npm-clean.js');
