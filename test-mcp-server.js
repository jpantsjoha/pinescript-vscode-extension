#!/usr/bin/env node

/**
 * Test script for MCP server
 * Validates that the MCP server works correctly
 */

const { spawn } = require('child_process');
const path = require('path');

// Test the MCP server
async function testMCPServer() {
  console.log('🧪 Testing Pine Script MCP Server...\n');

  const serverPath = path.join(__dirname, 'mcp', 'pinescript-mcp-server.js');
  const server = spawn('node', [serverPath]);

  let stdoutData = '';
  let stderrData = '';

  server.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  server.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.error('Server stderr:', data.toString());
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 1: Initialize
  console.log('📤 Test 1: Initialize request');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    },
  };
  server.stdin.write(JSON.stringify(initRequest) + '\n');

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 2: List tools
  console.log('📤 Test 2: List tools request');
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  };
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 3: Validate a file
  console.log('📤 Test 3: Validate file request');
  const testFile = path.join(__dirname, 'examples', 'global-liquidity.v6.pine');
  const validateRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'validate_pine_script',
      arguments: {
        file_path: testFile,
      },
    },
  };
  server.stdin.write(JSON.stringify(validateRequest) + '\n');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Close server
  server.stdin.end();

  await new Promise((resolve) => {
    server.on('close', (code) => {
      console.log('\n✅ Server closed with code:', code);
      resolve();
    });
  });

  // Parse and display results
  console.log('\n📥 Server responses:\n');
  const lines = stdoutData.split('\n').filter((line) => line.trim());
  lines.forEach((line, i) => {
    try {
      const response = JSON.parse(line);
      console.log(`Response ${i + 1}:`, JSON.stringify(response, null, 2));
      console.log('---');
    } catch (e) {
      console.log(`Response ${i + 1} (raw):`, line);
    }
  });

  console.log('\n✅ MCP Server test completed!');
}

testMCPServer().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
