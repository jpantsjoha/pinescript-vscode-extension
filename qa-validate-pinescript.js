#!/usr/bin/env node
/**
 * QA Automation: PineScript Validation
 *
 * Automatically validates all PineScript files in the project
 * Returns exit code 0 if all files pass, 1 if any errors found
 *
 * Usage:
 *   node qa-validate-pinescript.js                    # Validate all .pine files
 *   node qa-validate-pinescript.js path/to/file.pine  # Validate specific file
 *   npm run qa:pinescript                             # Via npm script
 */

const { validatePineScript } = require('./test-comprehensive-validator.js');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

function validateFile(filePath) {
  console.log(`\n${colorize('Validating:', colors.cyan)} ${filePath}`);

  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const errors = validatePineScript(code);

    // Separate errors by severity
    const realErrors = errors.filter(e => e.severity === 0 && !e.message.includes('declared but never used'));
    const warnings = errors.filter(e => e.severity === 1 || e.message.includes('declared but never used'));

    // Print summary
    console.log(`  Total issues: ${errors.length}`);
    console.log(`  ${colorize('Errors:', colors.red)} ${realErrors.length}`);
    console.log(`  ${colorize('Warnings:', colors.yellow)} ${warnings.length}`);

    if (realErrors.length === 0) {
      console.log(`  ${colorize('✓ PASS', colors.green)} - No critical errors`);
      return { file: filePath, passed: true, errors: [], warnings: warnings.length };
    } else {
      console.log(`  ${colorize('✗ FAIL', colors.red)} - ${realErrors.length} critical error(s)`);

      // Group errors by type
      const errorGroups = {};
      realErrors.forEach(e => {
        const msg = e.message;
        if (!errorGroups[msg]) {
          errorGroups[msg] = [];
        }
        errorGroups[msg].push(e);
      });

      // Print first 5 unique error types
      console.log(`\n  ${colorize('Top Error Types:', colors.bold)}`);
      Object.entries(errorGroups).slice(0, 5).forEach(([msg, errs]) => {
        console.log(`    [${errs.length}x] ${msg}`);
        // Show first occurrence line number
        console.log(`      → Line ${errs[0].line}`);
      });

      if (Object.keys(errorGroups).length > 5) {
        console.log(`    ... and ${Object.keys(errorGroups).length - 5} more error types`);
      }

      return { file: filePath, passed: false, errors: realErrors, warnings: warnings.length };
    }
  } catch (error) {
    console.log(`  ${colorize('✗ ERROR', colors.red)} - Failed to validate: ${error.message}`);
    return { file: filePath, passed: false, errors: [{ message: error.message }], warnings: 0 };
  }
}

function main() {
  console.log(colorize('='.repeat(80), colors.blue));
  console.log(colorize('  PineScript v6 Validation QA Report', colors.bold));
  console.log(colorize('='.repeat(80), colors.blue));

  let filesToValidate = [];

  // Check if specific file provided
  if (process.argv.length > 2) {
    const specifiedFile = process.argv[2];
    if (fs.existsSync(specifiedFile)) {
      filesToValidate = [specifiedFile];
    } else {
      console.log(`${colorize('Error:', colors.red)} File not found: ${specifiedFile}`);
      process.exit(1);
    }
  } else {
    // Find all .pine files using native Node.js
    const findPineFiles = (dir) => {
      const results = [];
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          // Skip ignored directories
          if (item.isDirectory()) {
            if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
              results.push(...findPineFiles(fullPath));
            }
          } else if (item.name.endsWith('.pine')) {
            results.push(fullPath);
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
      return results;
    };

    // Search in specific directories
    const searchDirs = ['examples', 'test', '.'];
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        filesToValidate.push(...findPineFiles(dir));
      }
    }

    // Remove duplicates
    filesToValidate = [...new Set(filesToValidate)];
  }

  if (filesToValidate.length === 0) {
    console.log(`\n${colorize('No PineScript files found to validate', colors.yellow)}`);
    process.exit(0);
  }

  console.log(`\nFound ${colorize(filesToValidate.length, colors.bold)} file(s) to validate\n`);

  // Validate all files
  const results = filesToValidate.map(validateFile);

  // Print summary
  console.log(colorize('\n' + '='.repeat(80), colors.blue));
  console.log(colorize('  Validation Summary', colors.bold));
  console.log(colorize('='.repeat(80), colors.blue));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);

  console.log(`\n  Total Files:    ${results.length}`);
  console.log(`  ${colorize('Passed:', colors.green)}        ${passed}`);
  console.log(`  ${colorize('Failed:', colors.red)}        ${failed}`);
  console.log(`  Total Errors:   ${totalErrors}`);
  console.log(`  Total Warnings: ${totalWarnings}`);

  if (failed > 0) {
    console.log(`\n${colorize('Failed Files:', colors.red)}`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.file} (${r.errors.length} error(s))`);
    });
  }

  console.log(colorize('\n' + '='.repeat(80), colors.blue));

  if (failed === 0) {
    console.log(colorize('\n✓ All PineScript files validated successfully!', colors.green));
    process.exit(0);
  } else {
    console.log(colorize(`\n✗ Validation failed for ${failed} file(s)`, colors.red));
    console.log(colorize('  Fix errors before committing or deploying', colors.yellow));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateFile };
