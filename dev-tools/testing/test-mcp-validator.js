#!/usr/bin/env node
/**
 * Test script for MCP PineScript Validator
 *
 * Tests the MCP server's validate_pine_script tool
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MCP_SERVER = path.join(__dirname, 'mcp/validator-server.js');
const TEST_FILE = path.join(__dirname, 'examples/global-liquidity.v6.pine');

console.log('🧪 Testing MCP PineScript Validator\n');

// Start MCP server
const server = spawn('node', [MCP_SERVER], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';
let testsPassed = 0;
let testsFailed = 0;

server.stdout.on('data', (data) => {
  buffer += data.toString();

  // Process complete JSON-RPC messages
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line in buffer

  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        handleResponse(response);
      } catch (e) {
        console.error('Failed to parse response:', e.message);
        console.error('Raw line:', line);
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n📊 Test Results:`);
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  📦 Exit code: ${code}`);

  if (testsFailed > 0) {
    process.exit(1);
  }
});

let currentTest = 0;
const tests = [
  {
    name: 'Initialize MCP server',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '1.0',
        capabilities: {}
      }
    },
    validate: (response) => {
      if (!response.tools || !response.tools[0]) {
        throw new Error('No tools returned');
      }

      const tool = response.tools[0].function_declarations[0];
      if (tool.name !== 'validate_pine_script') {
        throw new Error('Wrong tool name: ' + tool.name);
      }

      console.log('  ✅ MCP server initialized');
      console.log('  📦 Tool:', tool.name);
      console.log('  📝 Description:', tool.description.substring(0, 60) + '...');
    }
  },
  {
    name: 'List available tools',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    validate: (response) => {
      if (!response.tools || response.tools.length === 0) {
        throw new Error('No tools listed');
      }

      console.log('  ✅ Tools listed');
      console.log('  📦 Count:', response.tools.length);
      response.tools.forEach(tool => {
        console.log('    -', tool.name);
      });
    }
  },
  {
    name: 'Validate Pine Script file',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'validate_pine_script',
        arguments: {
          file_path: TEST_FILE
        }
      }
    },
    validate: (response) => {
      if (!response.content || response.content.length === 0) {
        throw new Error('No content in response');
      }

      const result = response.content[0];
      if (result.type !== 'text') {
        throw new Error('Wrong content type: ' + result.type);
      }

      const errors = JSON.parse(result.text);
      console.log('  ✅ Validation completed');
      console.log('  📊 Total errors:', errors.length);

      // Filter real errors
      const realErrors = errors.filter(e =>
        e.severity === 0 && !e.message.includes('declared but never used')
      );
      console.log('  🔍 Critical errors:', realErrors.length);

      if (realErrors.length > 0) {
        console.log('  📝 First 3 errors:');
        realErrors.slice(0, 3).forEach(err => {
          console.log(`    - Line ${err.line}: ${err.message}`);
        });
      }
    }
  }
];

function handleResponse(response) {
  const test = tests[currentTest];
  if (!test) return;

  try {
    console.log(`\n🔬 Test ${currentTest + 1}: ${test.name}`);
    test.validate(response);
    testsPassed++;

    currentTest++;
    if (currentTest < tests.length) {
      // Send next test
      setTimeout(() => sendRequest(tests[currentTest].request), 100);
    } else {
      // All tests done
      setTimeout(() => server.kill(), 500);
    }
  } catch (error) {
    console.error(`  ❌ Test failed:`, error.message);
    testsFailed++;
    server.kill();
  }
}

function sendRequest(request) {
  const message = JSON.stringify(request) + '\n';
  server.stdin.write(message);
}

// Start testing
setTimeout(() => {
  sendRequest(tests[0].request);
}, 100);
