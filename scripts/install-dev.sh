#!/bin/bash
# Install Pine Script Extension in Development Mode (Symlink)

set -e

EXTENSION_DIR="${HOME}/.vscode/extensions/pine-script-extension"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔧 Installing Pine Script Extension (Development Mode)"
echo "=================================================="
echo ""
echo "Workspace: ${WORKSPACE_DIR}"
echo "VSCode Extensions: ${EXTENSION_DIR}"
echo ""

# Remove existing installation
if [ -L "${EXTENSION_DIR}" ]; then
    echo "🗑️  Removing existing symlink..."
    rm -f "${EXTENSION_DIR}"
elif [ -d "${EXTENSION_DIR}" ]; then
    echo "🗑️  Removing existing directory installation..."
    rm -rf "${EXTENSION_DIR}"
fi

# Create symlink
echo "🔗 Creating symlink..."
ln -s "${WORKSPACE_DIR}" "${EXTENSION_DIR}"

# Build extension
echo ""
echo "🏗️  Building extension..."
cd "${WORKSPACE_DIR}"
npm run build

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Reload VSCode window: Cmd+Shift+P → 'Developer: Reload Window'"
echo "   2. Open a .pine file to test"
echo ""
echo "💡 Development mode active:"
echo "   - Changes to source code require: npm run build"
echo "   - Then reload VSCode window"
echo "   - Symlink allows live development without reinstall"
echo ""
