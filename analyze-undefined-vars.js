const { Parser } = require('./dist/src/parser/parser');
const { ComprehensiveValidator } = require('./dist/src/parser/comprehensiveValidator');
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{examples,test}/**/*.pine', { ignore: ['**/node_modules/**'] });

console.log('=== Undefined Variable Analysis ===\n');

const undefinedVars = [];

files.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const parser = new Parser(code);
    const ast = parser.parse();
    const validator = new ComprehensiveValidator();
    const errors = validator.validate(ast);

    errors.forEach(err => {
      if (err.message.startsWith('Undefined variable')) {
        const match = err.message.match(/Undefined variable '([^']+)'/);
        if (match) {
          const varName = match[1];
          undefinedVars.push({
            file: file.replace(/^examples\//, '').replace(/^test\//, ''),
            line: err.line,
            varName,
            message: err.message
          });
        }
      }
    });
  } catch (e) {
    // Skip parse errors
  }
});

console.log(`Total undefined variable errors: ${undefinedVars.length}\n`);

// Group by variable name
const byVarName = {};
undefinedVars.forEach(uv => {
  if (!byVarName[uv.varName]) {
    byVarName[uv.varName] = [];
  }
  byVarName[uv.varName].push(uv);
});

console.log('=== Most Common Undefined Variables ===\n');
Object.entries(byVarName)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([varName, errors]) => {
    console.log(`[${errors.length.toString().padStart(3)}x] '${varName}'`);

    // Show files where this appears
    const fileCount = {};
    errors.forEach(e => {
      fileCount[e.file] = (fileCount[e.file] || 0) + 1;
    });

    Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([file, count]) => {
        console.log(`       ${file}:${errors.find(e => e.file === file).line} (${count}x)`);
      });
    console.log('');
  });

// Check if these variables are actually declared in the files
console.log('\n=== Verifying if variables exist in source ===\n');

const topUndefined = Object.entries(byVarName)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

topUndefined.forEach(([varName, errors]) => {
  const file = errors[0].file;
  const fullPath = file.includes('/') ? `examples/${file}` : `test/${file}`;

  try {
    const code = fs.readFileSync(fullPath, 'utf8');

    // Search for variable declaration patterns
    const patterns = [
      new RegExp(`^${varName}\\s*=`, 'm'),        // varName = ...
      new RegExp(`^var\\s+\\w+\\s+${varName}`, 'm'), // var type varName
      new RegExp(`^${varName}\\s*:=`, 'm'),       // varName := ... (reassignment)
    ];

    const found = patterns.some(p => p.test(code));

    if (found) {
      console.log(`✗ '${varName}' IS declared in ${file} but not recognized by validator`);

      // Show the declaration line
      const lines = code.split('\n');
      lines.forEach((line, i) => {
        if (patterns.some(p => p.test(line))) {
          console.log(`   Line ${i + 1}: ${line.trim()}`);
        }
      });
    } else {
      console.log(`✓ '${varName}' NOT found in ${file} (legitimate error)`);
    }
  } catch (e) {
    console.log(`? '${varName}' in ${file} - could not verify`);
  }
  console.log('');
});
