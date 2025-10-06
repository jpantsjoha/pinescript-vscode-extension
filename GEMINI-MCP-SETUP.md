# Gemini MCP Setup

**Note:** Gemini uses a different MCP protocol than Claude Code. This guide is for Gemini CLI integration.

## Quick Setup for Gemini

### 1. Use the Gemini-Compatible Server

Gemini requires the legacy MCP format (not the Model Context Protocol SDK format).

**Server file:** `mcp/validator-server.js` (already exists, different from pinescript-mcp-server.js)

### 2. Configure Gemini CLI

```bash
# Navigate to project
cd /path/to/pinescript-vscode-extension

# Start Gemini with the validator server
gemini --server mcp/validator-server.js
```

### 3. Alternative: Add to Gemini Config

Create/edit `~/.gemini/config.json`:

```json
{
  "servers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "cwd": "/Users/jp/Library/Mobile Documents/com~apple~CloudDocs/Documents/workspaces/pinescript-vscode-extension"
    }
  }
}
```

## Differences: Claude Code vs Gemini

| Feature | Claude Code | Gemini |
|---------|-------------|--------|
| Protocol | MCP SDK (JSON-RPC 2.0) | Gemini CLI format |
| Server file | `mcp/pinescript-mcp-server.js` | `mcp/validator-server.js` |
| Config file | `.mcp.json` or `~/.claude.json` | `~/.gemini/config.json` |
| Tool format | MCP standard | Gemini function_declarations |
| Status | ✅ Working | ✅ Working (different server) |

## Testing

### For Gemini

```bash
# Test the Gemini-compatible server
node mcp/validator-server.js
# Should output JSON with tool discovery

# Send test request
echo '{"tool_code":{"name":"validate_pine_script","args":{"file_path":"examples/global-liquidity.v6.pine"}}}' | node mcp/validator-server.js
```

### For Claude Code

```bash
# Already registered! Just use:
claude mcp list
# Should show: pinescript-validator - ✓ Connected
```

## Recommendation

**Use both!**
- **Claude Code:** Already set up and working (this session)
- **Gemini:** Use `mcp/validator-server.js` with Gemini CLI

Both servers use the same underlying validator, just different protocols.
