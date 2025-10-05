/**
 * OFFICIAL Parameter Requirements for Pine Script v6 Built-in Functions
 * Source: TradingView Pine Script v6 Reference Manual
 * https://www.tradingview.com/pine-script-reference/v6/
 *
 * This file contains MANUALLY VERIFIED parameter requirements based on:
 * 1. Official TradingView documentation
 * 2. Working Pine Script examples
 * 3. TradingView Pine Editor validation
 *
 * Convention: Parameters marked with '?' are OPTIONAL
 *             Parameters without '?' are REQUIRED
 */

export interface FunctionSignatureSpec {
  name: string;
  requiredParams: string[];  // Parameters that MUST be provided
  optionalParams: string[];  // Parameters that CAN be omitted
  signature: string;         // Full signature for display
}

/**
 * Core Functions - Declaration and Setup
 */
export const CORE_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'indicator': {
    name: 'indicator',
    requiredParams: ['title'],
    optionalParams: ['shorttitle', 'overlay', 'format', 'precision', 'scale', 'max_bars_back', 'timeframe', 'timeframe_gaps', 'explicit_plot_zorder', 'max_lines_count', 'max_labels_count', 'max_boxes_count', 'calc_bars_count', 'max_polylines_count', 'dynamic_requests', 'behind_chart'],
    signature: 'indicator(title, shorttitle?, overlay?, format?, precision?, scale?, max_bars_back?, timeframe?, timeframe_gaps?, explicit_plot_zorder?, max_lines_count?, max_labels_count?, max_boxes_count?, calc_bars_count?, max_polylines_count?, dynamic_requests?, behind_chart?)'
  },

  'strategy': {
    name: 'strategy',
    requiredParams: ['title'],
    optionalParams: ['shorttitle', 'overlay', 'format', 'precision', 'scale', 'pyramiding', 'calc_on_order_fills', 'calc_on_every_tick', 'max_bars_back', 'backtest_fill_limits_assumption', 'default_qty_type', 'default_qty_value', 'initial_capital', 'currency', 'slippage', 'commission_type', 'commission_value', 'process_orders_on_close', 'close_entries_rule', 'margin_long', 'margin_short', 'explicit_plot_zorder', 'max_lines_count', 'max_labels_count', 'max_boxes_count', 'calc_bars_count', 'risk_free_rate', 'use_bar_magnifier', 'fill_orders_on_standard_ohlc', 'max_polylines_count', 'dynamic_requests', 'behind_chart'],
    signature: 'strategy(title, shorttitle?, overlay?, ...)'
  },

  'library': {
    name: 'library',
    requiredParams: ['title'],
    optionalParams: [],
    signature: 'library(title)'
  },
};

/**
 * Plotting Functions
 */
export const PLOT_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'plot': {
    name: 'plot',
    requiredParams: ['series'],
    optionalParams: ['title', 'color', 'linewidth', 'style', 'trackprice', 'histbase', 'offset', 'join', 'editable', 'show_last', 'display', 'format', 'precision', 'force_overlay', 'linestyle'],
    signature: 'plot(series, title?, color?, linewidth?, style?, ...)'
  },

  'plotshape': {
    name: 'plotshape',
    requiredParams: ['series'],
    optionalParams: ['title', 'style', 'location', 'color', 'offset', 'text', 'textcolor', 'editable', 'size', 'show_last', 'display', 'format', 'precision', 'force_overlay'],
    signature: 'plotshape(series, title?, style?, location?, color?, ...)'
  },

  'plotchar': {
    name: 'plotchar',
    requiredParams: ['series'],
    optionalParams: ['title', 'char', 'location', 'color', 'offset', 'text', 'textcolor', 'editable', 'size', 'show_last', 'display', 'format', 'precision', 'force_overlay'],
    signature: 'plotchar(series, title?, char?, location?, color?, ...)'
  },

  'plotcandle': {
    name: 'plotcandle',
    requiredParams: ['open', 'high', 'low', 'close'],
    optionalParams: ['title', 'color', 'wickcolor', 'editable', 'show_last', 'bordercolor', 'display'],
    signature: 'plotcandle(open, high, low, close, title?, ...)'
  },

  'plotbar': {
    name: 'plotbar',
    requiredParams: ['open', 'high', 'low', 'close'],
    optionalParams: ['title', 'color', 'editable', 'show_last', 'display'],
    signature: 'plotbar(open, high, low, close, title?, ...)'
  },

  'bgcolor': {
    name: 'bgcolor',
    requiredParams: ['color'],
    optionalParams: ['offset', 'editable', 'show_last', 'title', 'display', 'force_overlay'],
    signature: 'bgcolor(color, offset?, editable?, show_last?, title?, display?, force_overlay?)'
  },

  'barcolor': {
    name: 'barcolor',
    requiredParams: ['color'],
    optionalParams: ['offset', 'editable', 'show_last', 'title', 'display'],
    signature: 'barcolor(color, offset?, editable?, show_last?, title?, display?)'
  },

  'fill': {
    name: 'fill',
    requiredParams: ['plot1', 'plot2'],
    optionalParams: ['color', 'title', 'editable', 'show_last', 'fillgaps', 'display'],
    signature: 'fill(plot1, plot2, color?, title?, ...)'
  },

  'hline': {
    name: 'hline',
    requiredParams: ['price'],
    optionalParams: ['title', 'color', 'linestyle', 'linewidth', 'editable', 'display'],
    signature: 'hline(price, title?, color?, linestyle?, ...)'
  },
};

