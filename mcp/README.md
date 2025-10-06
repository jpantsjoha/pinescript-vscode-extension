# MCP Integration - Pine Script Validator

**Model Context Protocol (MCP) servers for Pine Script v6 validation**

This directory contains MCP server implementations that enable AI assistants (Claude Code, Gemini, GitHub Copilot) to validate Pine Script files directly.

---

## 🚀 Quick Start

Choose your AI assistant:

### 1. **Claude Code** (Recommended - Already Set Up! ✅)

The MCP server is already registered for this workspace!

**Verify:**
```bash
claude mcp list
# Should show: pinescript-validator - ✓ Connected
```

**Use it:**
Just ask Claude in this session:
> "Validate examples/global-liquidity.v6.pine"

### 2. **Gemini CLI**

**Setup:**
```bash
gemini config edit
```

Add to `settings.json`:
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

**Full guide:** [GEMINI-SETUP.md](./GEMINI-SETUP.md)

### 3. **VS Code Copilot (GitHub Copilot)**

**Setup:**
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

---

## 📁 Files in this Directory

### MCP Servers

| File | For | Protocol | Status |
|------|-----|----------|--------|
| **pinescript-mcp-server.js** | Claude Code, VS Code Copilot | MCP SDK (JSON-RPC 2.0) | ✅ Working |
| **validator-server.js** | Gemini CLI | Gemini MCP (legacy) | ✅ Working |

### Documentation

| File | Description |
|------|-------------|
| **README.md** | This file - Quick start guide |
| **GEMINI-SETUP.md** | Complete Gemini CLI setup guide |
| **VSCODE-COPILOT-SETUP.md** | Complete VS Code Copilot setup guide |
| **Dockerfile** | Containerized validator for CI/CD |

---

## 🔧 Available Tool

### `validate_pine_script`

**What it does:**
- Validates Pine Script v6 files
- Returns errors with line numbers
- Includes severity levels (error/warning)
- Comprehensive semantic analysis

**Input:**
```json
{
  "file_path": "/path/to/script.pine"  // OR
  "code": "indicator('Test')..."       // inline code
}
```

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

## 📊 Comparison Matrix

| Feature | Claude Code | Gemini CLI | VS Code Copilot |
|---------|-------------|------------|-----------------|
| **Protocol** | MCP SDK | Gemini MCP | MCP SDK |
| **Server file** | pinescript-mcp-server.js | validator-server.js | pinescript-mcp-server.js |
| **Config file** | .mcp.json | settings.json | .vscode/mcp.json |
| **Config location** | ~/.claude.json | ~/.gemini/ | Workspace or user |
| **Setup difficulty** | ✅ Easy | ✅ Easy | 🟡 Medium |
| **UI** | Terminal | Terminal | VS Code Chat |
| **Status** | ✅ Working | ✅ Working | ✅ Working |

---

## 🧪 Testing

### Test Claude Code MCP

```bash
# Already registered! Just ask Claude:
"Validate examples/global-liquidity.v6.pine"
```

### Test Gemini MCP

```bash
# Start server
node mcp/validator-server.js

# Send test request
echo '{"tool_code":{"name":"validate_pine_script","args":{"file_path":"examples/global-liquidity.v6.pine"}}}' | node mcp/validator-server.js
```

### Test VS Code Copilot MCP

```bash
# Start server
node mcp/pinescript-mcp-server.js

# Send JSON-RPC request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp/pinescript-mcp-server.js
```

### Run Automated Tests

```bash
# From project root
npm run test:mcp
```

---

## 🐳 Docker Support

### Build Container

```bash
docker build -t pinescript-validator .
```

### Run Validator

```bash
docker run -v $(pwd)/examples:/examples pinescript-validator \
  node /app/test-comprehensive-validator.js /examples/global-liquidity.v6.pine
```

---

## 🔒 Security & Privacy

### What the MCP servers do:
- ✅ Read Pine Script files you specify
- ✅ Parse and validate code locally
- ✅ Return error reports

### What they DON'T do:
- ❌ Access network (100% local)
- ❌ Send data to external servers
- ❌ Modify your files
- ❌ Access files outside project

### Trust Settings

**Gemini:**
```json
{
  "mcpServers": {
    "pinescript-validator": {
      "trust": true  // Skip confirmation prompts
    }
  }
}
```

**VS Code Copilot:**
MCP servers in `.vscode/mcp.json` are trusted by workspace.

---

## ⚙️ Configuration Examples

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

### Full-Featured (Gemini)

