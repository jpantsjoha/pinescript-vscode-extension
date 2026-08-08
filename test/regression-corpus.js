/**
 * The regression corpus — every defect this validator has ever shipped, locked open.
 *
 * WHY THIS FILE EXISTS
 *
 * Each entry below is a bug that reached a user or survived a review. Several were
 * found only because somebody read a file by eye that the tool had just called
 * clean. The corpus exists so that none of them can come back quietly.
 *
 * It is deliberately DATA, not tests. The same table is executed twice:
 *
 *   test/regression-corpus.test.js  -> against the local build (packages/validator/dist)
 *   test/npm-package.test.js        -> against the PACKED, INSTALLED tarball
 *
 * That second run is the point. Every recurring failure in this project's history
 * has been of one shape: correct in the source tree, broken in the published
 * artefact. Dead doc anchors that resolved in `src/` and not in the shipped package.
 * A VSIX whose engine was excluded by .vscodeignore. A local scratchpad path that
 * leaked into a dependency range. Testing `src/` cannot see any of those.
 *
 * ADDING A CASE
 *
 * When a defect is found, add it here BEFORE fixing it, and give `found` a real
 * date and a one-line account of how it escaped. A case with no `why` is a case
 * nobody will understand in six months.
 *
 * `expect` is the checkId that must appear ('S1'…'S9'), the string 'error' for a
 * syntactic diagnostic, or null meaning the code is CORRECT and nothing may fire.
 * A null case is not filler — a false positive on working code is worse here than
 * a miss, because it teaches people to ignore the tool.
 */

'use strict';

const IND = '//@version=6\nindicator("t", overlay=true)\n';
const STR = '//@version=6\nstrategy("t", overlay=true)\n';

