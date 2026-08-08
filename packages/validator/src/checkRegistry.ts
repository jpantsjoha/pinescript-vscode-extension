/**
 * Semantic check registry and suppression.
 *
 * Semantic checks differ from syntactic ones in kind, not just in severity. A
 * syntactic diagnostic is a fact — the script will not compile. A semantic
 * diagnostic is an inference about intent: the script compiles and is probably not
 * what the author meant. Inferences can be wrong, so they are suppressible;
 * compile errors are not.
 *
 * See architecture/HLD/semantic-checks.md in jpantsjoha/pinescript-plugin.
 */

import { Severity, DiagnosticSeverity } from './accurateValidator';
import { blankStrings } from './documentChecks';

export type SemanticCheckId =
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

export interface SemanticCheck {
  id: SemanticCheckId;
  severity: DiagnosticSeverity;
  title: string;
  /** Where the reasoning is explained at length. */
  docAnchor: string;
}

/**
 * One definition per check.
 *
 * Message text lives here rather than at the call site so it cannot drift from the
 * documentation that explains it — the same reason the parameter data has a single
 * source.
 *
 * Severity policy: ONLY checks describing something that will not compile on
 * TradingView are errors. Everything else warns. Nine new diagnostics arriving at
 * once is a real risk of warning fatigue, and an error the user disagrees with is
 * how a tool gets uninstalled.
 */
export const SEMANTIC_CHECKS: Record<SemanticCheckId, SemanticCheck> = {
  S1: {
    id: 'S1',
    severity: Severity.Warning,
    title: 'Possible repainting: request.security() without a historical offset',
    docAnchor: 'pinescript-strategy#1-repainting-higher-timeframe-data-detected-as-s1'
  },
  S2: {
    id: 'S2',
    severity: Severity.Warning,
    title: 'ta.* called inside a conditional — its history will have gaps',
    docAnchor: 'pinescript-v6#the-execution-model-decides-everything'
  },
  // Two shapes, one question: does the accumulator's lifetime match its meaning?
  //   S3a  `x := x + ...` with no `var`   -> resets every bar
  //   S3b  `var x = 0` re-accumulated in a loop with no reset -> grows unbounded
  // S3b is the costlier half: it produces a plausible number that drifts, which is
  // the defect that survives a backtest. One ID so `// pine-ignore: S3` covers both.
  S3: {
    id: 'S3',
    severity: Severity.Warning,
    title: 'Accumulator lifetime does not match its meaning',
    docAnchor: 'pinescript-strategy#4-accumulator-lifetime-both-directions-are-wrong'
  },
  S4: {
    id: 'S4',
    severity: Severity.Warning,
    title: 'Assignment inside and/or — v6 short-circuits and may skip it',
    docAnchor: 'pinescript-strategy#4-accumulator-lifetime-both-directions-are-wrong'
  },
  S5: {
    id: 'S5',
    severity: Severity.Error,
    title: 'More than 64 plot calls — TradingView will reject the script',
    docAnchor: 'pinescript-indicator#plotting'
  },
  S6: {
    id: 'S6',
    severity: Severity.Error,
    title: 'More than 40 request.*() calls — TradingView will reject the script',
    docAnchor: 'pinescript-indicator#higher-timeframes-without-repainting'
  },
  S7: {
    id: 'S7',
    severity: Severity.Error,
    title: 'plot() must be called at global scope',
    docAnchor: 'pinescript-indicator#plotting'
  },
  S8: {
    id: 'S8',
    severity: Severity.Error,
    title: 'Functions cannot be defined inside a block',
    docAnchor: 'pinescript-v6#common-compile-errors'
  },
  S9: {
    id: 'S9',
    severity: Severity.Warning,
    title: 'strategy.entry with no exit anywhere in the script',
    docAnchor: 'pinescript-strategy#entries-and-exits'
  }
};

/** Sentinel meaning "every semantic check on this line". */
const ALL: unique symbol = Symbol('all');

export interface SuppressionMap {
  /** True when `id` is suppressed on `line` (1-indexed). */
  isSuppressed(line: number, id: string): boolean;
  /** Number of directives found — used by tests to prove extraction ran. */
  readonly size: number;
}

const DIRECTIVE = /\/\/\s*pine-ignore\b\s*:?\s*([A-Za-z0-9,\s]*)/;

/**
 * Extract `// pine-ignore` directives from the RAW source.
 *
 * ORDERING IS LOAD-BEARING. `blankComments()` replaces every comment with spaces
 * before any check runs, so a directive read after that point does not exist. This
 * must be called on the original text, and the result carried alongside.
 *
 * Getting this wrong does not fail loudly — suppression simply never works, which
 * is why there is an explicit test asserting a directive survives blanking.
 *
 *   // pine-ignore: S1        -> S1 only
 *   // pine-ignore: S1,S2     -> S1 and S2
 *   // pine-ignore            -> every semantic check on that line
 */
export function extractSuppressions(rawText: string): SuppressionMap {
  const byLine = new Map<number, Set<SemanticCheckId | typeof ALL>>();

  // Blank STRING literals but deliberately NOT comments. A `// pine-ignore` inside
  // a string is data — a message being built, a doc example — and honouring it
  // would let file content silently disable the validator. Comments must survive,
  // because the directive lives in one.
  //
  // blankStrings preserves length and newlines, so line numbers stay exact.
  const lines = blankStrings(rawText).split('\n');

  for (let i = 0; i < lines.length; i++) {
    const match = DIRECTIVE.exec(lines[i]);
    if (!match) continue;

    const ids = new Set<SemanticCheckId | typeof ALL>();
    const listed = (match[1] || '')
      .split(',')
      .map(part => part.trim().toUpperCase())
      .filter(Boolean);

    if (listed.length === 0) {
      ids.add(ALL);
    } else {
      for (const id of listed) {
        if (id in SEMANTIC_CHECKS) ids.add(id as SemanticCheckId);
      }
      // `// pine-ignore: nonsense` suppresses nothing rather than everything —
      // silently widening a typo into a blanket suppression would hide real findings.
      if (ids.size === 0) continue;
    }

    byLine.set(i + 1, ids);
  }

  return {
    size: byLine.size,
    isSuppressed(line: number, id: string): boolean {
      const ids = byLine.get(line);
      if (!ids) return false;
      return ids.has(ALL) || ids.has(id as SemanticCheckId);
    }
  };
}

/**
 * Drop semantic diagnostics the author has explicitly silenced.
 *
 * Only ever applied to semantic findings. Syntactic diagnostics are compile errors
 * and are deliberately not suppressible — hiding one would mean shipping a script
 * that cannot run.
 */
export function applySuppressions<T extends { line: number; checkId?: string }>(
  findings: T[],
  suppressions: SuppressionMap
): T[] {
  return findings.filter(
    f => !f.checkId || !suppressions.isSuppressed(f.line, f.checkId)
  );
}
