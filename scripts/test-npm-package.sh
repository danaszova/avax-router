#!/bin/bash
# Test the published @snowmonster_defi/widget npm package
# This creates a standalone project OUTSIDE the monorepo to avoid workspace conflicts

set -e

TEST_DIR="/tmp/avax-router-npm-test"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$REPO_DIR/scripts/test-npm-template"

echo "🧪 Testing published @snowmonster_defi/widget npm package..."
echo ""

# Clean up previous test
if [ -d "$TEST_DIR" ]; then
    echo "🗑️  Cleaning up previous test..."
    rm -rf "$TEST_DIR"
fi

# Create test directory
mkdir -p "$TEST_DIR/src"

# Copy template files
echo "📋 Setting up test project..."
cp "$TEMPLATE_DIR/package.json" "$TEST_DIR/"
cp "$TEMPLATE_DIR/index.html" "$TEST_DIR/"
cp "$TEMPLATE_DIR/vite.config.ts" "$TEST_DIR/"
cp "$TEMPLATE_DIR/src/main.tsx" "$TEST_DIR/src/"
cp "$TEMPLATE_DIR/src/App.tsx" "$TEST_DIR/src/"

# Install dependencies
echo "📦 Installing from npm (this may take a moment)..."
cd "$TEST_DIR"
npm install 2>&1 | tail -5

# Check installed version
WIDGET_VERSION=$(node -e "console.log(require('@snowmonster_defi/widget/package.json').version)")
echo ""
echo "✅ Installed @snowmonster_defi/widget@$WIDGET_VERSION"
echo ""

# Start dev server
echo "🚀 Starting test app..."
echo "   Opening at http://localhost:5174/"
echo ""
echo "   Press Ctrl+C to stop the server"
echo "   Run 'rm -rf $TEST_DIR' to clean up"
echo ""
npm run dev