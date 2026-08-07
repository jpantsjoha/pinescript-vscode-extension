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

/**
 * One concrete overload of a built-in function.
 *
 * Pine v6 overloads several functions on their *coordinate* form: the drawing
 * constructors accept either a `chart.point` object or independent x/y values.
 * The auto-generated scrape only ever captured the first overload listed in the
 * reference manual, so the second form false-flagged ("No parameter named 'x1'",
 * "Too many arguments"). Representing overloads explicitly is the fix — flattening
 * them into one param list is what caused the bug in the first place.
 */
export interface FunctionOverload {
  requiredParams: string[];
  optionalParams: string[];
  signature: string;
}

export interface FunctionSignatureSpec {
  name: string;
  requiredParams: string[];  // Parameters that MUST be provided
  optionalParams: string[];  // Parameters that CAN be omitted
  signature: string;         // Full signature for display
  /**
   * Present only for functions with more than one call form. When set, a call is
   * valid if it satisfies ANY overload: the arity check uses min(required) and
   * max(required+optional) across overloads, and named-argument validation accepts
   * the union of all overloads' parameter names.
   */
  overloads?: FunctionOverload[];
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
    // `calc_on_every_history_tick` added July 2026 (runs the script on every
    // available tick of each historical bar).
    optionalParams: ['shorttitle', 'overlay', 'format', 'precision', 'scale', 'pyramiding', 'calc_on_order_fills', 'calc_on_every_tick', 'calc_on_every_history_tick', 'max_bars_back', 'backtest_fill_limits_assumption', 'default_qty_type', 'default_qty_value', 'initial_capital', 'currency', 'slippage', 'commission_type', 'commission_value', 'process_orders_on_close', 'close_entries_rule', 'margin_long', 'margin_short', 'explicit_plot_zorder', 'max_lines_count', 'max_labels_count', 'max_boxes_count', 'calc_bars_count', 'risk_free_rate', 'use_bar_magnifier', 'fill_orders_on_standard_ohlc', 'max_polylines_count', 'dynamic_requests', 'behind_chart'],
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

  // v6 supports two overloads: (leftbars, rightbars) and (source, leftbars, rightbars).
  // The auto-generated data only captured the 2-arg form, which false-flagged the 3-arg
  // form ("too many arguments"). Count-only validation: 2 required + 1 optional source = max 3.
  'ta.pivothigh': {
    name: 'ta.pivothigh',
    requiredParams: ['leftbars', 'rightbars'],
    optionalParams: ['source'],
    signature: 'ta.pivothigh([source], leftbars, rightbars)'
  },

  'ta.pivotlow': {
    name: 'ta.pivotlow',
    requiredParams: ['leftbars', 'rightbars'],
    optionalParams: ['source'],
    signature: 'ta.pivotlow([source], leftbars, rightbars)'
  },
};

/**
 * Drawing-object constructors — the overloaded ones.
 *
 * Verified against the v6 reference manual (Visuals → "Lines and boxes" /
 * "Text and shapes"). Each of these has TWO call forms: a `chart.point` form and
 * an independent-coordinate form. The generated scrape captured only the former,
 * which made the far more common coordinate form (`line.new(x1=..., y1=...)`)
 * report a wall of false errors.
 */
const DRAWING_TEXT_TAIL = [
  'text', 'text_size', 'text_color', 'text_halign', 'text_valign', 'text_wrap',
  'text_font_family', 'force_overlay', 'text_formatting'
];

const BOX_STYLE_TAIL = [
  'border_color', 'border_width', 'border_style', 'extend', 'xloc', 'bgcolor',
  ...DRAWING_TEXT_TAIL
];

const LINE_STYLE_TAIL = ['xloc', 'extend', 'color', 'style', 'width', 'force_overlay'];

const LABEL_STYLE_TAIL = [
  'xloc', 'yloc', 'color', 'style', 'textcolor', 'size', 'textalign', 'tooltip',
  'text_font_family', 'force_overlay', 'text_formatting'
];