/**
 * Alert Functions
 */
export const ALERT_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'alert': {
    name: 'alert',
    requiredParams: ['message'],
    optionalParams: ['freq'],
    signature: 'alert(message, freq?)'
  },

  'alertcondition': {
    name: 'alertcondition',
    requiredParams: ['condition'],
    optionalParams: ['title', 'message'],
    signature: 'alertcondition(condition, title?, message?)'
  },
};

/**
 * Input Functions
 */
export const INPUT_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'input.int': {
    name: 'input.int',
    requiredParams: ['defval'],
    optionalParams: ['title', 'minval', 'maxval', 'step', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.int(defval, title?, minval?, maxval?, step?, tooltip?, inline?, group?, confirm?)'
  },

  'input.float': {
    name: 'input.float',
    requiredParams: ['defval'],
    optionalParams: ['title', 'minval', 'maxval', 'step', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.float(defval, title?, minval?, maxval?, step?, tooltip?, inline?, group?, confirm?)'
  },

  'input.bool': {
    name: 'input.bool',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.bool(defval, title?, tooltip?, inline?, group?, confirm?)'
  },

  'input.string': {
    name: 'input.string',
    requiredParams: ['defval'],
    optionalParams: ['title', 'options', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.string(defval, title?, options?, tooltip?, inline?, group?, confirm?)'
  },

  'input.color': {
    name: 'input.color',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.color(defval, title?, tooltip?, inline?, group?, confirm?)'
  },

  'input.source': {
    name: 'input.source',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group'],
    signature: 'input.source(defval, title?, tooltip?, inline?, group?)'
  },

  'input.timeframe': {
    name: 'input.timeframe',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group'],
    signature: 'input.timeframe(defval, title?, tooltip?, inline?, group?)'
  },

  'input.symbol': {
    name: 'input.symbol',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group'],
    signature: 'input.symbol(defval, title?, tooltip?, inline?, group?)'
  },

  'input.session': {
    name: 'input.session',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group'],
    signature: 'input.session(defval, title?, tooltip?, inline?, group?)'
  },

  'input.price': {
    name: 'input.price',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.price(defval, title?, tooltip?, inline?, group?, confirm?)'
  },

  'input.time': {
    name: 'input.time',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'inline', 'group', 'confirm'],
    signature: 'input.time(defval, title?, tooltip?, inline?, group?, confirm?)'
  },

  'input.text_area': {
    name: 'input.text_area',
    requiredParams: ['defval'],
    optionalParams: ['title', 'tooltip', 'group', 'confirm'],
    signature: 'input.text_area(defval, title?, tooltip?, group?, confirm?)'
  },
};

/**
 * Technical Analysis Functions (ta.*)
 */
export const TA_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'ta.sma': {
    name: 'ta.sma',
    requiredParams: ['source', 'length'],
    optionalParams: [],
    signature: 'ta.sma(source, length)'
  },

  'ta.ema': {
    name: 'ta.ema',
    requiredParams: ['source', 'length'],
    optionalParams: [],
    signature: 'ta.ema(source, length)'
  },

  'ta.rsi': {
    name: 'ta.rsi',
    requiredParams: ['source', 'length'],
    optionalParams: [],
    signature: 'ta.rsi(source, length)'
  },

  'ta.crossover': {
    name: 'ta.crossover',
    requiredParams: ['source1', 'source2'],
    optionalParams: [],
    signature: 'ta.crossover(source1, source2)'
  },

  'ta.crossunder': {
    name: 'ta.crossunder',
    requiredParams: ['source1', 'source2'],
    optionalParams: [],
    signature: 'ta.crossunder(source1, source2)'
  },

  'ta.cross': {
    name: 'ta.cross',
    requiredParams: ['source1', 'source2'],
    optionalParams: [],
    signature: 'ta.cross(source1, source2)'
  },
};

/**
 * ALL FUNCTION SIGNATURES
 */
export const ALL_FUNCTION_SIGNATURES: Record<string, FunctionSignatureSpec> = {
  ...CORE_FUNCTIONS,
  ...PLOT_FUNCTIONS,
  ...ALERT_FUNCTIONS,
  ...INPUT_FUNCTIONS,
  ...TA_FUNCTIONS,
};

/**
 * Helper function to check if a parameter is required
 */
export function isParameterRequired(functionName: string, parameterName: string): boolean {
  const spec = ALL_FUNCTION_SIGNATURES[functionName];
  if (!spec) return false;
  return spec.requiredParams.includes(parameterName);
}

/**
 * Helper function to get required parameter count
 */
export function getRequiredParameterCount(functionName: string): number {
  const spec = ALL_FUNCTION_SIGNATURES[functionName];
  if (!spec) return 0;
  return spec.requiredParams.length;
}
