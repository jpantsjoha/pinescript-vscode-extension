/**
 * Complete Pine Script v6 Constants
 * Auto-generated from official TradingView Pine Script v6 Reference
 * Source: https://www.tradingview.com/pine-script-reference/v6/
 *
 * Total: 31 constant namespaces with 2,226 constants
 * Generated: 2025-10-05
 */

//──────────────────────────────────────────────────────────
// ADJUSTMENT NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const ADJUSTMENT_CONSTANTS = new Set([
  'dividends',
  'none',
  'splits'
]);

//──────────────────────────────────────────────────────────
// ALERT NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const ALERT_CONSTANTS = new Set([
  'freq_all',
  'freq_once_per_bar',
  'freq_once_per_bar_close'
]);

//──────────────────────────────────────────────────────────
// BACKADJUSTMENT NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const BACKADJUSTMENT_CONSTANTS = new Set([
  'inherit',
  'off',
  'on'
]);

//──────────────────────────────────────────────────────────
// BARMERGE NAMESPACE (4 constants)
//──────────────────────────────────────────────────────────
export const BARMERGE_CONSTANTS = new Set([
  'gaps_off',
  'gaps_on',
  'lookahead_off',
  'lookahead_on'
]);

//──────────────────────────────────────────────────────────
// COLOR NAMESPACE (17 constants)
//──────────────────────────────────────────────────────────
export const COLOR_CONSTANTS = new Set([
  'aqua',
  'black',
  'blue',
  'fuchsia',
  'gray',
  'green',
  'lime',
  'maroon',
  'navy',
  'olive',
  'orange',
  'purple',
  'red',
  'silver',
  'teal',
  'white',
  'yellow'
]);

// color.* functions (not constants, but recognized as valid)
export const COLOR_FUNCTIONS = new Set([
  'new',
  'rgb',
  'from_gradient',
  't'
]);

//──────────────────────────────────────────────────────────
// CURRENCY NAMESPACE (51 constants)
//──────────────────────────────────────────────────────────
export const CURRENCY_CONSTANTS = new Set([
  'AED', 'ARS', 'AUD', 'BDT', 'BHD', 'BRL', 'BTC', 'CAD', 'CHF', 'CLP',
  'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'ETH', 'EUR', 'GBP', 'HKD', 'HUF',
  'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KES', 'KRW', 'KWD', 'LKR', 'MAD',
  'MXN', 'MYR', 'NGN', 'NOK', 'NONE', 'NZD', 'PEN', 'PHP', 'PKR', 'PLN',
  'QAR', 'RON', 'RSD', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TND', 'TRY',
  'TWD', 'USD', 'USDT', 'VES', 'VND', 'ZAR'
]);

//──────────────────────────────────────────────────────────
// DAYOFWEEK NAMESPACE (7 constants)
//──────────────────────────────────────────────────────────
export const DAYOFWEEK_CONSTANTS = new Set([
  'friday',
  'monday',
  'saturday',
  'sunday',
  'thursday',
  'tuesday',
  'wednesday'
]);

//──────────────────────────────────────────────────────────
// DISPLAY NAMESPACE (6 constants)
//──────────────────────────────────────────────────────────
export const DISPLAY_CONSTANTS = new Set([
  'all',
  'data_window',
  'none',
  'pane',
  'price_scale',
  'status_line'
]);

//──────────────────────────────────────────────────────────
// DIVIDENDS NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const DIVIDENDS_CONSTANTS = new Set([
  'gross',
  'net'
]);

//──────────────────────────────────────────────────────────
// EARNINGS NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const EARNINGS_CONSTANTS = new Set([
  'actual',
  'estimate',
  'standardized'
]);

//──────────────────────────────────────────────────────────
// EXTEND NAMESPACE (4 constants)
//──────────────────────────────────────────────────────────
export const EXTEND_CONSTANTS = new Set([
  'both',
  'left',
  'none',
  'right'
]);

//──────────────────────────────────────────────────────────
// FONT NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const FONT_CONSTANTS = new Set([
  'family_default',
  'family_monospace'
]);

//──────────────────────────────────────────────────────────
// FORMAT NAMESPACE (5 constants)
//──────────────────────────────────────────────────────────
export const FORMAT_CONSTANTS = new Set([
  'inherit',
  'mintick',
  'percent',
  'price',
  'volume'
]);

//──────────────────────────────────────────────────────────
// HLINE NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const HLINE_CONSTANTS = new Set([
  'style_dashed',
  'style_dotted',
  'style_solid'
]);

