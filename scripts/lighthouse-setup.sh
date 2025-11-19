#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Setting up Lighthouse CI..."

# Install Lighthouse CI globally
echo "📦 Installing @lhci/cli..."
npm install -g @lhci/cli@0.13.x

# Verify installation
if command -v lhci &> /dev/null; then
    echo "✅ Lighthouse CI installed successfully"
    lhci --version
else
    echo "❌ Failed to install Lighthouse CI"
    exit 1
fi

# Create .lighthouseci directory if it doesn't exist
mkdir -p .lighthouseci

echo ""
echo "📋 Next steps:"
echo "1. Build your application: npm run build"
echo "2. Run Lighthouse: lhci autorun"
echo "3. View reports in .lighthouseci/ directory"
echo ""
echo "✅ Setup complete!"