/** @type {Array<{name:string, code:string, expect:string|null, found:string, why:string}>} */
const CASES = [
  //────────────────────────────────────────────────────────
  // S1 — repainting
  //────────────────────────────────────────────────────────
  {
    name: 'S1: request.security without an offset repaints',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close)\nplot(d)\n',
    expect: 'S1',
    found: '2026-08-05',
    why:
      'The single most-cited Pine defect in the literature, and the reason semantic ' +
      'checking exists at all. If this one ever goes quiet, the tool has lost its point.',
  },
  {
    name: 'S1: a MULTI-LINE request.security is still assessed',
    code: IND + 'd = request.security(syminfo.tickerid,\n     "D",\n     close)\nplot(d)\n',
    expect: 'S1',
    found: '2026-08-08',
    why:
      'The check bailed whenever the parentheses did not close on one line, behind a ' +
      'comment claiming the call was "assessed on its own line". Nothing assessed it. ' +
      'Wrapping is the NORMAL formatting for this function, so most real repainting escaped.',
  },
  {
    name: 'S1: close[1] is the anti-repainting idiom and must not warn',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close[1])\nplot(d)\n',
    expect: null,
    found: '2026-08-05',
    why: 'Flagging the documented fix would punish correct code and train people to ignore S1.',
  },
  {
    name: 'S1: an explicit lookahead_off means the author decided',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close, lookahead=barmerge.lookahead_off)\nplot(d)\n',
    expect: null,
    found: '2026-08-05',
    why: 'S1 is a question about intent; stating the intent answers it.',
  },

  //────────────────────────────────────────────────────────
  // S2 — ta.* conditionality
  //────────────────────────────────────────────────────────
  {
    name: 'S2: ta.* in the TRUE branch of a ternary',
    code: IND + 'x = close > open ? ta.sma(close, 20) : na\nplot(x)\n',
    expect: 'S2',
    found: '2026-08-05',
    why:
      'The original S2 case. ta.* carries state across bars, so a call that only runs ' +
      'on some bars develops gaps in its history and every later value is wrong.',
  },
  {
    name: 'S2: ta.* in the FALSE branch of a ternary',
    code: IND + 'x = close > open ? na : ta.sma(close, 20)\nplot(x)\n',
    expect: 'S2',
    found: '2026-08-08',
    why:
      'The test was `!/\\?[^:]*$/`, which only ever inspected the true branch. ' +
      'Both branches are conditional and both leave gaps in the indicator history.',
  },
  {
    name: 'S2: ta.* inside an if body',
    code: IND + 'var float v = 0.0\nif close > open\n    v := ta.sma(close, 20)\nplot(v)\n',
    expect: 'S2',
    found: '2026-08-05',
    why:
      'The block form of the same defect. An if body runs on some bars only, so the ' +
      'ta.* inside it advances on some bars only.',
  },
  {
    name: 'S2: ta.* inside a for body',
    code: IND + 'var float v = 0.0\nv := 0.0\nfor i = 0 to 2\n    v := ta.ema(close, 20)\nplot(v)\n',
    expect: 'S2',
    found: '2026-08-08',
    why: 'Loop iterations are not bars. Calling ta.* n times per bar corrupts its state.',
  },
  {
    name: 'S2: a ta.* call in a USER FUNCTION body is correct and must not warn',
    code: IND + 'f_norm(x, n) =>\n    ma = ta.sma(x, n)\n    na(ma) ? na : x / ma\nplot(f_norm(close, 20))\n',
    expect: null,
    found: '2026-08-08',
    why:
      'S2 treated every indented line as a conditional block. A function body is ' +
      'indented for SCOPE, not branching, and this is the normal way to write a ' +
      'reusable helper. It fired on a real working script in examples/. ' +
      'A false positive on correct code is worse than a miss.',
  },
  {
    name: 'S2: a ta.* call in a method body must not warn',
    code: IND + 'method smooth(float x) =>\n    ta.sma(x, 5)\nplot(close.smooth())\n',
    expect: null,
    found: '2026-08-08',
    why:
      'Methods are function definitions too, and the fix keyed off a regex for the ' +
      'definition form. A pattern that missed the `method` modifier would silently ' +
      'reintroduce the false positive for every user-defined method.',
  },
  {
    name: 'S2: an if NESTED in a function still warns',
    code: IND + 'f(x) =>\n    if x > 0\n        ta.sma(x, 5)\nplot(f(close))\n',
    expect: 'S2',
    found: '2026-08-08',
    why:
      'The function-body exemption must not become a blanket amnesty. What matters ' +
      'is the NEAREST enclosing construct, not any enclosing construct.',
  },
  {
    name: 'S2: using the RESULT of an unconditional call in a ternary is correct',
    code: IND + 'v = ta.rsi(close, 14)\nx = close > open ? v : na\nplot(x)\n',
    expect: null,
    found: '2026-08-05',
    why: 'This is the documented remedy for S2. Flagging it would leave no way out.',
  },

  //────────────────────────────────────────────────────────
  // S3 — accumulator lifetime
  //────────────────────────────────────────────────────────
  {
    name: 'S3: a var total re-accumulated by a for loop grows without bound',
    code: IND + 'var float sum = 0.0\nfor i = 0 to 9\n    sum := sum + close[i]\nplot(sum)\n',
    expect: 'S3',
    found: '2026-08-08',
    why:
      'Reported by a user who read examples/test-v6-features.pine by eye after the ' +
      'tool called it clean. `var` persists, so this adds ten more closes on every ' +
      'bar for the life of the chart. The spec had only the OPPOSITE shape (an ' +
      'accumulator missing `var`), which is the cheaper half — that one produces a ' +
      'visibly constant series, this one produces a plausible number that drifts.',
  },
  {
    name: 'S3: a var counter makes its own while loop unreachable',
    code: IND + 'var int counter = 0\nwhile counter < 5\n    counter += 1\nplot(counter)\n',
    expect: 'S3',
    found: '2026-08-08',
    why:
      'Second instance in the same file, quieter than the first: on bar two the ' +
      'counter is already at its terminal value, so the body never runs again.',
  },
  {
    name: 'S3: a per-bar total that correctly omits var must not warn',
    code: IND + 'float sum = 0.0\nfor i = 0 to 9\n    sum += close[i]\nplot(sum)\n',
    expect: null,
    found: '2026-08-08',
    why: 'No var means it resets each bar, which is exactly what a per-bar total wants.',
  },
  {
    name: 'S3: a var reset before the loop is a buffer, not a leak',
    code: IND + 'var float sum = 0.0\nsum := 0.0\nfor i = 0 to 9\n    sum += close[i]\nplot(sum)\n',
    expect: null,
    found: '2026-08-08',
    why: 'Reusing an allocation is legitimate provided it is cleared every bar.',
  },
  {
    name: 'S3: run-once initialisation on the first bar is correct',
    code: IND + 'var float seed = 0.0\nif barstate.isfirst\n    for i = 0 to 9\n        seed += close[i]\nplot(seed)\n',
    expect: null,
    found: '2026-08-08',
    why: 'Building a lookup table on bar one is THE legitimate reason to accumulate into a var.',
  },
  {
    name: 'S3: a genuine running total outside any loop is correct',
    code: IND + 'var float total = 0.0\ntotal := total + volume\nplot(total)\n',
    expect: null,
    found: '2026-08-08',
    why: 'Cumulative volume is the textbook correct use of var. Flagging it would be absurd.',
  },

  //────────────────────────────────────────────────────────
  // S5 / S6 / S7 / S8 — platform limits and scope
  //────────────────────────────────────────────────────────
  {
    name: 'S7: plot() indented inside an if will not compile',
    code: IND + 'if close > open\n    plot(close)\n',
    expect: 'S7',
    found: '2026-08-05',
    why: 'plot takes a series; conditional plotting is done by passing na, not by branching.',
  },
  {
    name: 'S7: a plot() wrapped across lines is not "indented"',
    code: IND + 'plot(close,\n     title="c",\n     color=color.red)\n',
    expect: null,
    found: '2026-08-06',
    why:
      'Continuation lines are indented as formatting. Treating them as scope flagged ' +
      'every multi-line plot in existence.',
  },
  {
    name: 'S8: a function defined inside a block will not compile',
    code: IND + 'if close > open\n    f(x) => x * 2\nplot(close)\n',
    expect: 'S8',
    found: '2026-08-05',
    why:
      'Pine requires definitions at column 0. Detectable without an AST, which is why ' +
      'it shipped while the AST path remains broken.',
  },
  {
    name: 'S8: calling a function inside a block is not defining one',
    code: IND + 'if close > open\n    y = math.max(1, 2)\nplot(close)\n',
    expect: null,
    found: '2026-08-06',
    why: 'The => arrow is what distinguishes a definition from a call.',
  },

  //────────────────────────────────────────────────────────
  // S9 — unbounded risk
  //────────────────────────────────────────────────────────
  {
    name: 'S9: an entry with no exit anywhere',
    code: STR + 'if close > open\n    strategy.entry("L", strategy.long)\n',
    expect: 'S9',
    found: '2026-08-05',
    why:
      'The original S9 case. A position opened with no mechanism anywhere in the ' +
      'script to close it is unbounded risk on a real account.',
  },
  {
    name: 'S9: strategy.cancel is NOT an exit',
    code: STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
      'if close < open\n    strategy.cancel("L")\n',
    expect: 'S9',
    found: '2026-08-08',
    why:
      'cancel withdraws a PENDING ORDER; it does not close an open position. Counting ' +
      'it as an exit let a strategy with genuinely unbounded risk pass clean — the ' +
      'precise thing S9 exists to catch.',
  },
  {
    name: 'S9: strategy.exit satisfies the check',
    code: STR + 'if close > open\n    strategy.entry("L", strategy.long)\n' +
      'if close < open\n    strategy.exit("X", from_entry="L", stop=1.0)\n',
    expect: null,
    found: '2026-08-05',
    why:
      'The paired negative for S9. Without it the check could be satisfied by always ' +
      'firing, which would be useless and indistinguishable in a one-sided suite.',
  },

  //────────────────────────────────────────────────────────
  // Syntactic — the false-positive history
  //────────────────────────────────────────────────────────
  {
    name: 'syntactic: a misspelled parameter name is named in the diagnostic',
    code: IND + 'l = line.new(x1=1, y1=2, x2=3, y2=4, colour=color.red)\n',
    expect: 'error',
    found: '2026-08-04',
    why: 'The most common Pine compile error, and the reason this project exists.',
  },
  {
    name: 'FP: the coordinate overload of line.new is official v6',
    code: IND + 'l = line.new(x1=bar_index[1], y1=low[1], x2=bar_index, y2=high)\n',
    expect: null,
    found: '2026-08-04',
    why:
      'line.new, box.new and label.new each have a chart.point form AND a coordinate ' +
      'form. Flattening them into one signature made ten valid calls look invalid.',
  },
  {
    name: 'FP: the coordinate overload of box.new is official v6',
    code: IND + 'b = box.new(left=bar_index[5], top=high, right=bar_index, bottom=low)\n',
    expect: null,
    found: '2026-08-04',
    why:
      'Same overload defect as line.new. Listed separately because the fix was per ' +
      'signature, so one could regress without the other.',
  },
  {
    name: 'FP: a comma inside a string is not an argument separator',
    code: IND + 'c = close > open\n' +
      'alertcondition(c, title="T", message="Conditions met, reduce size or tighten stops")\n',
    expect: null,
    found: '2026-08-06',
    why:
      'Arguments were split on every comma with no awareness of string literals, and ' +
      'the argument list was captured with ([^)]+) which truncated at the first nested ' +
      'paren. 28 false errors on one file.',
  },
  {
    name: 'FP: commented-out code must not be validated',
    code: IND + '// l = line.new(x1=1, y1=2, colour=color.red)\nplot(close)\n',
    expect: null,
    found: '2026-08-06',
    why:
      'Neither diagnostic path stripped comments. Fixing it then hid //@version=6, ' +
      'which is itself a comment — so the version check reads the ORIGINAL text.',
  },
  {
    name: 'the version directive is still seen after comment blanking',
    code: 'plot(close)\n',
    expect: 'warn',
    found: '2026-08-06',
    why:
      'Regression guard for the fix above: a file with no //@version must still be ' +
      'reported, which only works if the version check predates comment blanking.',
  },
  {
    name: 'plotshape uses style=, not shape=',
    code: IND + 'plotshape(close > open, shape=shape.triangleup)\n',
    expect: 'error',
    found: '2026-08-06',
    why:
      'Caught by documentChecks rather than the validator. A consumer wired to only ' +
      'one of the two paths calls this clean and silently disagrees with the editor.',
  },
  {
    name: 'a clean idiomatic script produces nothing at all',
    code: IND + 'len = input.int(20, "Length")\nema = ta.ema(close, len)\nplot(ema, color=color.blue)\n',
    expect: null,
    found: '2026-08-04',
    why:
      'The most important case in the file. If ordinary correct Pine warns, nothing ' +
      'else here matters.',
  },
];

