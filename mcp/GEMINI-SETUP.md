# Gemini CLI - MCP Server Setup Guide

**Pine Script Validator for Gemini CLI**

This guide shows you how to integrate the Pine Script v6 validator with Gemini CLI using Model Context Protocol (MCP).

---

## Prerequisites

1. **Gemini CLI installed:**
   ```bash
   npm install -g @google-gemini/gemini-cli
   ```

2. **API Key configured:**
   ```bash
   gemini config set apiKey YOUR_GEMINI_API_KEY
   ```

---

## Quick Setup

### Option 1: Automatic Configuration (Recommended)

```bash
# From project root
cd /path/to/pinescript-vscode-extension

# Add to Gemini settings
gemini config edit
```

Add this to your `settings.json`:

```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "trust": true
    }
  }
}
```

### Option 2: Environment Variable Path

If you want to use this from any directory:

```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["${PINESCRIPT_EXTENSION_PATH}/mcp/validator-server.js"],
      "env": {
        "PINESCRIPT_EXTENSION_PATH": "/Users/jp/Library/Mobile Documents/com~apple~CloudDocs/Documents/workspaces/pinescript-vscode-extension"
      },
      "trust": true
    }
  }
}
```

---

## Configuration Reference

### Full Configuration Options

```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "timeout": 30000,
      "trust": true,
      "includeTools": ["validate_pine_script"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `command` | string | Executable to run (e.g., "node") |
| `args` | string[] | Arguments to pass (e.g., ["mcp/validator-server.js"]) |
| `timeout` | number | Request timeout in ms (default: 30000) |
| `trust` | boolean | Skip tool confirmation prompts |
| `includeTools` | string[] | Whitelist specific tools |
| `excludeTools` | string[] | Blacklist specific tools |
| `env` | object | Environment variables |

---

## Available Tool

### `validate_pine_script`

**Description:** Validates a Pine Script v6 file and returns syntax errors, type mismatches, and warnings.

**Parameters:**
```json
{
  "file_path": "string (required)"
}
```

**Example Request:**
```json
{
  "tool_code": {
    "name": "validate_pine_script",
    "args": {
      "file_path": "/path/to/script.pine"
    }
  }
}
```

**Example Response:**
```json
{
  "tool_result": {
    "tool_name": "validate_pine_script",
    "output": "[{\"line\": 42, \"column\": 20, \"message\": \"Type mismatch: ...\"}]"
  }
}
```

---

## Usage

### Start Gemini with MCP Server

```bash
# From project directory
gemini

# Gemini will auto-load the validator from settings.json
```

### Using the Validator

**In Gemini chat:**

```
You: Validate the Pine Script file at examples/global-liquidity.v6.pine

Gemini: [Uses validate_pine_script tool]
Result: Found 20 errors and 80 warnings...
- Line 42: Type mismatch: cannot apply '/' to unknown and unknown
- Line 46: Type mismatch: cannot apply '<=' to unknown and int
...
```

### Manual Tool Execution

```bash
# Test the server directly
node mcp/validator-server.js

# Send a test request via stdin
echo '{"tool_code":{"name":"validate_pine_script","args":{"file_path":"examples/global-liquidity.v6.pine"}}}' | node mcp/validator-server.js
```

---

## Verification

### Check MCP Servers

```bash
gemini config get mcpServers
```

**Expected output:**
```json
{
  "pinescript-validator": {
    "command": "node",
    "args": ["mcp/validator-server.js"],
    "trust": true
  }
}
```

### Test the Server

```bash
# From project root
node mcp/validator-server.js
```

**Expected output (discovery phase):**
```json
{
  "tools": [
    {
      "function_declarations": [
        {
          "name": "validate_pine_script",
          "description": "Parses and validates a Pine Script file...",
          "parameters": { ... }
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### "Server not found"

**Problem:** Gemini can't find the MCP server

**Solutions:**
1. Check path is correct in `settings.json`
2. Use absolute paths instead of relative
3. Verify Node.js is in PATH: `which node`

```bash
# Fix: Use absolute path
gemini config edit
# Change to:
"args": ["/absolute/path/to/mcp/validator-server.js"]
```

### "Tool not available"

**Problem:** `validate_pine_script` not showing up

**Solutions:**
1. Restart Gemini: `gemini` (fresh start)
2. Check server trust setting
3. Verify server file exists

```bash
# Check file exists
ls -la mcp/validator-server.js

# Test manually
node mcp/validator-server.js
```

### "Validation errors seem wrong"

**Important:** The validator has known limitations (see errors-fix.md)

**TradingView is the source of truth:**
- If code works on TradingView → validator errors are false positives
- Current accuracy: ~60-70% (improving with Phase 2)

---

## Advanced Configuration

### Multiple Environments

```json
{
  "mcpServers": {
    "pinescript-validator-dev": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    },
    "pinescript-validator-prod": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "trust": true
    }
  }
}
```

### Tool Filtering

```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["mcp/validator-server.js"],
      "includeTools": ["validate_pine_script"],
      "trust": true
    }
  }
}
```

---

## Comparison: Gemini vs Claude Code

| Feature | Gemini CLI | Claude Code |
|---------|------------|-------------|
| **Protocol** | Gemini MCP (legacy) | MCP SDK (JSON-RPC 2.0) |
| **Server file** | `validator-server.js` | `pinescript-mcp-server.js` |
| **Config file** | `settings.json` | `.mcp.json` or `~/.claude.json` |
| **Config location** | `~/.gemini/` | `~/.claude.json` |
| **Tool format** | `function_declarations` | MCP standard |
| **Status** | ✅ Working | ✅ Working |

**Note:** Both use the same underlying validator (`ComprehensiveValidator`), just different communication protocols.

---

## Integration Examples

### Example 1: Validate Before Commit

```bash
#!/bin/bash
# pre-commit-validate.sh

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '.pine$')

for FILE in $FILES; do
  echo "Validating $FILE..."
  echo "{\"tool_code\":{\"name\":\"validate_pine_script\",\"args\":{\"file_path\":\"$FILE\"}}}" | node mcp/validator-server.js
done
```

### Example 2: CI/CD Integration

```yaml
# .github/workflows/validate-pine.yml
name: Validate Pine Scripts

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run qa:pinescript
```

---

## FAQ

### Q: Can I use this with Gemini in VS Code?

**A:** This guide is for **Gemini CLI** (terminal). For VS Code integration, see [VSCODE-COPILOT-SETUP.md](./VSCODE-COPILOT-SETUP.md).

### Q: Do I need both Gemini and Claude Code servers?

**A:** No, choose based on what you use:
- **Gemini CLI:** Use `validator-server.js`
- **Claude Code:** Use `pinescript-mcp-server.js`
- **Both:** Both servers work independently

### Q: How do I update the server?

```bash
# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart Gemini
gemini
```

### Q: Is this secure?

**Yes:**
- Server runs locally (no network access)
- Only reads files you specify
- No data sent to external servers
- `trust: true` skips confirmation prompts (optional)

---

## Resources

- **Gemini MCP Docs:** https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md
- **Validator Implementation:** `../src/parser/comprehensiveValidator.ts`
- **Error Analysis:** `../errors-fix.md`
- **Production Safety:** `../PRODUCTION-IMPACT-AUDIT.md`

---

## Support

**Issues:** https://github.com/jpantsjoha/pinescript-vscode-extension/issues

**Configuration Help:**
```bash
gemini config --help
gemini config get mcpServers
gemini config edit
```

---

**Last Updated:** 2025-10-06
**Status:** ✅ Fully Operational
**Tested With:** Gemini CLI v1.x
