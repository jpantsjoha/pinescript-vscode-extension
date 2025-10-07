const { Lexer, TokenType } = require('./dist/src/parser/lexer');

// Test what tokens are generated for "color = color.gray"
const code = `color = color.gray`;

console.log('=== Testing token generation for named argument ===\n');
console.log(`Code: ${code}\n`);

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

console.log('Tokens:');
tokens.forEach((token, i) => {
  if (token.type !== 'WHITESPACE' && token.type !== 'EOF') {
    console.log(`  ${i}: ${token.type.padEnd(15)} "${token.value}"`);
  }
});

// Now test the actual problematic line from tun-satiroglu
const problematicLine = `plot(enableWaveTrend ? 0 : na, color = color.gray, title = 'WaveTrend - Zero Line')`;

console.log('\n\n=== Testing problematic plot() call ===\n');
console.log(`Code: ${problematicLine}\n`);

const lexer2 = new Lexer(problematicLine);
const tokens2 = lexer2.tokenize();

console.log('Tokens (showing around named argument):');
tokens2.forEach((token, i) => {
  if (token.type !== 'WHITESPACE' && token.type !== 'EOF') {
    console.log(`  ${i}: ${token.type.padEnd(15)} "${token.value}"`);
  }
});
