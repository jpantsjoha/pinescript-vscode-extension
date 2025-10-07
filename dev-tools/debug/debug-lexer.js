const { Lexer } = require('./dist/src/parser/lexer.js');

const code = `wUSM2  = input.float(0.35, "US M2",  step=0.01, minval=0, maxval=1, group=grpWts)`;
const lexer = new Lexer(code);
const tokens = lexer.tokenize();

console.log('Tokens for line 18:');
tokens.forEach(t => {
  if (t.type !== 'WHITESPACE' && t.type !== 'EOF') {
    console.log(t.type, ':', t.value);
  }
});
