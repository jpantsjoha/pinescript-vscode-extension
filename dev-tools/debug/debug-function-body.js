#!/usr/bin/env node

const fs = require('fs');
const { Lexer } = require('./dist/src/parser/lexer');
const { Parser } = require('./dist/src/parser/parser');

const code = fs.readFileSync('./examples/global-liquidity.v6.pine', 'utf-8');

// Extract just the f_norm function
const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('f_norm(x, n)'));
const functionCode = lines.slice(startIdx, startIdx + 3).join('\n');

console.log('Function code:');
console.log(functionCode);
console.log('\n--- Parsing ---\n');

const parser = new Parser(functionCode);
const ast = parser.parse();

console.log('AST body length:', ast.body.length);

if (ast.body.length > 0) {
  const func = ast.body[0];
  console.log('\nFunction:', func.name);
  console.log('Params:', func.params.map(p => p.name));
  console.log('Body statements:', func.body.length);

  func.body.forEach((stmt, i) => {
    console.log(`\nStatement ${i}:`, stmt.type);
    if (stmt.type === 'VariableDeclaration') {
      console.log('  Variable name:', stmt.name);
      console.log('  Has init:', !!stmt.init);
    } else if (stmt.type === 'ReturnStatement') {
      console.log('  Return value type:', stmt.value.type);
    } else if (stmt.type === 'ExpressionStatement') {
      console.log('  Expression type:', stmt.expression.type);
    }
  });

  if (func.body.length < 2) {
    console.log('\n❌ PROBLEM: Only', func.body.length, 'statement(s) in body. Expected 2 (ma = ..., ternary)');
  } else {
    console.log('\n✅ SUCCESS: Multi-line function body parsed correctly!');
  }
}
