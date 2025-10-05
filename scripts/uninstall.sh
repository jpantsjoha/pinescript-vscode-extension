#!/bin/bash
# Uninstall Pine Script Extension (All Methods)

set -e

EXTENSION_DIR="${HOME}/.vscode/extensions/pine-script-extension"

echo "🗑️  Uninstalling Pine Script Extension"
echo "======================================"
echo ""

# Method 1: Uninstall via vsce (if installed from marketplace/vsix)
echo "1️⃣  Uninstalling via VSCode CLI..."
code --uninstall-extension jaroslav.pine-script-extension 2>/dev/null && echo "   ✅ Uninstalled via CLI" || echo "   ⚠️  Not installed via CLI"

# Method 2: Remove symlink (if installed in dev mode)
if [ -L "${EXTENSION_DIR}" ]; then
    echo ""
    echo "2️⃣  Removing development symlink..."
    rm -f "${EXTENSION_DIR}"
    echo "   ✅ Symlink removed"
elif [ -d "${EXTENSION_DIR}" ]; then
    echo ""
    echo "2️⃣  Removing extension directory..."
    rm -rf "${EXTENSION_DIR}"
    echo "   ✅ Directory removed"
else
    echo ""
    echo "2️⃣  No local installation found at: ${EXTENSION_DIR}"
fi

echo ""
echo "✅ Uninstall complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Reload VSCode window: Cmd+Shift+P → 'Developer: Reload Window'"
echo "   2. Extension will be completely removed"
echo ""
