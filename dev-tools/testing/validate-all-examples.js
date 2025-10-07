#!/usr/bin/env node
/**
 * Validate all example Pine Script files
 */

const fs = require('fs');
const path = require('path');
const { AccurateValidator } = require('./dist/src/parser/accurateValidator');

const examplesDir = path.join(__dirname, 'examples');
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.pine'));

console.log('\n🔍 Validating all example Pine Script files...\n');

let totalErrors = 0;
let totalWarnings = 0;

for (const file of files) {
  const filePath = path.join(examplesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const validator = new AccurateValidator();
  const errors = validator.validate(content);

  const errorCount = errors.filter(e => e.severity === 0).length;
  const warningCount = errors.filter(e => e.severity === 1).length;

  totalErrors += errorCount;
  totalWarnings += warningCount;

  const status = errorCount === 0 ? '✅' : '❌';
  console.log(`${status} ${file}`);
  console.log(`   Errors: ${errorCount}, Warnings: ${warningCount}`);

  if (errors.length > 0) {
    errors.slice(0, 3).forEach(err => {
      const severityLabel = err.severity === 0 ? 'ERROR' : 'WARN';
      console.log(`   L${err.line}: [${severityLabel}] ${err.message}`);
    });
    if (errors.length > 3) {
      console.log(`   ... and ${errors.length - 3} more`);
    }
  }
  console.log('');
}

console.log('━'.repeat(60));
console.log(`📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings across ${files.length} files`);
console.log('━'.repeat(60));

if (totalErrors === 0) {
  console.log('✅ All example files validated successfully!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some files have validation errors\n');
  process.exit(1);
}