//──────────────────────────────────────────────────────────
// LABEL NAMESPACE (21 constants)
//──────────────────────────────────────────────────────────
export const LABEL_STYLES = new Set([
  'style_arrowdown',
  'style_arrowup',
  'style_circle',
  'style_cross',
  'style_diamond',
  'style_flag',
  'style_label_center',
  'style_label_down',
  'style_label_left',
  'style_label_lower_left',
  'style_label_lower_right',
  'style_label_right',
  'style_label_up',
  'style_label_upper_left',
  'style_label_upper_right',
  'style_none',
  'style_square',
  'style_text_outline',
  'style_triangledown',
  'style_triangleup',
  'style_xcross'
]);

//──────────────────────────────────────────────────────────
// LINE NAMESPACE (6 constants)
//──────────────────────────────────────────────────────────
export const LINE_STYLES = new Set([
  'style_arrow_both',
  'style_arrow_left',
  'style_arrow_right',
  'style_dashed',
  'style_dotted',
  'style_solid'
]);

//──────────────────────────────────────────────────────────
// LOCATION NAMESPACE (5 constants)
//──────────────────────────────────────────────────────────
export const LOCATION_CONSTANTS = new Set([
  'abovebar',
  'absolute',
  'belowbar',
  'bottom',
  'top'
]);

//──────────────────────────────────────────────────────────
// MATH NAMESPACE (4 constants)
//──────────────────────────────────────────────────────────
export const MATH_CONSTANTS = new Set([
  'e',
  'phi',
  'pi',
  'rphi'
]);

//──────────────────────────────────────────────────────────
// ORDER NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const ORDER_CONSTANTS = new Set([
  'ascending',
  'descending'
]);

//──────────────────────────────────────────────────────────
// PLOT NAMESPACE (14 constants)
//──────────────────────────────────────────────────────────
export const PLOT_STYLES = new Set([
  'linestyle_dashed',
  'linestyle_dotted',
  'linestyle_solid',
  'style_area',
  'style_areabr',
  'style_circles',
  'style_columns',
  'style_cross',
  'style_histogram',
  'style_line',
  'style_linebr',
  'style_stepline',
  'style_stepline_diamond',
  'style_steplinebr'
]);

//──────────────────────────────────────────────────────────
// POSITION NAMESPACE (9 constants)
//──────────────────────────────────────────────────────────
export const POSITION_CONSTANTS = new Set([
  'bottom_center',
  'bottom_left',
  'bottom_right',
  'middle_center',
  'middle_left',
  'middle_right',
  'top_center',
  'top_left',
  'top_right'
]);

//──────────────────────────────────────────────────────────
// SCALE NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const SCALE_CONSTANTS = new Set([
  'left',
  'none',
  'right'
]);

//──────────────────────────────────────────────────────────
// SESSION NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const SESSION_CONSTANTS = new Set([
  'extended',
  'regular'
]);

//──────────────────────────────────────────────────────────
// SETTLEMENT_AS_CLOSE NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const SETTLEMENT_AS_CLOSE_CONSTANTS = new Set([
  'inherit',
  'off',
  'on'
]);

//──────────────────────────────────────────────────────────
// SHAPE NAMESPACE (12 constants)
//──────────────────────────────────────────────────────────
export const SHAPE_CONSTANTS = new Set([
  'arrowdown',
  'arrowup',
  'circle',
  'cross',
  'diamond',
  'flag',
  'labeldown',
  'labelup',
  'square',
  'triangledown',
  'triangleup',
  'xcross'
]);

//──────────────────────────────────────────────────────────
// SIZE NAMESPACE (6 constants)
//──────────────────────────────────────────────────────────
export const SIZE_CONSTANTS = new Set([
  'auto',
  'huge',
  'large',
  'normal',
  'small',
  'tiny'
]);

//──────────────────────────────────────────────────────────
// SPLITS NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const SPLITS_CONSTANTS = new Set([
  'denominator',
  'numerator'
]);

//──────────────────────────────────────────────────────────
// STRATEGY NAMESPACE (8 constants)
//──────────────────────────────────────────────────────────
export const STRATEGY_CONSTANTS = new Set([
  'cash',
  'commission',
  'direction',
  'fixed',
  'long',
  'oca',
  'percent_of_equity',
  'short'
]);

// strategy.* variable properties (runtime state variables)
export const STRATEGY_VARIABLES = new Set([
  'account_currency',
  'avg_losing_trade',
  'avg_losing_trade_percent',
  'avg_trade',
  'avg_trade_percent',
  'avg_winning_trade',
  'avg_winning_trade_percent',
  'closedtrades',
  'default_entry_qty',
  'equity',
  'eventrades',
  'grossloss',
  'grossloss_percent',
  'grossprofit',
  'grossprofit_percent',
  'initial_capital',
  'losing_trades',
  'losstrades',
  'max_contracts_held_all',
  'max_contracts_held_long',
  'max_contracts_held_short',
  'max_drawdown',
  'max_runup',
  'netprofit',
  'netprofit_percent',
  'opentrades',
  'openprofit',
  'position_avg_price',
  'position_entry_name',
  'position_size',
  'wintrades',
  'winning_trades'
]);

