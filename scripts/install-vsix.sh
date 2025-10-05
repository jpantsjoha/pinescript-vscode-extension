#!/bin/bash
# Install Pine Script Extension from VSIX Package

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Auto-detect latest VSIX file
VSIX_FILE=$(ls -t "${WORKSPACE_DIR}"/build/pine-script-extension-*.vsix 2>/dev/null | head -1)
if [ -z "${VSIX_FILE}" ]; then
    VSIX_FILE="${WORKSPACE_DIR}/build/pine-script-extension-0.2.3.vsix"
fi

echo "📦 Installing Pine Script Extension from VSIX"
echo "============================================="
echo ""

# Check if VSIX exists
if [ ! -f "${VSIX_FILE}" ]; then
    echo "❌ VSIX file not found: ${VSIX_FILE}"
    echo ""
    echo "Build the extension first:"
    echo "   npm run rebuild"
    exit 1
fi

# Uninstall existing version
echo "🗑️  Uninstalling existing version (if any)..."
code --uninstall-extension jpantsjoha.pine-script-extension 2>/dev/null || true

# Install from VSIX
echo ""
echo "📥 Installing from VSIX..."
code --install-extension "${VSIX_FILE}"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Reload VSCode window: Cmd+Shift+P → 'Developer: Reload Window'"
echo "   2. Open a .pine file to test"
echo ""
echo "📊 Extension info:"
ls -lh "${VSIX_FILE}"
echo ""
