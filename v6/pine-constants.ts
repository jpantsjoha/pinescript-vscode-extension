/**
 * Pine Script v6 Constants and Built-in Namespaces
 * Extracted from official TradingView documentation and real-world examples
 *
 * Sources:
 * - https://www.tradingview.com/pine-script-docs/visuals/plots/
 * - https://www.tradingview.com/pine-script-docs/visuals/colors/
 * - Real example files from pinescript-vscode-extension/examples/
 */

// plot.style_* constants
export const PLOT_STYLES = new Set([
  'style_line',
  'style_linebr',
  'style_stepline',
  'style_stepline_diamond',
  'style_area',
  'style_areabr',
  'style_columns',
  'style_histogram',
  'style_circles',
  'style_cross'
]);

// color.* built-in colors
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

// color.* functions
export const COLOR_FUNCTIONS = new Set([
  'new',
  'rgb',
  'from_gradient',
  'r',
  'g',
  'b',
  't'
]);

// shape.* constants for plotshape/plotchar
export const SHAPE_CONSTANTS = new Set([
  'xcross',
  'cross',
  'circle',
  'triangleup',
  'triangledown',
  'flag',
  'arrowup',
  'arrowdown',
  'square',
  'diamond',
  'labelup',
  'labeldown'
]);

// location.* constants
export const LOCATION_CONSTANTS = new Set([
  'abovebar',
  'belowbar',
  'top',
  'bottom',
  'absolute'
]);

// size.* constants
export const SIZE_CONSTANTS = new Set([
  'auto',
  'tiny',
  'small',
  'normal',
  'large',
  'huge'
]);

// line.style_* constants
export const LINE_STYLES = new Set([
  'style_solid',
  'style_dotted',
  'style_dashed',
  'style_arrow_left',
  'style_arrow_right',
  'style_arrow_both'
]);

// label.style_* constants
export const LABEL_STYLES = new Set([
  'style_none',
  'style_xcross',
  'style_cross',
  'style_triangleup',
  'style_triangledown',
  'style_flag',
  'style_circle',
  'style_arrowup',
  'style_arrowdown',
  'style_label_up',
  'style_label_down',
  'style_label_left',
  'style_label_right',
  'style_label_center',
  'style_square',
  'style_diamond'
]);

// table.* position constants
export const TABLE_POSITIONS = new Set([
  'top_left',
  'top_center',
  'top_right',
  'middle_left',
  'middle_center',
  'middle_right',
  'bottom_left',
  'bottom_center',
  'bottom_right'
]);

// barstate.* constants
export const BARSTATE_CONSTANTS = new Set([
  'isfirst',
  'islast',
  'isconfirmed',
  'isnew',
  'isrealtime',
  'ishistory',
  'islastconfirmedhistory'
]);

// format.* constants (for number/price formatting)
export const FORMAT_CONSTANTS = new Set([
  'inherit',
  'price',
  'volume',
  'mintick',
  'percent'
]);

// alert.* constants (for alert frequency)
export const ALERT_CONSTANTS = new Set([
  'freq_once_per_bar',
  'freq_once_per_bar_close',
  'freq_all'
]);

// All namespace constants combined
export const NAMESPACE_CONSTANTS: Record<string, Set<string>> = {
  plot: PLOT_STYLES,
  color: new Set([...COLOR_CONSTANTS, ...COLOR_FUNCTIONS]),
  shape: SHAPE_CONSTANTS,
  location: LOCATION_CONSTANTS,
  size: SIZE_CONSTANTS,
  line: LINE_STYLES,
  label: LABEL_STYLES,
  table: TABLE_POSITIONS,
  barstate: BARSTATE_CONSTANTS,
  format: FORMAT_CONSTANTS,
  alert: ALERT_CONSTANTS
};

// Helper to check if a namespace member is valid
export function isValidNamespaceMember(namespace: string, member: string): boolean {
  const constants = NAMESPACE_CONSTANTS[namespace];
  if (!constants) return false;

  // Handle plot.style_* pattern
  if (namespace === 'plot' && member.startsWith('style_')) {
    return constants.has(member);
  }

  // Handle line.style_* pattern
  if (namespace === 'line' && member.startsWith('style_')) {
    return constants.has(member);
  }

  // Handle label.style_* pattern
  if (namespace === 'label' && member.startsWith('style_')) {
    return constants.has(member);
  }

  return constants.has(member);
}

// Get all members for a namespace
export function getNamespaceMembers(namespace: string): string[] {
  const constants = NAMESPACE_CONSTANTS[namespace];
  return constants ? Array.from(constants) : [];
}
