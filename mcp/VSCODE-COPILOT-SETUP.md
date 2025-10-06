# VS Code Copilot - MCP Server Setup Guide

**Pine Script Validator for GitHub Copilot in VS Code**

This guide shows you how to integrate the Pine Script v6 validator with GitHub Copilot using Model Context Protocol (MCP) in Visual Studio Code.

---

## Prerequisites

1. **VS Code installed** (version 1.95 or later)
2. **GitHub Copilot extension** installed and active
3. **Copilot Agent mode** enabled (required for MCP)

---

## Quick Setup

### Step 1: Create MCP Configuration

Create `.vscode/mcp.json` in your workspace:

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

### Step 2: Reload VS Code

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Developer: Reload Window`
3. VS Code will load the MCP server automatically

### Step 3: Verify Installation

1. Open Copilot Chat
2. Enable Agent mode
3. Type `#pinescript-validator` to reference tools
4. Or use Command Palette: `MCP: List Servers`

---

## Configuration Reference

### Workspace Configuration

**File:** `.vscode/mcp.json`

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "workspace-path",
      "description": "Workspace path",
      "default": "${workspaceFolder}"
    }
  ],
  "servers": {
    "pinescript-validator": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### User-Wide Configuration

For access across all workspaces, create `mcp.json` in VS Code user profile:

**Mac/Linux:** `~/.vscode/mcp.json`
**Windows:** `%USERPROFILE%\.vscode\mcp.json`

```json
{
  "servers": {
    "pinescript-validator": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/pinescript-vscode-extension/mcp/pinescript-mcp-server.js"]
    }
  }
}
```

---

## Configuration Properties

### Server Types

| Type | Description | Use Case |
|------|-------------|----------|
| `stdio` | Local subprocess | This validator (recommended) |
| `http` | HTTP streaming | Remote servers |
| `sse` | Server-Sent Events | Remote servers |

### Common Properties

```json
{
  "servers": {
    "serverName": {
      "type": "stdio | http | sse",
      "command": "executable",          // stdio only
      "args": ["arg1", "arg2"],         // stdio only
      "url": "http://server:port",      // http/sse only
      "env": {                          // Environment variables
        "KEY": "value"
      }
    }
  }
}
```

### Input Variables

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "api-key",
      "description": "API Key",
      "password": true
    }
  ],
  "servers": {
    "example": {
      "type": "stdio",
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "${input:api-key}"
      }
    }
  }
}
```

---

## Available Tool

### `validate_pine_script`

**Description:** Validates Pine Script v6 files with comprehensive error reporting

**Input Schema:**
```json
{
  "file_path": "string (optional)",
  "code": "string (optional)"
}
```

**Note:** Provide either `file_path` OR `code`

**Response:**
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

## Usage in VS Code

### Method 1: Copilot Chat (Recommended)

1. **Open Copilot Chat** (sidebar or inline)
2. **Enable Agent mode** (toggle in chat)
3. **Reference the tool:**

```
@workspace Use #validate_pine_script to check examples/global-liquidity.v6.pine
```

Or simply:

```
Validate the Pine Script file examples/indicator.2.3.pine
```

Copilot will automatically discover and use the validator.

### Method 2: Command Palette

1. Press `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: `MCP: Run Tool`
3. Select: `pinescript-validator`
4. Choose: `validate_pine_script`
5. Enter file path

### Method 3: Add as Context

In Copilot Chat:

```
Add #validate_pine_script as context for this conversation
```

Now Copilot can validate Pine Script in all responses.

---

## Installation Methods

### Method 1: Manual (Above)

Create `.vscode/mcp.json` manually

### Method 2: Command Palette

1. `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: `MCP: Add Server`
3. Follow prompts

### Method 3: VS Code CLI

```bash
code --add-mcp pinescript-validator \
  --type stdio \
  --command node \
  --args mcp/pinescript-mcp-server.js
```

---

## Verification

### Check MCP Servers

**Command Palette:**
1. `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: `MCP: List Servers`

**Expected output:**
```
✓ pinescript-validator (stdio)
  - Tool: validate_pine_script
```

### Test the Validator

**In Copilot Chat:**

```
@workspace Validate this Pine Script:
//@version=6
indicator("Test")
plot(ta.sma(close, 20))
```

**Expected response:**
```
✅ No validation errors found
Your Pine Script code is valid!
```

---

## Advanced Configuration

### Dev Containers

**File:** `.devcontainer/devcontainer.json`

```json
{
  "name": "Pine Script Dev",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "customizations": {
    "vscode": {
      "extensions": ["GitHub.copilot"],
      "settings": {
        "mcp.servers": {
          "pinescript-validator": {
            "type": "stdio",
            "command": "node",
            "args": ["${containerWorkspaceFolder}/mcp/pinescript-mcp-server.js"]
          }
        }
      }
    }
  }
}
```

### Multi-Server Setup

```json
{
  "servers": {
    "pinescript-validator": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"]
    },
    "tradingview-api": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    },
    "pine-formatter": {
      "type": "stdio",
      "command": "python",
      "args": ["${workspaceFolder}/tools/formatter.py"]
    }
  }
}
```

---

## Settings Sync

### Enable Sync

**Settings:**
1. File > Preferences > Settings Sync
2. Enable "Settings Sync"
3. Select sync items (including "Settings")