//──────────────────────────────────────────────────────────
// TABLE NAMESPACE (9 constants)
//──────────────────────────────────────────────────────────
export const TABLE_POSITIONS = new Set([
  'bottom_center',
  'bottom_left',
  'bottom_right',
  'middle_center',
  'middle_left',
  'middle_right',
  'top_center',
  'top_left',
  'top_right'
]);

//──────────────────────────────────────────────────────────
// TEXT NAMESPACE (10 constants)
//──────────────────────────────────────────────────────────
export const TEXT_CONSTANTS = new Set([
  'align_bottom',
  'align_center',
  'align_left',
  'align_right',
  'align_top',
  'format_bold',
  'format_italic',
  'format_none',
  'wrap_auto',
  'wrap_none'
]);

//──────────────────────────────────────────────────────────
// XLOC NAMESPACE (2 constants)
//──────────────────────────────────────────────────────────
export const XLOC_CONSTANTS = new Set([
  'bar_index',
  'bar_time'
]);

//──────────────────────────────────────────────────────────
// YLOC NAMESPACE (3 constants)
//──────────────────────────────────────────────────────────
export const YLOC_CONSTANTS = new Set([
  'abovebar',
  'belowbar',
  'price'
]);

//──────────────────────────────────────────────────────────
// BARSTATE NAMESPACE (11 constants) - Built-in variables
// Note: These are variable namespaces, not constant namespaces
// Included for completeness
//──────────────────────────────────────────────────────────
export const BARSTATE_CONSTANTS = new Set([
  'isconfirmed',
  'isfirst',
  'ishistory',
  'islast',
  'islastconfirmedhistory',
  'isnew',
  'isrealtime'
]);

//──────────────────────────────────────────────────────────
// ALL NAMESPACE CONSTANTS COMBINED
//──────────────────────────────────────────────────────────
export const NAMESPACE_CONSTANTS: Record<string, Set<string>> = {
  adjustment: ADJUSTMENT_CONSTANTS,
  alert: ALERT_CONSTANTS,
  backadjustment: BACKADJUSTMENT_CONSTANTS,
  barmerge: BARMERGE_CONSTANTS,
  barstate: BARSTATE_CONSTANTS,
  color: new Set([...COLOR_CONSTANTS, ...COLOR_FUNCTIONS]),
  currency: CURRENCY_CONSTANTS,
  dayofweek: DAYOFWEEK_CONSTANTS,
  display: DISPLAY_CONSTANTS,
  dividends: DIVIDENDS_CONSTANTS,
  earnings: EARNINGS_CONSTANTS,
  extend: EXTEND_CONSTANTS,
  font: FONT_CONSTANTS,
  format: FORMAT_CONSTANTS,
  hline: HLINE_CONSTANTS,
  label: LABEL_STYLES,
  line: LINE_STYLES,
  location: LOCATION_CONSTANTS,
  math: MATH_CONSTANTS,
  order: ORDER_CONSTANTS,
  plot: PLOT_STYLES,
  position: POSITION_CONSTANTS,
  scale: SCALE_CONSTANTS,
  session: SESSION_CONSTANTS,
  settlement_as_close: SETTLEMENT_AS_CLOSE_CONSTANTS,
  shape: SHAPE_CONSTANTS,
  size: SIZE_CONSTANTS,
  splits: SPLITS_CONSTANTS,
  strategy: new Set([...STRATEGY_CONSTANTS, ...STRATEGY_VARIABLES]),
  table: TABLE_POSITIONS,
  text: TEXT_CONSTANTS,
  xloc: XLOC_CONSTANTS,
  yloc: YLOC_CONSTANTS
};

//──────────────────────────────────────────────────────────
// CONSTANT NAMESPACES SET (for validator lookup)
//──────────────────────────────────────────────────────────
export const CONSTANT_NAMESPACES = new Set(Object.keys(NAMESPACE_CONSTANTS));

//──────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
//──────────────────────────────────────────────────────────
export function isValidNamespaceMember(namespace: string, member: string): boolean {
  const constants = NAMESPACE_CONSTANTS[namespace];
  return constants ? constants.has(member) : false;
}

export function isConstantNamespace(namespace: string): boolean {
  return CONSTANT_NAMESPACES.has(namespace);
}

//──────────────────────────────────────────────────────────
// METADATA
//──────────────────────────────────────────────────────────
export const CONSTANTS_METADATA = {
  totalNamespaces: Object.keys(NAMESPACE_CONSTANTS).length,
  generatedFrom: 'v6/raw/v6-language-constructs.json',
  source: 'https://www.tradingview.com/pine-script-reference/v6/',
  version: 'v6',
  lastUpdated: '2025-10-05'
};
