#!/bin/bash

# Setup Function Management Scripts
# This script initializes the function management system

echo "🚀 Setting up Supabase Function Management System"
echo "================================================"

# Make scripts executable
chmod +x scripts/check-function-docs.js
chmod +x scripts/organize-functions.js

# Create legacy directory if it doesn't exist
mkdir -p supabase/functions/legacy

echo "✅ Function management system setup complete!"
echo ""
echo "Available commands:"
echo "  npm run check-functions       - Check function documentation"
echo "  npm run setup-function-docs   - Create missing README templates"
echo "  npm run organize-functions    - Move deprecated functions to legacy"
echo "  npm run functions:report      - Generate function analysis report"
echo "  npm run functions:list        - List functions by category"
echo ""
echo "Next steps:"
echo "1. Run 'npm run check-functions' to see current documentation status"
echo "2. Run 'npm run setup-function-docs' to create missing README files"
echo "3. Run 'npm run organize-functions' to organize deprecated functions"