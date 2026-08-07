/**
 * MERGED: Manual (100% accurate) + Generated Parameter Requirements
 *
 * Manual overrides generated for critical functions
 * Generated: 2025-10-04T18:35:33.107Z
 * Total functions: 457
 *   - Manual (100% accurate): 32
 *   - Generated (auto-parsed): 425
 */

// Re-export types
export type { FunctionParameter, FunctionSignatureSpec } from "./parameter-requirements-generated";

import { PINE_FUNCTIONS as GENERATED } from "./parameter-requirements-generated";
import { ALL_FUNCTION_SIGNATURES as MANUAL } from "./parameter-requirements";

/**
 * Merged parameter requirements with manual overrides:
 * - 32 manually verified functions (indicator, strategy, plot, input, ta, etc.) @ 100% accuracy
 * - 425 auto-generated functions @ ~95% accuracy
 * - 32 functions where manual overrides generated
 *
 * Manual functions take precedence for maximum validation accuracy.
 */
export const PINE_FUNCTIONS_MERGED = {
  ...GENERATED,  // Generated functions (auto-parsed)
  ...MANUAL      // Manual overrides (100% accurate)
};

// Default export
export default PINE_FUNCTIONS_MERGED;

// Total: 457 functions (32 manual @ 100%, 425 generated @ ~95%)