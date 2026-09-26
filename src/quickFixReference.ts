// Reference data the quick fixes read (issue #49), taken from the engine through
// src/engine.ts, the single loader.
import { REFERENCE_NAMES, PINE_FUNCTIONS_MERGED } from './engine';

export { REFERENCE_NAMES };

interface ParamLists { requiredParams?: string[]; optionalParams?: string[]; parameters?: Array<{ name: string }> }
type Spec = ParamLists & { overloads?: ParamLists[] };

/** True when built-in `fn` documents a parameter called `param` in any overload. */
export function builtinHasParameter(fn: string, param: string): boolean {
  const spec = (PINE_FUNCTIONS_MERGED as Record<string, Spec | undefined>)[fn];
  if (!spec) return false;
  const lists = [spec, ...(spec.overloads ?? [])];
  return lists.some(l =>
    (l.requiredParams ?? []).includes(param) ||
    (l.optionalParams ?? []).includes(param) ||
    (l.parameters ?? []).some(p => p.name === param));
}
