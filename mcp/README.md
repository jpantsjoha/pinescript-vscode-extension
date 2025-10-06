# MCP Tool Configuration

This directory contains a Model Context Protocol (MCP) server that provides a `validate_pine_script` tool to AI assistants like GitHub Copilot and Gemini.

### 1. The Server

The `mcp/validator-server.js` file is a Node.js script that acts as a stdio-based MCP server. When started, it exposes the `validate_pine_script` tool.

---

## 2. VS Code Configuration (Recommended)

To use this validation tool directly within VS Code with GitHub Copilot:

1.  **Create a `.vscode/mcp.json` file** in your project root.

2.  **Add the following configuration** to the file:

    ```json
    {
      "mcp": {
        "servers": [
          {
            "name": "pinescript-validator",
            "command": ["node", "${workspaceFolder}/mcp/validator-server.js"],
            "transport": "stdio"
          }
        ]
      }
    }
    ```

3.  **Reload VS Code**: After saving the file, reload your VS Code window. The server will be available in the Chat view.

---

## 3. Generic CLI Assistant Configuration

To empower a CLI-based AI assistant (like Gemini) with this validation tool, you need to add this server to its configuration.

1.  **Locate your assistant's `settings.json` file.**

2.  **Add an entry to `mcpServers`.** Add the following JSON object to the `mcpServers` array.

    ```json
    {
      "mcpServers": [
        {
          "name": "pinescript-validator",
          "command": ["node", "/path/to/your/project/mcp/validator-server.js"],
          "trust": 2,
          "transport": "stdio"
        }
      ]
    }
    ```

    **IMPORTANT:** You must replace `/path/to/your/project/` with the absolute path to this project's root directory.

3.  **Restart the Assistant.**

---

## 4. Tool Definition

The server provides the following tool:

- **`validate_pine_script(file_path: string)`**:
  - **Description:** Parses and validates a Pine Script file, returning a list of errors.
  - **`file_path`:** The absolute path to the `.pine` script file.
  - **Returns:** A JSON string representing a list of error objects. An empty list `[]` means the script is valid.
