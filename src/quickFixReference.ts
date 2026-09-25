// Reference data the quick fixes read (issue #49), gathered in one module so a
// later move of v6/ (#55) is a change here only.
import { REFERENCE_NAMES } from '../v6/reference-names';
import { PINE_FUNCTIONS_MERGED } from '../v6/parameter-requirements-merged';

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
