#!/usr/bin/env node

/**
 * Pine Script Validator MCP Server
 *
 * Provides Pine Script v6 validation via Model Context Protocol
 * for use with Claude Code and other MCP clients.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Import the validator
const { validatePineScript } = require('../test-comprehensive-validator.js');

// Create MCP server
const server = new Server(
  {
    name: 'pinescript-validator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'validate_pine_script',
        description: 'Validates a Pine Script v6 file and returns syntax errors, type mismatches, and warnings. Uses the comprehensive validator with full semantic analysis.',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Absolute path to the .pine file to validate',
            },
            code: {
              type: 'string',
              description: 'Optional: Pine Script code string to validate (if not providing file_path)',
            },
          },
          oneOf: [
            { required: ['file_path'] },
            { required: ['code'] },
          ],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'validate_pine_script') {
    try {
      let code;
      let sourceInfo;

      // Get code from file or direct input
      if (args.file_path) {
        const filePath = args.file_path;
        if (!fs.existsSync(filePath)) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: true,
                    message: `File not found: ${filePath}`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        code = fs.readFileSync(filePath, 'utf-8');
        sourceInfo = `File: ${path.basename(filePath)}`;
      } else if (args.code) {
        code = args.code;
        sourceInfo = 'Code string';
      } else {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: true,
                  message: 'Either file_path or code must be provided',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Validate the code
      const errors = validatePineScript(code);

      // Format results
      const result = {
        source: sourceInfo,
        total_errors: errors.length,
        errors: errors.map((err) => ({
          line: err.line,
          column: err.column,
          message: err.message,
          severity: err.severity || 0,
        })),
      };

      // Add summary
      if (errors.length === 0) {
        result.summary = '✅ No validation errors found';
      } else {
        const errorCount = errors.filter((e) => !e.severity || e.severity === 0).length;
        const warningCount = errors.filter((e) => e.severity === 1).length;
        result.summary = `❌ ${errorCount} error(s), ${warningCount} warning(s) found`;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: true,
                message: `Validation error: ${error.message}`,
                stack: error.stack,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: true, message: `Unknown tool: ${name}` }, null, 2),
      },
    ],
    isError: true,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error('Pine Script MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
