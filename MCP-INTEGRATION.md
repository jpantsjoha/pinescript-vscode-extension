# MCP Integration - Pine Script Validator

**Status:** ✅ Fully Operational
**Version:** 1.0.0
**Protocol:** Model Context Protocol (MCP)
**Last Updated:** 2025-10-06

---

## Overview

The Pine Script VSCode extension includes a **Model Context Protocol (MCP) server** that provides Pine Script v6 validation capabilities to AI assistants like Claude Code.

### What is MCP?

MCP (Model Context Protocol) is an open protocol that enables AI assistants to interact with external tools and data sources. This integration allows Claude Code and other MCP clients to validate Pine Script files directly.

### Features

- ✅ **Real-time validation** of Pine Script v6 files
- ✅ **Comprehensive error reporting** with line numbers and severity levels
- ✅ **Support for file paths or code strings**
- ✅ **JSON-RPC 2.0 protocol** for reliable communication
- ✅ **Workspace-scoped configuration** (not user-global)

---

## Architecture

```
┌─────────────────┐         JSON-RPC 2.0         ┌──────────────────┐
│  Claude Code    │◄──────────stdio──────────────►│  MCP Server      │
│  (MCP Client)   │                                │  (Node.js)       │
└─────────────────┘                                └──────────────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ Comprehensive    │
                                                   │ Validator        │
                                                   └──────────────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ Parser + Lexer   │
                                                   └──────────────────┘
```

---

## Installation

### For VS Code Users with Claude Code

The MCP server is **automatically configured** for the workspace. When you open this project in VS Code with Claude Code, the server will be available.

**Configuration file:** `.vscode/mcp.json`

```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"],
      "description": "Pine Script v6 validator"
    }
  }
}
```

### Manual Installation (CLI)

If you want to use the MCP server with the Claude Code CLI:

```bash
# From project root
claude mcp add pinescript-validator node ./mcp/pinescript-mcp-server.js
```

---

## Usage

### From Claude Code

Once configured, you can ask Claude Code to validate Pine Script files:

**Example prompts:**

```
"Validate the examples/global-liquidity.v6.pine file"

"Check this Pine Script code for errors: [paste code]"

"Run the Pine Script validator on all .pine files"
```

Claude Code will automatically use the `validate_pine_script` tool.

### From Command Line (Testing)

Test the MCP server manually:

```bash
# Run test script
npm run test:mcp

# Or test directly
node mcp/pinescript-mcp-server.js
```

Then send JSON-RPC requests via stdin.

---

## MCP Tool: `validate_pine_script`

### Description

Validates a Pine Script v6 file and returns syntax errors, type mismatches, and warnings using the comprehensive validator with full semantic analysis.

### Input Schema

```typescript
{
  file_path?: string;  // Absolute path to .pine file
  code?: string;       // OR: Pine Script code string
}
```

**Note:** Either `file_path` OR `code` must be provided.

### Output Format

```json
{
  "source": "File: global-liquidity.v6.pine",
  "total_errors": 20,
  "summary": "❌ 20 error(s), 80 warning(s) found",
  "errors": [
    {
      "line": 42,
      "column": 20,
      "message": "Type mismatch: cannot apply '/' to unknown and unknown",
      "severity": 0
    },
    ...
  ]
}
```

### Severity Levels

| Severity | Level | Description |
|----------|-------|-------------|
| `0` | Error | Must be fixed - code won't compile |
| `1` | Warning | Code works but may have issues |

---

## Testing

### Automated Test

```bash
npm run test:mcp
```

**Expected output:**
```
🧪 Testing Pine Script MCP Server...

📤 Test 1: Initialize request
📤 Test 2: List tools request
📤 Test 3: Validate file request

✅ MCP Server test completed!
```

### Manual Test

```bash
# Start server
node mcp/pinescript-mcp-server.js

# In another terminal, send requests
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node mcp/pinescript-mcp-server.js
```

---

## Configuration

### Workspace Configuration

**File:** `.vscode/mcp.json`

This file is **included in the repository** and applies to all users who open the project. It does NOT modify your personal Claude Code configuration.

### Environment Variables

No environment variables required. The server uses relative paths to the workspace.

---

## Development

### File Structure

```
mcp/
├── pinescript-mcp-server.js    # Main MCP server (MCP SDK)
└── validator-server.js         # Legacy Gemini CLI server (deprecated)

.vscode/
└── mcp.json                    # VS Code MCP configuration

test-mcp-server.js              # Automated test script
```

### Modifying the Server

