#!/usr/bin/env bash
set -e

# Find the Mailspring Flatpak resources directory
RESOURCES_BASE="$HOME/.local/share/flatpak/app/com.getmailspring.Mailspring"
if [ ! -d "$RESOURCES_BASE" ]; then
  echo "ERROR: Mailspring Flatpak not found at $RESOURCES_BASE"
  exit 1
fi

# Find the active deploy hash directory
RESOURCES=$(find "$RESOURCES_BASE/x86_64/stable" -maxdepth 8 -name "app.asar" 2>/dev/null | head -1 | xargs dirname)
if [ -z "$RESOURCES" ]; then
  echo "ERROR: Could not find app.asar under $RESOURCES_BASE"
  exit 1
fi

echo "Found Mailspring resources: $RESOURCES"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Extracting app.asar..."
npx --yes @electron/asar extract "$RESOURCES/app.asar" "$WORK_DIR/asar"

# Back up original if not already backed up
if [ ! -f "$RESOURCES/app.asar.bak" ]; then
  echo "Backing up original app.asar..."
  cp "$RESOURCES/app.asar" "$RESOURCES/app.asar.bak"
fi

echo "Applying patches..."
cp -r "$SCRIPT_DIR/patches/." "$WORK_DIR/asar/"

echo "Repacking..."
npx @electron/asar pack "$WORK_DIR/asar" "$WORK_DIR/app.asar"

echo "Deploying..."
cp "$WORK_DIR/app.asar" "$RESOURCES/app.asar"

echo ""
echo "Done! Restart Mailspring to apply changes."
