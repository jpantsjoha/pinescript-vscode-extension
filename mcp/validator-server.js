#!/usr/bin/env node

const readline = require('readline');
const { validatePineScript } = require('../test-comprehensive-validator.js');
const fs = require('fs');

// 1. Discovery Phase: Announce the tools this server provides.
const discovery = {
  "tools": [
    {
      "function_declarations": [
        {
          "name": "validate_pine_script",
          "description": "Parses and validates a Pine Script file using the project's validator, returning a list of errors.",
          "parameters": {
            "type": "OBJECT",
            "properties": {
              "file_path": {
                "type": "STRING",
                "description": "The absolute path to the .pine script file to be validated."
              }
            },
            "required": ["file_path"]
          }
        }
      ]
    }
  ]
};

// Send the discovery object to the Gemini CLI.
console.log(JSON.stringify(discovery));

// 2. Execution Phase: Listen for tool execution requests.
const rl = readline.createInterface({
  input: process.stdin
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);

    // We only have one tool, so we can hardcode the logic.
    if (request.tool_code && request.tool_code.name === 'validate_pine_script') {
      const filePath = request.tool_code.args.file_path;
      let errors = [];

      if (!fs.existsSync(filePath)) {
        errors.push({ line: 0, column: 0, message: `File not found: ${filePath}` });
      } else {
        const code = fs.readFileSync(filePath, 'utf-8');
        errors = validatePineScript(code);
      }

      // Send the result back to the Gemini CLI.
      const response = {
        "tool_result": {
          "tool_name": "validate_pine_script",
          "output": JSON.stringify(errors, null, 2)
        }
      };
      console.log(JSON.stringify(response));
    }
  } catch (e) {
    // Handle any errors during execution.
    const errorResponse = {
      "tool_result": {
        "tool_name": "validate_pine_script",
        "output": JSON.stringify([{ line: 0, column: 0, message: `Server error: ${e.message}` }]),
        "is_error": true
      }
    };
    console.log(JSON.stringify(errorResponse));
  }
});