**MCP configs sync automatically** if in:
- User profile: `~/.vscode/mcp.json` ✅
- Workspace: `.vscode/mcp.json` ❌ (workspace-specific)

### Share with Team

**Option 1: Commit to repo**
```bash
git add .vscode/mcp.json
git commit -m "Add Pine Script MCP validator"
git push
```

**Option 2: Document in README**
```markdown
## Setup

1. Install dependencies: `npm install`
2. MCP server will auto-configure from `.vscode/mcp.json`
3. Reload VS Code
```

---

## Troubleshooting

### "MCP server not found"

**Problem:** VS Code can't load the server

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la mcp/pinescript-mcp-server.js
   ```

2. **Verify Node.js:**
   ```bash
   node --version
   # Should show v16+
   ```

3. **Check configuration:**
   - Open `.vscode/mcp.json`
   - Verify paths use `${workspaceFolder}`
   - Check JSON is valid (no trailing commas)

4. **Reload VS Code:**
   - `Cmd+Shift+P` > `Developer: Reload Window`

### "Tool not available in Copilot"

**Problem:** Can't see `validate_pine_script` in Copilot

**Solutions:**

1. **Enable Agent mode:**
   - Open Copilot Chat
   - Toggle "Agent mode" (robot icon)

2. **Check MCP is loaded:**
   - `Cmd+Shift+P` > `MCP: List Servers`
   - Should show `pinescript-validator`

3. **Restart Copilot:**
   - Disable Copilot extension
   - Reload VS Code
   - Enable Copilot extension

### "Maximum 128 tools exceeded"

**Problem:** Too many MCP tools registered

**Solution:** Filter tools in config:

```json
{
  "servers": {
    "pinescript-validator": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"],
      "includedTools": ["validate_pine_script"]
    }
  }
}
```

### "Validation errors seem wrong"

**Important:** Validator has known limitations (see `../errors-fix.md`)

**TradingView is the source of truth:**
- Works on TradingView → validator errors are false positives
- Current accuracy: ~60-70% (improving)

---

## Security Considerations

### Trust MCP Servers

**VS Code MCP servers have full system access:**
- Read/write files
- Execute commands
- Network access

**Only use trusted servers:**
- ✅ This validator (local, read-only)
- ✅ Official MCP servers from code.visualstudio.com/mcp
- ⚠️ Third-party servers (review code first)

### Sensitive Data

**Don't hardcode secrets:**

❌ **Bad:**
```json
{
  "servers": {
    "example": {
      "env": {
        "API_KEY": "sk-1234567890abcdef"
      }
    }
  }
}
```

✅ **Good:**
```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "api-key",
      "password": true
    }
  ],
  "servers": {
    "example": {
      "env": {
        "API_KEY": "${input:api-key}"
      }
    }
  }
}
```

---

## Integration Examples

### Example 1: Validate on Save

**File:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Pine Script",
      "type": "shell",
      "command": "node",
      "args": [
        "${workspaceFolder}/mcp/pinescript-mcp-server.js"
      ],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    }
  ]
}
```

### Example 2: Keybinding

**File:** `.vscode/keybindings.json`

```json
[
  {
    "key": "ctrl+shift+v",
    "command": "workbench.action.tasks.runTask",
    "args": "Validate Pine Script"
  }
]
```

---

## Comparison: VS Code Copilot vs Claude Code vs Gemini

| Feature | VS Code Copilot | Claude Code | Gemini CLI |
|---------|-----------------|-------------|------------|
| **Protocol** | MCP SDK | MCP SDK | Gemini MCP |
| **Server file** | `pinescript-mcp-server.js` | `pinescript-mcp-server.js` | `validator-server.js` |
| **Config file** | `.vscode/mcp.json` | `.mcp.json` | `settings.json` |
| **Config location** | Workspace or user profile | Project root | `~/.gemini/` |
| **UI** | Copilot Chat | Terminal | Terminal |
| **Agent mode** | Required | Built-in | Built-in |
| **Status** | ✅ Working | ✅ Working | ✅ Working |

---

## Resources

- **VS Code MCP Docs:** https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- **MCP Server Browser:** https://code.visualstudio.com/mcp
- **Validator Implementation:** `../src/parser/comprehensiveValidator.ts`
- **Production Safety:** `../PRODUCTION-IMPACT-AUDIT.md`

---

## FAQ

### Q: Do I need GitHub Copilot Pro?

**A:** Yes, MCP servers require an active GitHub Copilot subscription.

### Q: Can I use this without Copilot?

**A:** Yes! Use Claude Code or Gemini CLI (see other guides).

### Q: How many MCP servers can I add?

**A:** Maximum 128 tools total across all servers.

### Q: Does this work in VS Code web?

**A:** No, stdio MCP servers require local VS Code.

### Q: Can I share this with my team?

**A:** Yes! Commit `.vscode/mcp.json` to your repo.

---

## Support

**Issues:** https://github.com/jpantsjoha/pinescript-vscode-extension/issues

**VS Code MCP Commands:**
- `MCP: List Servers`
- `MCP: Add Server`
- `MCP: Run Tool`
- `MCP: Remove Server`

---

**Last Updated:** 2025-10-06
**Status:** ✅ Fully Operational
**Tested With:** VS Code 1.95+, GitHub Copilot