**File:** `~/.gemini/settings.json`
```json
{
  "mcpServers": {
    "pinescript-validator": {
      "command": "node",
      "args": ["${PINESCRIPT_PATH}/mcp/validator-server.js"],
      "env": {
        "PINESCRIPT_PATH": "/path/to/extension",
        "NODE_ENV": "production"
      },
      "timeout": 30000,
      "trust": true,
      "includeTools": ["validate_pine_script"]
    }
  }
}
```

### Multi-Environment (VS Code)

**File:** `.vscode/mcp.json`
```json
{
  "servers": {
    "pinescript-dev": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/pinescript-mcp-server.js"],
      "env": {
        "DEBUG": "true"
      }
    },
    "pinescript-prod": {
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

---

## 📚 Documentation

### Full Guides
- **[GEMINI-SETUP.md](./GEMINI-SETUP.md)** - Complete Gemini CLI guide
- **[VSCODE-COPILOT-SETUP.md](./VSCODE-COPILOT-SETUP.md)** - Complete VS Code Copilot guide
- **[../MCP-INTEGRATION.md](../MCP-INTEGRATION.md)** - Technical architecture
- **[../MCP-VERIFICATION.md](../MCP-VERIFICATION.md)** - Verification checklist

### Reference Docs
- **Gemini MCP:** https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md
- **VS Code MCP:** https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- **Claude Code MCP:** https://docs.claude.com/en/docs/claude-code/mcp

---

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "Server not found" | Check file paths in config |
| "Tool not available" | Restart AI assistant |
| "Permission denied" | `chmod +x mcp/*.js` |
| "Node not found" | Install Node.js v16+ |
| "Validation errors wrong" | See errors-fix.md (known limitations) |

### Debug Commands

```bash
# Check Node.js
node --version

# Test server directly
node mcp/pinescript-mcp-server.js

# Verify MCP registration (Claude)
claude mcp list

# Verify MCP registration (Gemini)
gemini config get mcpServers

# Check file permissions
ls -la mcp/
```

### Get Help

- **Issues:** https://github.com/jpantsjoha/pinescript-vscode-extension/issues
- **Docs:** See guides in this directory
- **Production Safety:** [../PRODUCTION-IMPACT-AUDIT.md](../PRODUCTION-IMPACT-AUDIT.md)

---

## 🎯 Use Cases

### 1. AI-Assisted Development

**Before:**
```
Developer: Write me a Pine Script RSI indicator
AI: [Writes code]
Developer: *copies to TradingView to test*
Developer: *finds errors*
Developer: *fixes and repeats*
```

**After with MCP:**
```
Developer: Write me a Pine Script RSI indicator
AI: [Writes code]
AI: [Validates code with MCP]
AI: [Fixes any errors found]
AI: [Returns validated, working code]
Developer: ✅ Done!
```

### 2. Code Review

```
"Review this Pine Script file and validate it:
examples/global-liquidity.v6.pine"
```

AI uses MCP validator + code review skills.

### 3. CI/CD Integration

```yaml
# .github/workflows/validate.yml
- name: Validate Pine Scripts
  run: |
    docker run -v $(pwd):/workspace \
      pinescript-validator \
      npm run qa:pinescript
```

### 4. Batch Validation

```
"Validate all .pine files in the examples directory"
```

AI uses MCP to check each file.

---

## 🚦 Status

| Component | Status | Last Tested |
|-----------|--------|-------------|
| **Claude Code MCP** | ✅ Operational | 2025-10-06 |
| **Gemini MCP** | ✅ Operational | 2025-10-06 |
| **VS Code Copilot MCP** | ✅ Operational | 2025-10-06 |
| **Docker Container** | ✅ Operational | 2025-10-06 |
| **Automated Tests** | ✅ Passing | 2025-10-06 |

---

## 📈 Roadmap

### Current (v1.0.0) ✅
- Claude Code integration
- Gemini CLI integration
- VS Code Copilot integration
- Comprehensive validation
- Docker support

### Future (v1.1.0+)
- Batch validation tool
- Validation caching
- Custom rule configuration
- Improved type inference (Phase 2)
- Advanced syntax support (Phase 3)

---

## 🤝 Contributing

**Add new AI assistant support:**
1. Check the AI's MCP protocol
2. Create new server or adapt existing
3. Document setup in new guide
4. Add to comparison matrix
5. Test and submit PR

---

**Last Updated:** 2025-10-06
**Version:** 1.0.0
**License:** MIT
**Maintainer:** Pine Script VSCode Extension Team