export const DRAWING_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  'line.new': {
    name: 'line.new',
    // Loosest form, used when overload-aware checking is unavailable.
    requiredParams: ['first_point', 'second_point'],
    optionalParams: ['x1', 'y1', 'x2', 'y2', ...LINE_STYLE_TAIL],
    signature: 'line.new(first_point, second_point, xloc, extend, color, style, width, force_overlay) | line.new(x1, y1, x2, y2, xloc, extend, color, style, width, force_overlay)',
    overloads: [
      {
        requiredParams: ['first_point', 'second_point'],
        optionalParams: LINE_STYLE_TAIL,
        signature: 'line.new(first_point, second_point, xloc, extend, color, style, width, force_overlay)'
      },
      {
        requiredParams: ['x1', 'y1', 'x2', 'y2'],
        optionalParams: LINE_STYLE_TAIL,
        signature: 'line.new(x1, y1, x2, y2, xloc, extend, color, style, width, force_overlay)'
      }
    ]
  },

  'label.new': {
    name: 'label.new',
    requiredParams: ['point'],
    optionalParams: ['x', 'y', 'text', ...LABEL_STYLE_TAIL],
    signature: 'label.new(point, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting) | label.new(x, y, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting)',
    overloads: [
      {
        requiredParams: ['point'],
        optionalParams: ['text', ...LABEL_STYLE_TAIL],
        signature: 'label.new(point, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting)'
      },
      {
        requiredParams: ['x', 'y'],
        optionalParams: ['text', ...LABEL_STYLE_TAIL],
        signature: 'label.new(x, y, text, xloc, yloc, color, style, textcolor, size, textalign, tooltip, text_font_family, force_overlay, text_formatting)'
      }
    ]
  },

  'box.new': {
    name: 'box.new',
    requiredParams: ['top_left', 'bottom_right'],
    optionalParams: ['left', 'top', 'right', 'bottom', ...BOX_STYLE_TAIL],
    signature: 'box.new(top_left, bottom_right, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting) | box.new(left, top, right, bottom, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting)',
    overloads: [
      {
        requiredParams: ['top_left', 'bottom_right'],
        optionalParams: BOX_STYLE_TAIL,
        signature: 'box.new(top_left, bottom_right, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting)'
      },
      {
        requiredParams: ['left', 'top', 'right', 'bottom'],
        optionalParams: BOX_STYLE_TAIL,
        signature: 'box.new(left, top, right, bottom, border_color, border_width, border_style, extend, xloc, bgcolor, text, text_size, text_color, text_halign, text_valign, text_wrap, text_font_family, force_overlay, text_formatting)'
      }
    ]
  },

  // Single-overload drawing constructors. Listed here so the validator's
  // named-argument check has verified data for the whole drawing family rather
  // than a mix of verified and scraped entries.
  'polyline.new': {
    name: 'polyline.new',
    requiredParams: ['points'],
    optionalParams: ['curved', 'closed', 'xloc', 'line_color', 'fill_color', 'line_style', 'line_width', 'force_overlay'],
    signature: 'polyline.new(points, curved, closed, xloc, line_color, fill_color, line_style, line_width, force_overlay)'
  },

  'table.new': {
    name: 'table.new',
    requiredParams: ['position', 'columns', 'rows'],
    optionalParams: ['bgcolor', 'frame_color', 'frame_width', 'border_color', 'border_width', 'force_overlay'],
    signature: 'table.new(position, columns, rows, bgcolor, frame_color, frame_width, border_color, border_width, force_overlay)'
  },

  'table.cell': {
    name: 'table.cell',
    requiredParams: ['table_id', 'column', 'row'],
    optionalParams: ['text', 'width', 'height', 'text_color', 'text_halign', 'text_valign', 'text_size', 'bgcolor', 'tooltip', 'text_font_family', 'text_formatting'],
    signature: 'table.cell(table_id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family, text_formatting)'
  },

  // `label.set_*` coordinate setters mirror the constructor overloads.
  'label.set_xy': {
    name: 'label.set_xy',
    requiredParams: ['id', 'x', 'y'],
    optionalParams: [],
    signature: 'label.set_xy(id, x, y)'
  },

  'label.set_text': {
    name: 'label.set_text',
    requiredParams: ['id', 'text'],
    optionalParams: [],
    signature: 'label.set_text(id, text)'
  },

  'label.set_point': {
    name: 'label.set_point',
    requiredParams: ['id', 'point'],
    optionalParams: [],
    signature: 'label.set_point(id, point)'
  },

  // Added to Pine v6 in March 2025 — absent from the Oct-2025 scrape.
  'box.set_xloc': {
    name: 'box.set_xloc',
    requiredParams: ['id', 'left', 'right', 'xloc'],
    optionalParams: [],
    signature: 'box.set_xloc(id, left, right, xloc)'
  },
};

