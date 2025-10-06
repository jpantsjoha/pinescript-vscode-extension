const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');

// Exact pattern from tun-satiroglu.pine lines 110-125
const code = `//@version=6
indicator("Test")

src = close
mult = 3.0
length = 10

atr = mult * ta.atr(length)

wicks = true
highPrice = wicks ? high : close
lowPrice = wicks ? low : close
doji4price = open == close and open == low and open == high

longStop = src - atr
longStopPrev = nz(longStop[1], longStop)

if longStop > 0
    if doji4price
        longStop := longStopPrev
    else
        longStop := lowPrice[1] > longStopPrev ? math.max(longStop, longStopPrev) : longStop
else
    longStop := longStopPrev
`;

console.log('=== Testing exact pattern from tun-satiroglu.pine ===\n');

const parser = new Parser(code);
const ast = parser.parse();

const validator = new ComprehensiveValidator();
const errors = validator.validate(ast);

console.log(`Total errors: ${errors.length}\n`);

// Only show non-warning errors
const criticalErrors = errors.filter(e => e.severity === 0);
console.log(`Critical errors: ${criticalErrors.length}\n`);

criticalErrors.forEach(err => {
  console.log(`Line ${err.line}: ${err.message}`);
});
