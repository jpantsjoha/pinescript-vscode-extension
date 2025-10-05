#!/bin/bash
# Quick reload for development: rebuild + reload VSCode

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Quick Reload (Development Mode)"
echo "==================================="
echo ""

# Build extension
echo "🏗️  Building extension..."
cd "${WORKSPACE_DIR}"
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📝 Next step:"
echo "   Reload VSCode window: Cmd+Shift+P → 'Developer: Reload Window'"
echo ""
echo "💡 Tip: Use keyboard shortcut for faster reload:"
echo "   macOS: Cmd+Shift+P → type 'reload' → Enter"
echo ""
