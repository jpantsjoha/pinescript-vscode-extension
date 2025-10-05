#!/bin/bash
# Reload VS Code Extension - Forces complete reload
# Use this after installing a new VSIX to ensure VS Code uses the latest code

echo "🔄 Reloading VS Code Extension..."
echo ""
echo "📋 Steps to reload:"
echo "   1. In VS Code, press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)"
echo "   2. Type: 'Developer: Reload Window'"
echo "   3. Press Enter"
echo ""
echo "Or:"
echo "   - Quit VS Code completely (Cmd+Q on Mac)"
echo "   - Reopen VS Code"
echo ""
echo "✅ After reload, the new v0.3.0 validator will be active"
echo ""

# Alternative: Use AppleScript to reload VS Code window (Mac only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Would you like to automatically reload VS Code window? (y/n): " answer
    if [ "$answer" = "y" ]; then
        osascript <<EOF
tell application "Visual Studio Code"
    activate
    tell application "System Events"
        keystroke "p" using {command down, shift down}
        delay 0.5
        keystroke "reload window"
        delay 0.5
        key code 36
    end tell
end tell
EOF
        echo "✅ VS Code window reloaded!"
    fi
fi
