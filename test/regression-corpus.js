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

  {
    name: '#37 review: a variable named like a built-in namespace is a variable, not the namespace',
    code: IND + 'type PositionInfo\n    float entryPrice\nPositionInfo position = PositionInfo.new(100.0)\np = position.entryPrice\nplot(p)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Gemini review of #37: once the member check ran after "=", a UDT variable named `position` ' +
      'had its fields checked against the built-in position.* constants and failed.',
  },
  {
    name: '#37 review: tuple-destructured variables are declared',
    code: IND + 'type Coord\n    float x\ngetCoords() =>\n    [Coord.new(1.0), 10]\n[pt, count] = getCoords()\nv = pt.x\nplot(v)\n',
    expect: null,
    found: '2026-09-24',
    why: 'Gemini review of #37: `[pt, count] = f()` never declared pt, so `v = pt.x` became "undefined namespace".',
  },
  {
    name: '#37 review: a named argument still does not declare the namespace it names',
    code: IND + 'plot(close, color=color.purplee)\n',
    expect: 'error',
    found: '2026-09-24',
    why: 'Paired "still flags" for the declared-locals exemption: only statement-level declarations count.',
  },

  {
    name: '#37 review: a declaration inside a one-line switch arm or body is declared',
    code: IND + 'type Foo\n    float x\nFoo source = Foo.new(close)\nresult = switch\n    bar_index > 0 => Foo position = source, position.x\n    => 0.0\nplot(result)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Codex delta review of #41: the statement-level declaration regex was anchored at the line start, ' +
      'so `Foo position = source` after `=>` was missed and position.x was checked as built-in position.*.',
  },
  {
    name: '#37 review: a comma inside a call still never starts a declaration',
    code: IND + 'plot(close, color=color.purplee)\n',
    expect: 'error',
    found: '2026-09-24',
    why: 'Paired "still flags": statement splitting happens only at depth-0 commas and =>, never inside a call.',
  },

  {
    name: '#37 review: a map<K, V> declaration is not split at its generic comma',
    code: IND + 'map<string, float> position = map.new<string, float>()\nposition.put("x", close)\nv = position.size()\nplot(close)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Codex round-2 review of #41: statement splitting at depth-0 commas cut `map<string, float> position` ' +
      'in two, so `position` was not declared and its members were checked as built-in position.*.',
  },

  {
    name: '#37: an unknown function on a real built-in namespace is still undefined',
    code: IND + 'x = position.nosuchfn(1)\nplot(close)\n',
    expect: 'error',
    found: '2026-09-24',
    why: 'Paired "still flags" for exempting declared names in the undefined-function check: undeclared, it is the built-in namespace.',
  },

  {
    name: '#37 review: a field named new compared with < does not open a generic',
    code: IND + 'type Holder\n    float new\n    float x\nf(Holder h) => b = h.new<close, size = h, size.x\nplot(f(Holder.new(open, 1.0)))\n',
    expect: null,
    found: '2026-09-25',
    why: 'Codex round-3 review of #41: `.new<` matched any .new, so a comparison swallowed the following statement separators.',
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

  //────────────────────────────────────────────────────────
  // Issue #37 — namespace members after '=' were never checked
  //────────────────────────────────────────────────────────
  {
    name: '#37: a misspelled xloc constant in a plain assignment is flagged',
    code: IND + 'x = xloc.bar_indexx\nplot(x)\n',
    expect: 'error',
    found: '2026-09-24',
    why:
      'checkUndefinedNamespaces skipped any name.member preceded by /=\\w+\\s*=\\s*$/ — meant ' +
      'for named arguments — which also swallowed every plain assignment, so a typo that ' +
      'fails compilation on TradingView validated clean here.',
  },
  {
    name: '#37: a misspelled color constant as a named-argument value is flagged',
    code: IND + 'plot(close, color=color.purplee)\n',
    expect: 'error',
    found: '2026-09-24',
    why:
      'The same \'=\' skip hid named-argument VALUES too: color.purplee was never compared ' +
      'against the color constant list. Removing the skip is only safe because that list is ' +
      'complete — constants, color.* functions and all.',
  },
  {
    name: '#37: a misspelled shape constant in plotshape style= is flagged',
    code: IND + 'plotshape(true, style=shape.circlee)\n',
    expect: 'error',
    found: '2026-09-24',
    why:
      'Issue #37\'s own example: style=shape.circlee compiled nothing and warned nothing. ' +
      'shape has a closed constant list, so a member outside it is a fact, not a guess.',
  },
  {
    name: '#37: an unknown namespace after \'=\' is flagged, not just in call position',
    code: IND + 'z = nosuchns.value\nplot(close)\n',
    expect: 'error',
    found: '2026-09-24',
    why:
      'plot(nosuchns.value) was already an error while z = nosuchns.value said nothing — ' +
      'the \'=\' skip ran before the unknown-namespace branch. Both spellings of the same ' +
      'mistake must agree.',
  },
  {
    name: '#37: valid named-argument constants stay silent',
    code: IND + 'plot(close, style=plot.style_line)\nplotshape(true, style=shape.circle)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'The whole point of the old \'=\' skip was to leave named arguments alone. The fix ' +
      'validates the member instead of skipping the position, so the valid form must ' +
      'prove it still passes — otherwise the skip was load-bearing and removing it is wrong.',
  },
  {
    name: '#37: color.* functions and constants as named-argument values stay silent',
    code: IND + 'plot(close, color=color.new(color.red, 50))\nplot(close, color=color.rgb(1, 2, 3))\n',
    expect: null,
    found: '2026-09-24',
    why:
      'color is both a constant namespace and a function namespace; a member check that ' +
      'only knew the constants would call color.new and color.rgb errors — the exact false ' +
      'positive this issue\'s fix had to avoid.',
  },
  {
    name: '#37: valid constants assigned after \'=\' stay silent',
    code: IND + 'a = color.red\nb = xloc.bar_index\nc = math.pi\nd = display.all\nplot(a != color.red ? b : c)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Paired negative for the removed \'=\' skip: the four most common constant namespaces ' +
      'in assignment position must produce nothing, or plain assignments become noise.',
  },
  {
    name: '#37: built-in variables of dual-use namespaces stay silent after \'=\'',
    code: IND + 'a = strategy.position_size\nb = syminfo.tickerid\nc = timeframe.period\nd = barstate.islast\nplot(a + 1)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'strategy.position_size is a VARIABLE, not a constant or function — a member check ' +
      'that only consulted constants and function signatures would flag it. Dual-use ' +
      'namespaces must accept all three kinds of member.',
  },
  {
    name: '#37: namespaced function calls after \'=\' stay silent',
    code: IND + 'x = ta.sma(close, 14)\nfp = request.footprint(10)\ny = footprint.poc(fp)\np = chart.point.now(close)\nplot(x + y)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'ta, request, footprint and chart have no closed member list, so they are never ' +
      'member-checked at all — when unsure whether a member exists, do not flag it. ' +
      'chart.point is also a sub-namespace, not a member, and must not trip the check.',
  },
  {
    name: '#37: a user-defined type used after \'=\' stays silent',
    code: IND + 'type Foo\n    float a\nf = Foo.new(1.0)\nv = f.a\nplot(v)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Foo.new is a constructor and f.a field access; with the \'=\' skip gone these reach ' +
      'the namespace check for the first time, and only the declared-types exemption keeps ' +
      'them from being "undefined namespace".',
  },
  {
    name: '#37: an enum member used after \'=\' stays silent',
    code: IND + 'enum Side\n    long\n    short\ns = Side.long\nplot(s == Side.short ? 1 : 0)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Side.long looks exactly like namespace.constant. Enums are collected as declared ' +
      'types, and a declared type must shadow any namespace reading — never flagged.',
  },
  {
    name: '#37: an import alias used after \'=\' stays silent',
    code: IND + 'import user/lib/1 as ta2\nx = ta2.fn(close)\ny = ta2.other(x)\nplot(y)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Library aliases were never collected at all; only the \'=\' skip hid ta2.fn(). With ' +
      'the skip removed the alias must be a declared binding, or every library call in the ' +
      'wild becomes "undefined namespace".',
  },
  {
    name: '#37: an import WITHOUT alias binds the library name and stays silent',
    code: IND + 'import user/lib/1\nx = lib.fn(close)\nplot(x)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'Pine binds the last path segment when there is no `as` clause. Collecting only the ' +
      'alias form would flag the equally common bare form.',
  },
  {
    name: '#37: method calls on user objects stay silent after \'=\'',
    code: IND + 'a = array.new<float>()\na.push(close)\nn = a.size()\nplot(n)\n',
    expect: null,
    found: '2026-09-24',
    why:
      'a.push and a.size are method calls on a declared variable, not namespace members. ' +
      'The declared-variables exemption in the unknown-namespace branch is what keeps them ' +
      'silent once the \'=\' skip no longer does.',
  },
  //────────────────────────────────────────────────────────
  // #42 — statements wrapped across lines inside open brackets
  //────────────────────────────────────────────────────────
  {
    name: '#42: a wrapped method header still declares the method and this',
    code: IND + 'type Foo\n    float x\nmethod m(\n    Foo this\n) =>\n    this.x\nf = Foo.new(1.0)\nplot(m(f))\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Declarations were collected one physical line at a time, so a header whose parens ' +
      'close on a later line matched nothing: the body\'s this.x reported "Undefined ' +
      'namespace or variable \'this\'" and every call reported "Undefined function \'m\'" — ' +
      'two false positives on the documented method syntax.',
  },
  {
    name: '#42: a wrapped function header still declares a UDT parameter',
    code: IND + 'type Pt\n    float x\ngetX(\n    Pt p\n) =>\n    p.x\nplot(getX(Pt.new(1.0)))\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Same defect, plain-function form: the parameter list never matched the fnDef pattern ' +
      'when split across lines, so p.x in the body was "Undefined namespace or variable ' +
      '\'p\'" on code that compiles clean.',
  },
  {
    name: '#42: a wrapped tuple destructuring still declares every name',
    code: IND + 'type Pt\n    float x\ngetCoords() =>\n    [Pt.new(1.0), 2.0]\n[pt,\n count] = getCoords()\nplot(pt.x + count)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'The tuple pattern needed [ and ] on one line, so a wrapped destructuring bound ' +
      'nothing and pt.x was flagged "Undefined namespace or variable \'pt\'" — the issue\'s ' +
      'own example.',
  },
  {
    name: '#42: a wrapped call with named arguments spanning lines stays silent',
    code: IND + 'plot(\n    close,\n    color=color.red)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'The normal way to format a long plot call. Joining the statement must not turn the ' +
      'named argument into a declaration (which would exempt the namespace) nor into an ' +
      'unknown-name error — the member check still applies to the value.',
  },
  {
    name: '#42: a wrapped request.security with every argument stays silent',
    code: IND + 'x = request.security(\n    syminfo.tickerid,\n    "W",\n    close,\n    barmerge.gaps_off,\n    barmerge.lookahead_off)\nplot(x)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'request.security is the function most often wrapped in real scripts. Once arity runs ' +
      'on the joined statement, the full five-argument form must prove it still passes — ' +
      'otherwise the fix trades missed errors for false positives.',
  },
  {
    name: '#42: a wrapped ONE-argument request.security is an arity error',
    code: IND + 'x = request.security(\n     "FRED:WTREGEN")\nplot(x)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'The missed error behind the issue: extractBalancedArgs returned null when the parens ' +
      'did not close on one line, so arity was skipped — the gap was pinned as a known limit ' +
      'in test/request-arity.test.js until this fix flipped it.',
  },
  {
    name: '#42: a wrapped ta.sma missing its length is an arity error',
    code: IND + 's = ta.sma(\n    close)\nplot(s)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Paired "still flags" for the join: arity on wrapped calls is only worth having if it ' +
      'catches the ordinary case — one argument where two are required — not just the issue\'s ' +
      'own request.security example.',
  },
  {
    name: '#42: a misspelled constant stays flagged when the call is wrapped',
    code: IND + 'plot(\n    close,\n    color=color.purplee)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'A named argument at the start of a continuation line looked like a statement-level ' +
      'declaration, landing color in declaredLocals and exempting color.purplee from the ' +
      'member check. Lines interior to a wrap are not statement starts, so the #37 check ' +
      'must keep biting inside wrapped calls.',
  },
  {
    name: '#43: an unclosed bracket must not swallow the declarations below it',
    code: IND + 'bad = (\ntype Config\n    int len = 14\ncfg = Config.new()\nplot(close)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Independent review of #42: `bad = (` never closes, so the statement join ran to EOF ' +
      'and `type Config` was never collected — the `Config.new()` below the break was ' +
      'flagged "Undefined namespace or variable". One syntax error must not cascade into ' +
      'false positives on the rest of the file: the join now stops at a blank line, at a ' +
      'column-0 line that opens a new top-level statement, and after 50 lines.',
  },
  {
    name: '#43: a header whose => sits on its own line still declares the function',
    code: IND + 'customCalc(\n    int a,\n    int b\n)\n    =>\n    a + b\nplot(customCalc(1, 2))\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Independent review of #42: the join ended at the closing paren, so a wrapped header ' +
      'whose `=>` sits on the next line (Pine allows it) never matched the declaration ' +
      'pattern — the definition AND every call reported "Undefined function \'customCalc\'".',
  },
  {
    name: '#43: timeframe on a continuation line satisfies timeframe_gaps',
    code: '//@version=6\nindicator("Wrapped", timeframe_gaps=true,\n    timeframe="D")\nplot(close)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Independent review of #42: validateSpecialCases received the PHYSICAL line, so a ' +
      'wrapped indicator whose timeframe= sat on the next line warned that timeframe_gaps ' +
      'has no effect — a false positive on the normal formatting of this call. Checks that ' +
      'inspect arguments now see the joined statement. (The corpus tolerates bare warnings ' +
      'in null cases, so test/wrapped-statement-location.test.js pins this silence.)',
  },
  {
    name: '#43: a call opened mid-line after a closer is still arity-checked',
    code: IND + 'x = math.abs(close\n) + ta.sma(\n    close,\n    14,\n    99\n)\nplot(x)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Independent review of #42 (the miss itself predates the PR): the `) + ta.sma(` line ' +
      'drove the join depth to -1 and back to 0, ending the "wrap" before ta.sma\'s own ' +
      'opener — the three-argument ta.sma escaped the arity check. Depth is now clamped at 0.',
  },
  {
    name: '#43 d1: a nested call argument named shape is not plotshape\'s parameter (wrapped)',
    code: IND + 'passthrough(float shape) => shape\nplotshape(\n    passthrough(\n        shape=close\n    ) > 0\n)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Codex delta review of #43: the plotshape/plotchar special case searched the whole ' +
      'argument region for a "shape=" substring instead of inspecting the call\'s own ' +
      'top-level arguments, so a NESTED call\'s named argument was reported as plotshape\'s ' +
      'obsolete shape parameter. (The review\'s `myshape=` spelling was saved by a word ' +
      'boundary; an argument literally named `shape` was not.)',
  },
  {
    name: '#43 d1: a nested call argument named shape is not plotshape\'s parameter (one line)',
    code: IND + 'passthrough(float shape) => shape\nplotshape(passthrough(shape=close) > 0)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'The same nested-argument leak on one physical line. This form fires on origin/main ' +
      'too — the document-wide check predates the PR — so the fix is not just a delta ' +
      'correction, it repairs a shipped false positive.',
  },
  {
    name: '#43 d1: a nested call argument named shape is not plotchar\'s parameter either',
    code: IND + 'passthrough(float shape) => shape\nplotchar(passthrough(shape=close) > 0)\n',
    expect: null,
    found: '2026-09-25',
    why: 'plotchar shares the plotshape special case; the leak and the fix are the same code.',
  },
  {
    name: '#43 d1: a real top-level shape= argument in a WRAPPED plotshape still flags',
    code: IND + 'plotshape(\n    close > open,\n    shape=shape.circle\n)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Paired "still flags" for the nested-leak fix: restricting the check to top-level ' +
      'argument names must not silence the genuine case when the call itself is wrapped. ' +
      '(The single-line form is the older "plotshape uses style=, not shape=" case.)',
  },
  {
    name: '#43 d1: a nested timeframe_gaps does not warn on the enclosing indicator',
    code: '//@version=6\nf(bool timeframe_gaps) => timeframe_gaps\nindicator("t", shorttitle=f(timeframe_gaps=true) ? "x" : "y")\nplot(close)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'The indicator/strategy special case substring-searched the joined statement for ' +
      '"timeframe_gaps", so a NESTED call\'s argument warned that the enclosing indicator ' +
      'was missing a timeframe it never needed. (The corpus tolerates bare warnings in ' +
      'null cases, so test/wrapped-statement-location.test.js pins this silence.)',
  },
  {
    name: '#43 d2: a column-0 named argument after a comma does not end the join',
    code: IND + 'plot(\nclose,\ncolor=color.red,\nbogus=1\n)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Codex delta review of #43: `color=color.red,` at column 0 matched the assignment ' +
      'pattern and ended the statement join, so the invalid `bogus` argument on the next ' +
      'line was never seen. A trailing comma on the previous line is the continuation ' +
      'signal. (Also the first case that checks plot\'s named arguments: plot\'s parameter ' +
      'list is one of the manually verified specs, so `bogus` is a fact, not a guess.)',
  },
  {
    name: '#43 d2: a column-0 wrapped VALID plot call stays silent',
    code: IND + 'plot(\nclose,\ncolor=color.red\n)\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Paired negative for the comma-continuation rule: once the join reaches the named ' +
      'argument, plot\'s curated parameter list must accept it — and the continuation line ' +
      'must not be collected as a statement-level declaration of `color` either.',
  },
  {
    name: '#43 d2: a user function named plotter is not a plot statement',
    code: IND + 'plotter(float a) => a\nlbl = label.new(\nplotter(close),\nbogus=1\n)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Codex delta review of #43: the `plot\\w*` pattern treated `plotter(close),` at ' +
      'column 0 as a new plot statement, ending the join and hiding the invalid `bogus` ' +
      'argument of label.new. Only the real plot family names count now.',
  },
  {
    name: '#43 d3: a 60-line wrapped array.from produces no diagnostic',
    code: IND + 'a = array.from(\n' + Array(58).fill('    close,').join('\n') + '\n    close\n)\nplot(a.size())\n',
    expect: null,
    found: '2026-09-25',
    why:
      'Codex delta review of #43: the 50-line cap included the 51st line (off by one). ' +
      'The cap exists so a huge wrapped call is skipped whole rather than validated ' +
      'piecemeal; this case locks both the skip and the absence of any new diagnostic ' +
      'from the lines the cut leaves behind.',
  },
  {
    name: '#43: a bad named argument on a continuation line is still named',
    code: IND + 'lbl = label.new(\n    x=bar_index,\n    y=close,\n    text="Test",\n    invalid_named_param=123\n)\n',
    expect: 'error',
    found: '2026-09-25',
    why:
      'Independent review of #42: the named-parameter check itself was right, but it ' +
      'reported at the call\'s first line — the squiggle pointed at label.new instead of ' +
      'the argument. The error now lands on the argument\'s own physical line and column ' +
      '(pinned in test/wrapped-statement-location.test.js).',
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
