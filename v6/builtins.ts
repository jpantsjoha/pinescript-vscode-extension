export const V6_BUILTIN_VARS: Record<string, string> = {
  bar_index: 'Current bar index.',
  time: 'Current bar time.',
  open: 'Open price of the current bar.',
  high: 'High price of the current bar.',
  low: 'Low price of the current bar.',
  close: 'Close price of the current bar.',
  volume: 'Volume of the current bar.',
  'strategy.equity': 'Current equity of the strategy.',
  'syminfo.ticker': 'Ticker symbol.',
  'barstate.isfirst': 'True if the current bar is the first bar.',
  'barstate.islast': 'True if the current bar is the last bar.',
};

export const V6_BUILTIN_FUNCS: Record<string, string> = {
  indicator: 'Declares an indicator script.',
  strategy: 'Declares a strategy script.',
  plot: 'Plots a series of data.',
  plotshape: 'Plots shapes on the chart.',
  alertcondition: 'Creates an alert condition.',
  // TA
  'ta.sma': 'Simple Moving Average.',
  'ta.ema': 'Exponential Moving Average.',
  'ta.rsi': 'Relative Strength Index.',
  'ta.vwap': 'Volume Weighted Average Price.',
  'ta.highest': 'Highest value in a series.',
  'ta.lowest': 'Lowest value in a series.',
  'ta.change': 'Change between the current and previous value.',
  // input
  'input.int': 'Integer input.',
  'input.float': 'Float input.',
  'input.bool': 'Boolean input.',
  'input.string': 'String input.',
  'input.timeframe': 'Timeframe input.',
  'input.session': 'Session input.',
  // request
  'request.security': 'Requests data from another symbol or resolution.',
  // math
  'math.min': 'Minimum of two values.',
  'math.max': 'Maximum of two values.',
  'math.abs': 'Absolute value.',
  'math.sqrt': 'Square root.',
  // color
  'color.new': 'Creates a new color.',
};

export const V6_KEYWORDS: string[] = ['if','else','for','while','break','continue','return','var','const'];

