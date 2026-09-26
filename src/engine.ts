/**
 * The validation engine, loaded from ONE place.
 *
 * `packages/validator` is the single source of every diagnostic and of the v6
 * reference dataset (issue #55). The build compiles it (`tsc -p packages/validator`)
 * and copies that local build into `dist/engine/`, which ships in the VSIX. The
 * extension, IntelliSense, validate-cli.js, the MCP server and the tests all load
 * the same compiled files, so the editor cannot disagree with the agent.
 *
 * Why a runtime `require` and not a static import: the compile-time path and the
 * runtime path differ. Types come from the package's declaration output
 * (`packages/validator/dist/*.d.ts`, `import type` only, so nothing is emitted for
 * it); the code comes from `dist/engine/`, next to `dist/src/` in the VSIX. A
 * static import of the package source would make `tsc -p .` compile a second copy
 * into `dist/packages/`, and the VSIX would ship the engine twice.
 *
 * Do NOT point this at the published npm package: the VSIX must ship the code that
 * will be published at the next release cut, not the last one.
 */

import type * as Engine from '../packages/validator/dist/index';
import type * as ParameterRequirementsMerged from '../packages/validator/dist/data/parameter-requirements-merged';
import type * as ReferenceNames from '../packages/validator/dist/data/reference-names';
import type * as PineConstants from '../packages/validator/dist/data/pine-constants-complete';
import type * as PineBuiltins from '../packages/validator/dist/data/pine-builtins-complete';

export type { ValidationError, DiagnosticSeverity } from '../packages/validator/dist/index';

// Resolved from dist/src/engine.js, so '../engine' is dist/engine.
export const engine: typeof Engine = require('../engine/index.js');

export const { AccurateValidator, runDocumentChecks } = engine;

const merged: typeof ParameterRequirementsMerged = require('../engine/data/parameter-requirements-merged.js');
const referenceNames: typeof ReferenceNames = require('../engine/data/reference-names.js');
const constants: typeof PineConstants = require('../engine/data/pine-constants-complete.js');
const builtins: typeof PineBuiltins = require('../engine/data/pine-builtins-complete.js');

export const PINE_FUNCTIONS_MERGED = merged.PINE_FUNCTIONS_MERGED;
export const REFERENCE_NAMES = referenceNames.REFERENCE_NAMES;
export const REFERENCE_NAME_DESCRIPTIONS = referenceNames.REFERENCE_NAME_DESCRIPTIONS;
export const NAMESPACE_CONSTANTS = constants.NAMESPACE_CONSTANTS;
export const STRATEGY_VARIABLES = constants.STRATEGY_VARIABLES;
export const KEYWORDS = builtins.KEYWORDS;
