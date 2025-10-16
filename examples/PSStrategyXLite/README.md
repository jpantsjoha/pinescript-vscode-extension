# PSStrategyX Lite (Pine Script v6) — Signal Executor

This folder contains a minimal, open-source strategy modeled after the public description of PSStrategyX. It focuses on executing external buy/sell/exit signals, adding risk controls, and emitting broker-connector alert payloads for automation.

Links referenced:
- TradingView publication overview: https://www.tradingview.com/script/ZUqQdIKU-pAulseperformance-PSStrategyX/
- Pine Script v6 reference: https://www.tradingview.com/pine-script-reference/v6/
- Local guide: `GEMINI.md` in repo (v6 best practices, signatures, constants)

## Files
- `PSStrategyXLite.pine` — Strategy that consumes 1/-1/0 signals, manages orders, provides alert payloads, circuit breakers, SL/TP, and a summary table.

## What this does (feature parity goals)
- Broker-connector alerts (Autoview-style payload templates) for entry/exit.
- Built-in backtester compatibility (uses `strategy.*`, SL/TP, optional trailing).
- Trade-by-trade markers and a compact chart summary table.
- Circuit breakers: max drawdown %, max consecutive losses, session filter.
- Opposite-signal reversal option (mimics “reverse on opposite”).

## What this is NOT
- Not a signal generator. You must supply signals from a separate indicator.
- Not affiliated with PSStrategyX. This is an open-source teaching example.

## How to use
1) Put your indicator on the chart that outputs a single plot encoded as:
   - buy = 1, sell = -1, exit = 0, otherwise na
   Example:
   ```pine
   plot(buy ? 1 : sell ? -1 : exit ? 0 : na)
   ```
2) Add `PSStrategyXLite.pine` to the same chart.
3) In the inputs:
   - Set Signal Symbol/Timeframe if your signal is from another symbol/tf.
   - Keep “Fetch signals via request.security” enabled to pull that plot.
4) Enable “Broker Connector (Alerts)” and configure `exchange` and `pair`.
5) Create 3 alerts using conditions provided by the strategy:
   - Connector: LONG
   - Connector: SHORT
   - Connector: EXIT
   Each alert’s message body should be the default placeholder or customized to match your connector’s exact syntax.

## Alert payloads (templates)
- LONG:  `{EXCHANGE} {PAIR} buy`
- SHORT: `{EXCHANGE} {PAIR} sell`
- EXIT:  `{EXCHANGE} {PAIR} close`

Adjust to your connector’s docs (Autoview, 3Commas, etc.). Some connectors require JSON or additional flags (qty, reduce-only, post-only). Add formatting to the `payload()` function in `PSStrategyXLite.pine` accordingly.

## Risk controls
- Max drawdown % circuit breaker: disables trading once reached (shows red background).
- Max consecutive losing trades: disables trading after N losses.
- Session filter: only trade during the specified local session.
- SL/TP: static percent stops/targets plus optional trailing (`trail_points`, `trail_offset`).

## LLM Prompt (reproducible generation)
Copy-paste the following prompt to recreate/enhance this strategy with an LLM that understands Pine v6 and the rules in `GEMINI.md`.

```
You are a Pine Script v6 expert. Build a strategy that:
- Executes external signals: one plot with 1 (buy), -1 (sell), 0 (exit)
- Uses request.security() (lookahead_off) to fetch that series by symbol/timeframe
- Supports reverse-on-opposite behavior and optional shorts
- Adds SL/TP and optional trailing; uses strategy.exit for both sides
- Adds circuit breakers: max drawdown % and max consecutive losing trades
- Adds session filter, trade markers, and a compact KPI table (equity, net P&L, trades, W/L, PF, DD, circuit status)
- Emits three alert conditions suitable for a broker connector (Autoview-like): LONG/SHORT/EXIT
- Provide clean, commented code per Pine v6 and `GEMINI.md`
```

Optionally extend the prompt with connector-specific fields (qty, leverage, reduce-only) and table metrics (Sharpe/Sortino per PineCoders formulas) to approach PSStrategyX feature richness.

## Notes
- For non‑repainting HTF signals, keep lookahead off and consider using confirmed values (e.g., previous bar on HTF) as described in `GEMINI.md`.
- If your connector requires order sizing in the alert body, remove quantities from Pine orders (backtesting only) and encode size in alert strings per connector docs.

## License
MIT for this example. Use at your own risk. This is educational, not financial advice.