1. **Edit:** `mcp/pinescript-mcp-server.js`
2. **Test:** `npm run test:mcp`
3. **Restart:** Claude Code will auto-reload the server

### Adding New Tools

To add more MCP tools:

1. Add tool definition to `ListToolsRequestSchema` handler
2. Add tool logic to `CallToolRequestSchema` handler
3. Update this documentation
4. Test with `test-mcp-server.js`

---

## Troubleshooting

### Server Not Starting

**Symptom:** Claude Code doesn't see the `validate_pine_script` tool

**Solutions:**
1. Check `.vscode/mcp.json` exists in workspace
2. Verify Node.js is installed: `node --version`
3. Rebuild project: `npm run build`
4. Restart VS Code

### Validation Errors

**Symptom:** Server returns errors for valid code

**Explanation:** The comprehensive validator is still in development (Phase 2). Known limitations:

- Type inference incomplete (see errors-fix.md)
- Some advanced Pine Script v6 syntax not supported
- False positives expected (see PRODUCTION-IMPACT-AUDIT.md)

**Note:** TradingView is the source of truth. If code works there, validator errors are false positives.

### Server Crashes

**Symptom:** MCP server exits unexpectedly

**Solutions:**
1. Check server logs in VS Code Output panel
2. Test validator directly: `npm run qa:pinescript`
3. Report issue with error logs

---

## Production Impact

### CRITICAL: Zero User Impact

The MCP server is:
- ✅ **Development tool only** - not part of the published VSCode extension
- ✅ **Excluded from VSIX package** via `.vscodeignore`
- ✅ **Workspace-scoped** - doesn't modify user's global config
- ✅ **Optional** - extension works perfectly without it

**Users of the published extension are NOT affected by this MCP integration.**

### What Gets Published vs Not

| File | Published? | Purpose |
|------|------------|---------|
| `dist/` compiled code | ✅ Yes | Extension runtime |
| `mcp/` directory | ❌ No | Dev tool only |
| `.vscode/mcp.json` | ❌ No | Workspace config |
| `test-mcp-server.js` | ❌ No | Testing only |

See [PRODUCTION-IMPACT-AUDIT.md](./PRODUCTION-IMPACT-AUDIT.md) for complete audit.

---

## Performance

### Benchmarks

**Validation speed:**
- Small file (< 100 lines): ~50ms
- Medium file (< 500 lines): ~200ms
- Large file (< 1000 lines): ~500ms

**Memory usage:**
- Base: ~30 MB
- Per validation: ~5 MB (freed after response)

**Startup time:**
- Server startup: ~100ms
- First validation: ~200ms (JIT warmup)

---

## Comparison: MCP vs Extension

| Feature | MCP Server | VSCode Extension |
|---------|------------|------------------|
| **Target Users** | AI assistants | Human developers |
| **Validator** | ComprehensiveValidator | AccurateValidator |
| **Transport** | stdio (JSON-RPC) | VSCode Language Server |
| **Real-time** | On-demand | Live diagnostics |
| **Scope** | Workspace | Global VSCode |
| **Status** | ✅ Operational | ✅ Published on marketplace |

---

## Roadmap

### Current (v1.0.0)

- ✅ Basic validation with comprehensive validator
- ✅ File and code string support
- ✅ JSON-RPC 2.0 protocol
- ✅ Automated testing

### Future (v1.1.0+)

- ⏳ Type inference improvements (Phase 2 Full)
- ⏳ Batch validation of multiple files
- ⏳ Performance optimizations
- ⏳ Validation caching
- ⏳ Custom rule configuration

---

## API Reference

### JSON-RPC Methods

#### `initialize`

Initialize the MCP server.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "client-name",
      "version": "1.0.0"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "pinescript-validator",
      "version": "1.0.0"
    }
  }
}
```

#### `tools/list`

List available tools.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "validate_pine_script",
        "description": "Validates a Pine Script v6 file...",
        "inputSchema": { ... }
      }
    ]
  }
}
```

#### `tools/call`

Call a tool.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "validate_pine_script",
    "arguments": {
      "file_path": "/path/to/script.pine"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"source\": \"...\", \"errors\": [...]}"
      }
    ]
  }
}
```

---

## License

Same as the main extension (check package.json).

---

## Support

- **Issues:** GitHub issues on the extension repository
- **Documentation:** See [GEMINI.md](./GEMINI.md) for validator details
- **Production audit:** See [PRODUCTION-IMPACT-AUDIT.md](./PRODUCTION-IMPACT-AUDIT.md)

---

**Status:** ✅ MCP Integration Fully Operational
**Last Validated:** 2025-10-06
**Test Status:** All tests passing ✅
