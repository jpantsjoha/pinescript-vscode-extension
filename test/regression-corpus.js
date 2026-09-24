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
 * `expect` is the checkId that must appear ('S1'…'S10'), the string 'error' for a
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
  {
    name: 'S1: a POSITIONAL lookahead_off is the same decision and must not warn',
    code: IND + 'd = request.security(syminfo.tickerid, "W", close, barmerge.gaps_off, barmerge.lookahead_off)\nplot(d)\n',
    expect: null,
    found: '2026-09-22',
    why:
      'The check recognised only the NAMED form (lookahead=). A 1,489-line macro dashboard ' +
      'passed lookahead positionally on every one of its 26 request.security calls — the ' +
      'form TradingView\'s own reference examples use — and got 26 warnings telling it to ' +
      'do what it had already done.',
  },
  {
    name: 'S1: a positional lookahead_off on a TUPLE request is silent too',
    code: IND + '[a, b] = request.security(syminfo.tickerid, "W", [close, open], barmerge.gaps_off, barmerge.lookahead_off)\nplot(a - b)\n',
    expect: null,
    found: '2026-09-22',
    why: 'Tuple requests are the idiom for one call per symbol; the fifth argument is still the lookahead.',
  },
  {
    name: 'S1: positional lookahead_on is an explicit decision — S1 asks about intent, not wisdom',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)\nplot(d)\n',
    expect: null,
    found: '2026-09-22',
    why: 'The named form lookahead=barmerge.lookahead_on has always been silent; the two spellings must agree.',
  },
  {
    name: 'S1: gaps alone is NOT a lookahead decision — still flags',
    code: IND + 'd = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off)\nplot(d)\n',
    expect: 'S1',
    found: '2026-09-22',
    why:
      'The paired "still flags" case for the positional fix: a fourth argument says nothing ' +
      'about lookahead, so widening the exemption to any barmerge.* token would silence real repainting.',
  },
  {
    name: 'S1: a nested request.security decides only for itself — the OUTER call still flags',
    code: IND + 'd = request.security("NASDAQ:AAPL", "W", request.security("NASDAQ:MSFT", "D", close, barmerge.gaps_off, barmerge.lookahead_off))\nplot(d)\n',
    expect: 'S1',
    found: '2026-09-22',
    why:
      'Review finding on the positional fix: the exemption regexes ran over the whole balanced ' +
      'argument region, so an inner call\'s lookahead_off silenced an outer call that had decided ' +
      'nothing. Only the outer call\'s own top-level arguments count now.',
  },
  {
    name: 'S1: an offset inside a nested request does not settle the outer call either',
    code: IND + 'd = request.security("NASDAQ:AAPL", "W", request.security("NASDAQ:MSFT", "D", close[1], barmerge.gaps_off, barmerge.lookahead_off))\nplot(d)\n',
    expect: 'S1',
    found: '2026-09-22',
    why: 'The same blind spot for the offset exemption, which predates the positional fix.',
  },
  {
    name: 'S1: a nested request inside a call that DID decide stays silent',
    code: IND + 'd = request.security(syminfo.tickerid, "W", request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_off), barmerge.gaps_off, barmerge.lookahead_off)\nplot(d)\n',
    expect: null,
    found: '2026-09-22',
    why: 'Both calls state their lookahead; the paired negative for the nested cases.',
  },
  {
    name: 'S1: an offset on a SIBLING argument of the enclosing call does not settle a wrapped request',
    code: IND + 'f(float a, float b) => a\nd = f(request.security(syminfo.tickerid,\n     "D",\n     close), close[1])\nplot(d)\n',
    expect: 'S1',
    found: '2026-09-22',
    why:
      'The wrapped-call join cut the arguments at the LAST closing paren on the closing line, ' +
      'not the one that closes this call, so `, close[1]` from the enclosing f() leaked in and ' +
      'the offset exemption fired. Found by a council lane probing the nested-call fix.',
  },
  {
    name: 'S1: the same wrapped request with its own offset is still the correct idiom',
    code: IND + 'f(float a, float b) => a\nd = f(request.security(syminfo.tickerid,\n     "D",\n     close[1]), close)\nplot(d)\n',
    expect: null,
    found: '2026-09-22',
    why: 'Paired negative: the offset sits inside this call, so it must stay silent.',
  },

  //────────────────────────────────────────────────────────
  // User reports #9, #14, #16, #11 — reproduced 2026-09-23 on 0.6.2
  //────────────────────────────────────────────────────────
  {
    name: '#9/#14: timestamp() with timezone and six components is valid',
    code: IND + 't = timestamp("UTC", 2024, 1, 2, 9, 30, 0)\nplot(t)\n',
    expect: null,
    found: '2026-09-23',
    why:
      'The scrape kept only timestamp(dateString), so every component call reported ' +
      '"Expected max 1". Two users filed it; session-time scripts cannot avoid it.',
  },
  {
    name: '#9: timestamp() without a timezone, with and without hour/minute/second, is valid',
    code: IND + 't1 = timestamp(2024, 1, 2, 9, 30)\nt2 = timestamp(2024, 1, 2)\nt3 = timestamp("UTC", 2024, 1, 2, 9, 30)\nt4 = timestamp("2024-01-02T09:30:00")\nplot(t1 + t2 + t3 + t4)\n',
    expect: null,
    found: '2026-09-23',
    why: 'Every overload in the v6 reference must pass: dateString, components, timezone + components.',
  },
  {
    name: '#14: timestamp() with eight arguments is still too many',
    code: IND + 't = timestamp("UTC", 2024, 1, 2, 9, 30, 0, 1)\nplot(t)\n',
    expect: 'error',
    found: '2026-09-23',
    why: 'The paired "still flags" case: the widest overload takes seven.',
  },
  {
    name: '#16: a typed function parameter used with field access is not undefined',
    code: IND + 'type State\n    float a\n\nupdate(State st, float v) =>\n    st.a := v\n    st\n\nvar State s = State.new(na)\nupdate(s, close)\nplot(close)\n',
    expect: null,
    found: '2026-09-23',
    why:
      'Only the function NAME was collected from `f(params) =>`, so `st.a` inside the body ' +
      'reported "Undefined namespace or variable \'st\'" on every UDT-passing function.',
  },
  {
    name: '#16: generic and defaulted parameters are collected too',
    code: IND + 'f(array<float> xs, map<string, float> m, int n = 3) =>\n    xs.size() + m.size() + n\n\nplot(f(array.new<float>(), map.new<string, float>()))\n',
    expect: null,
    found: '2026-09-23',
    why: 'A comma inside map<string, float> must not split the parameter list.',
  },
  {
    name: '#16: a comparison in a parameter default does not swallow the next parameter',
    code: IND + 'type State\n    float a\n\nf(bool up = close > open, State st) =>\n    st.a\n\ng(int n = bar_index < 10 ? 1 : 2, State st2) =>\n    st2.a\n\nvar State s = State.new(na)\nplot(f(true, s) + g(1, s))\n',
    expect: null,
    found: '2026-09-23',
    why:
      'Review finding on the #16 fix: the splitter counted every < and > as a bracket, so ' +
      '`close > open` in a default left the depth unbalanced and the next parameter was never declared.',
  },
  {
    name: '#16: a TIGHT comparison (no spaces) in a default does not swallow the next parameter',
    code: IND + 'type State\n    float a\n\nf(int n = bar_index<10 ? 1 : 2, State st) =>\n    st.a\n\ng(bool b = bar_index<=10, State st2, map<string, array<float>> m = na) =>\n    st2.a\n\nvar State s = State.new(na)\nplot(f(1, s) + g(true, s))\n',
    expect: null,
    found: '2026-09-23',
    why:
      'Delta review on the first splitter fix: `<` still opened a generic after any identifier, ' +
      'so `bar_index<10` swallowed the next parameter. Only array, matrix, map and .new open one now.',
  },
  {
    name: '#16: an undefined namespace inside a function body still flags',
    code: IND + 'g(float v) =>\n    nosuch.a + v\n\nplot(g(close))\n',
    expect: 'error',
    found: '2026-09-23',
    why: 'The paired case: collecting parameters must not blanket-accept every name in the body.',
  },
  {
    name: '#11: barcolor inside an if is a scope error',
    code: IND + 'if close > open\n    barcolor(color.white)\n',
    expect: 'S7',
    found: '2026-09-23',
    why: 'TradingView: "Cannot use \'barcolor\' in local scope". S7 listed bgcolor but not barcolor.',
  },
  {
    name: '#11: barcolor at global scope with a ternary is the correct idiom',
    code: IND + 'barcolor(close > open ? color.white : na)\n',
    expect: null,
    found: '2026-09-23',
    why: 'The paired negative for adding barcolor to S7: the fix TradingView documents (a ternary at global scope) must stay silent.',
  },

  //────────────────────────────────────────────────────────
  // 2026-09-23 re-crawl of the v6 reference
  //────────────────────────────────────────────────────────
  {
    name: 'crawl: forms TradingView added since 2025-10-03 validate clean',
    code: IND + 'v = ta.vwap(close, timeframe.change("D"), 1.0)\nph = ta.pivothigh(high, 5, 5)\nt = time("D", "0930-1600", "America/New_York", 1)\nl = line.new(bar_index[1], low, bar_index, high, xloc.bar_index, extend.none, color.red, line.style_solid, 1, true)\nx = input.int(5, "n", 1, 10, 1, "t", "a", "g", false, display.all, true)\nplot(v + x)\n',
    expect: null,
    found: '2026-09-23',
    why:
      'The 2025 crawl kept one syntax line per function and hand-written overrides lacked ' +
      'parameters added since (input.* display, ta.vwap stdev form, time() bars_back), so ' +
      'valid calls reported "Too many arguments".',
  },
  {
    name: 'crawl: footprint.* and volume_row.* are known functions',
    code: IND + 'fp = request.footprint(10)\nrow = footprint.get_row_by_price(fp, close)\nd = volume_row.delta(row)\npoc = footprint.poc(fp)\nplot(d)\n',
    expect: null,
    found: '2026-09-23',
    why: 'January-2026 API absent from the 2025 crawl; every call was "Undefined function".',
  },
  {
    name: 'crawl: a pivot call with four arguments is still too many',
    code: IND + 'ph = ta.pivothigh(high, 5, 5, 1)\nplot(ph)\n',
    expect: 'error',
    found: '2026-09-23',
    why: 'Paired "still flags": widening to the source overload must not make the maximum unbounded.',
  },
  {
    name: 'crawl: matrix.get without row and column is still missing arguments',
    code: IND + 'm = matrix.new<float>(2, 2, 0)\ng = matrix.get(m)\nplot(close)\n',
    expect: 'error',
    found: '2026-09-23',
    why: 'Paired "still flags": the re-crawl keeps each unchanged form\'s required set rather than re-guessing it.',
  },
  {
    name: 'crawl: an unknown footprint.* member is still undefined',
    code: IND + 'x = footprint.nosuch(1)\nplot(close)\n',
    expect: 'error',
    found: '2026-09-23',
    why: 'Paired "still flags": adding the footprint namespace must not accept every member of it.',
  },

  //────────────────────────────────────────────────────────
  // S10 — hard-coded external feed without ignore_invalid_symbol
  //────────────────────────────────────────────────────────
  {
    name: 'S10: a hard-coded external feed with no ignore_invalid_symbol halts on a plan that cannot read it',
    code: IND + 'd = request.security("FRED:WTREGEN", "W", close, barmerge.gaps_off, barmerge.lookahead_off)\nplot(d)\n',
    expect: 'S10',
    found: '2026-09-22',
    why:
      'A 26-feed macro dashboard compiled clean and died on the chart with "Permission denied for ' +
      'symbol: FRED:WTREGEN". Nothing in the tool could have said so; this hint can.',
  },
  {
    name: 'S10: ignore_invalid_symbol=true is the stated decision and must not fire',
    code: IND + 'd = request.security("FRED:WTREGEN", "W", close, barmerge.gaps_off, barmerge.lookahead_off, ignore_invalid_symbol=true)\nplot(d)\n',
    expect: null,
    found: '2026-09-22',
    why: 'The fix the hint recommends must be silent, or it trains people to ignore S10.',
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
