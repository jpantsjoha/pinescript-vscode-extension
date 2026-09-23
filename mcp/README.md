# MCP Integration: Pine Script Validator

**Model Context Protocol (MCP) server for Pine Script v6 validation**

This directory holds the MCP server that lets an AI assistant validate Pine
Script files directly, using the same checks the VS Code extension runs. It is
a development tool: `.vscodeignore` excludes `mcp/**` from the packaged VSIX,
so none of this reaches a published-extension user.

For the full architecture, JSON-RPC reference and troubleshooting guide, see
[`docs/guides/mcp-integration.md`](../docs/guides/mcp-integration.md). This
file is the quick start.

---

## Quick Start

### 1. Claude Code (already set up)

The server is registered for this workspace via `.mcp.json`.

**Verify:**
```bash
claude mcp list
# Should show: pinescript-validator - ✓ Connected
```

**Use it:** ask Claude in this session, for example "Validate
examples/global-liquidity.v6.pine".

### 2. VS Code Copilot (GitHub Copilot, Agent mode)

Create `.vscode/mcp.json`:
```json
{
  "servers": {
    "pinescript-validator": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"]
    }
  }
}
```

**Full guide:** [VSCODE-COPILOT-SETUP.md](./VSCODE-COPILOT-SETUP.md)

### 3. Any other MCP client

`pinescript-mcp-server.js` speaks standard MCP over stdio (JSON-RPC 2.0), so
any client that supports a stdio MCP server can point its config at
`node mcp/pinescript-mcp-server.js`. The request and response shapes are in
the [JSON-RPC reference](../docs/guides/mcp-integration.md#api-reference).

---

## Files in This Directory

| File | Purpose |
|------|---------|
| **pinescript-mcp-server.js** | The MCP server. Only one ships. |
| **README.md** | This file. |
| **VSCODE-COPILOT-SETUP.md** | Full VS Code Copilot setup guide. |

`mcp/pinescript-mcp-server/` and `mcp/tradingview-mcp/` are vendored,
gitignored, third-party servers, not part of a clean checkout and not
covered by this documentation.

---

## Available Tool

### `validate_pine_script`

Runs every diagnostic source the VS Code extension runs, in the same order:
`AccurateValidator` (signatures, arity, undefined names), the whole-document
checks, and the engine's semantic checks S1-S10 (repainting, `ta.*` in a
conditional, accumulator lifetime, platform limits, scope, unbounded strategy
risk, unguarded external feeds; S4 is registered but not implemented). No
type inference. `// pine-ignore: S1` in the source suppresses a specific
semantic finding the same way it does in the editor.

**Input:**
```json
{
  "file_path": "/path/to/script.pine",
  "code": "indicator('Test')..."
}
```
Provide either `file_path` or `code`.

**Output:**
```json
{
  "source": "File: script.pine",
  "total_errors": 5,
  "summary": "❌ 5 error(s), 2 warning(s) found",
  "errors": [
    {
      "line": 10,
      "column": 5,
      "message": "Undefined variable 'foo'",
      "severity": 0
    }
  ]
}
```

---

## Testing

**Claude Code:** already registered. Just ask Claude to validate a file.

**Manual (any client):**
```bash
node mcp/pinescript-mcp-server.js
# In another terminal, send a JSON-RPC request via stdin:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp/pinescript-mcp-server.js
```

**Headless, without MCP:** `node validate-cli.js <file.pine>` runs the same
validators directly. Useful for a quick check or a CI step that does not need
the MCP protocol.

---

## Security & Privacy

**What the server does:**
- Reads the Pine Script file you specify
- Parses and validates it locally
- Returns an error report

**What it doesn't do:**
- Access the network: everything runs locally
- Send data to an external server
- Modify your files
- Access files outside what you pass it

---

## Configuration Examples

### Minimal (Claude Code)

**File:** `.mcp.json`
```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["mcp/pinescript-mcp-server.js"]
    }
  }
}
```

### Multi-environment (VS Code)

**File:** `.vscode/mcp.json`
```json
{
  "servers": {
    "pinescript-dev": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"],
      "env": { "DEBUG": "true" }
    }
  }
}
```

---

## Documentation

- **[VSCODE-COPILOT-SETUP.md](./VSCODE-COPILOT-SETUP.md)**: full VS Code Copilot guide
- **[../docs/guides/mcp-integration.md](../docs/guides/mcp-integration.md)**: architecture, JSON-RPC reference, troubleshooting
- **Claude Code MCP:** https://docs.claude.com/en/docs/claude-code/mcp
- **VS Code MCP:** https://code.visualstudio.com/docs/copilot/customization/mcp-servers

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Server not found" | Check the file path in your config |
| "Tool not available" | Restart the AI assistant / reload the window |
| "Permission denied" | `chmod +x mcp/pinescript-mcp-server.js` |
| "Node not found" | Install Node.js v16+ |
| Validation looks wrong | TradingView is the source of truth. If the script compiles there, it's a false positive. Check the golden corpus in `test/` before assuming the server is right |

**Debug commands:**
```bash
node --version
node mcp/pinescript-mcp-server.js
claude mcp list
ls -la mcp/
```

**Get help:** https://github.com/jpantsjoha/pinescript-vscode-extension/issues

---

## Use Cases

### AI-assisted development

Without validation, an AI assistant writes Pine Script, the developer copies
it to TradingView, finds errors, and reports them back. With the MCP server
wired in, the assistant validates its own output before handing it over.

### Code review

```
"Review this Pine Script file and validate it: examples/global-liquidity.v6.pine"
```

### CI, without Docker

```yaml
# .github/workflows/validate.yml
- name: Validate Pine Scripts
  run: node validate-cli.js examples/*.pine
```

This runs the same validators as the MCP server, without needing the MCP
protocol at all. It is the right choice for CI, where there is no assistant
on the other end of stdio.

---

## Contributing

To add MCP support for a new AI assistant that already speaks standard MCP,
point its config at `mcp/pinescript-mcp-server.js` as shown above. No new
server file is needed. Only build a new server file if the client speaks a
non-standard protocol.

---

**Last Updated:** 2026-09-23
**License:** MIT