/**
 * Pine v6 API added AFTER the 2025-10-03 reference scrape.
 *
 * The generated dataset is a point-in-time crawl, so anything TradingView shipped
 * later is simply absent. These entries close that gap; each carries the release
 * that introduced it so the next re-crawl can drop whatever it now covers.
 * Source: https://www.tradingview.com/pine-script-docs/release-notes/
 */
export const MODERN_V6_FUNCTIONS: Record<string, FunctionSignatureSpec> = {
  // October 2025 — `timeframe_bars_back` added to time() / time_close().
  'time': {
    name: 'time',
    requiredParams: ['timeframe'],
    optionalParams: ['session', 'timezone', 'bars_back', 'timeframe_bars_back'],
    signature: 'time(timeframe, session, timezone, bars_back, timeframe_bars_back)'
  },

  'time_close': {
    name: 'time_close',
    requiredParams: ['timeframe'],
    optionalParams: ['session', 'timezone', 'bars_back', 'timeframe_bars_back'],
    signature: 'time_close(timeframe, session, timezone, bars_back, timeframe_bars_back)'
  },

  // April 2026 — `sort_field` added so UDT collections can be sorted by field.
  'array.sort': {
    name: 'array.sort',
    requiredParams: ['id'],
    optionalParams: ['order', 'sort_field'],
    signature: 'array.sort(id, order, sort_field)'
  },

  'array.sort_indices': {
    name: 'array.sort_indices',
    requiredParams: ['id'],
    optionalParams: ['order', 'sort_field'],
    signature: 'array.sort_indices(id, order, sort_field)'
  },

  'matrix.sort': {
    name: 'matrix.sort',
    requiredParams: ['id'],
    optionalParams: ['column', 'order', 'sort_field'],
    signature: 'matrix.sort(id, column, order, sort_field)'
  },

  // January 2026 — volume footprint data (Premium/Ultimate plans).
  'request.footprint': {
    name: 'request.footprint',
    requiredParams: ['symbol', 'timeframe'],
    optionalParams: ['row_size', 'ignore_invalid_symbol', 'currency', 'calc_bars_count'],
    signature: 'request.footprint(symbol, timeframe, row_size, ignore_invalid_symbol, currency, calc_bars_count)'
  },
};

/**
 * July 2025 — every `input.*()` function gained an `active` parameter controlling
 * whether the user can edit the input in the Settings dialog. Applied uniformly
 * rather than repeated across all twelve declarations above.
 */
const INPUT_FUNCTIONS_WITH_ACTIVE: Record<string, FunctionSignatureSpec> = Object.fromEntries(
  Object.entries(INPUT_FUNCTIONS).map(([name, spec]) => [
    name,
    { ...spec, optionalParams: [...spec.optionalParams, 'active'] }
  ])
);

/**
 * ALL FUNCTION SIGNATURES
 */
export const ALL_FUNCTION_SIGNATURES: Record<string, FunctionSignatureSpec> = {
  ...CORE_FUNCTIONS,
  ...PLOT_FUNCTIONS,
  ...ALERT_FUNCTIONS,
  ...INPUT_FUNCTIONS_WITH_ACTIVE,
  ...TA_FUNCTIONS,
  ...DRAWING_FUNCTIONS,
  ...MODERN_V6_FUNCTIONS,
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