/**
 * Suppression is a separate contract: a semantic finding can be silenced by an
 * author who has considered it, a compile error can never be.
 */
const SUPPRESSION_CASES = [
  {
    name: 'a targeted // pine-ignore silences that check',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close)  // pine-ignore: S1\nplot(d)\n',
    expect: null,
    found: '2026-08-07',
    why: 'Without an escape hatch, one wrong warning becomes a reason to abandon the tool.',
  },
  {
    name: 'a directive inside a STRING is data, not a directive',
    code: IND + 'msg = "use // pine-ignore: S1 to silence"\n' +
      'd = request.security(syminfo.tickerid, "D", close)\nplot(d)\n',
    expect: 'S1',
    found: '2026-08-07',
    why: 'Otherwise file content could silently disable the validator.',
  },
  {
    name: 'a typo in the directive suppresses nothing rather than everything',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close)  // pine-ignore: S99\nplot(d)\n',
    expect: 'S1',
    found: '2026-08-07',
    why: 'Widening a typo into a blanket suppression would hide real findings.',
  },
  {
    name: 'a compile error survives any directive',
    code: IND + 'l = line.new(x1=1, y1=2, x2=3, y2=4, colour=color.red)  // pine-ignore\n',
    expect: 'error',
    found: '2026-08-07',
    why: 'A compile error is a fact, not a judgement. Hiding it ships a script that cannot run.',
  },
];

module.exports = { CASES, SUPPRESSION_CASES, IND, STR };
