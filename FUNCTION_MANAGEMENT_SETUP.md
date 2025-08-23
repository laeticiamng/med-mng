# Supabase Function Management Setup

## ✅ What's Been Created

1. **Main Documentation**: `supabase/functions/README.md` - Comprehensive catalog of all functions
2. **Legacy Structure**: `supabase/functions/legacy/` - Directory for deprecated/experimental functions  
3. **Documentation Linter**: `scripts/check-function-docs.js` - Validates function documentation
4. **Function Organizer**: `scripts/organize-functions.js` - Helps organize and analyze functions
5. **Setup Script**: `scripts/setup-function-management.sh` - Initializes the system

## 🔧 Required NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "check-functions": "node scripts/check-function-docs.js",
    "organize-functions": "node scripts/organize-functions.js",
    "setup-function-docs": "node scripts/check-function-docs.js --create-templates",
    "functions:report": "node scripts/organize-functions.js report",
    "functions:organize": "node scripts/organize-functions.js organize",
    "functions:list": "node scripts/organize-functions.js list"
  }
}
```

## 🚀 Quick Start

1. **Make scripts executable**:
   ```bash
   chmod +x scripts/setup-function-management.sh
   ./scripts/setup-function-management.sh
   ```

2. **Check current documentation status**:
   ```bash
   npm run check-functions
   ```

3. **Create missing README templates**:
   ```bash
   npm run setup-function-docs
   ```

4. **Generate function analysis report**:
   ```bash
   npm run functions:report
   ```

5. **Organize deprecated functions**:
   ```bash
   npm run functions:organize
   ```

## 📋 Function Categories

The system automatically categorizes functions into:

- **🔐 Authentication & Security** (cas-cookies-replica, test-cas-auth)
- **📚 Content Management** (extract-edn-*, sync-edn-content) 
- **🤖 AI & Generation** (openai-*, generate-*, contextual-ai-chat)
- **🏥 Medical Content** (med-mng-api, spotify-medical-docs)
- **🔧 OIC Processing** (oic-extraction-*, fix-oic-*)
- **🛠 Administration** (admin-*, analytics-aggregator)
- **🧪 Testing** (test-*)

## 📖 Documentation Standards

Each function must include:
- **Purpose**: Clear description
- **Environment Variables**: Required and optional vars
- **Input Schema**: TypeScript interfaces
- **Output Schema**: Response format
- **Usage Examples**: Code samples
- **Error Handling**: Expected errors

## 🗂 Legacy Management  

Functions are moved to legacy for:
- **Deprecated**: Scheduled for removal
- **Experimental**: Under development
- **Obsolete**: No longer maintained

## 🔍 Linting Features

The documentation linter checks for:
- ✅ README.md existence
- ✅ Required sections present
- ✅ Environment variables documented
- ✅ Input/output schemas defined
- ✅ Usage examples included

## 📊 Analysis Reports

Generate insights on:
- Functions with missing documentation
- Old/unused functions
- Test functions needing organization
- Size and complexity metrics

## 🎯 Benefits

- **🔍 Discoverability**: Easy to find and understand functions
- **📚 Documentation**: Standardized function documentation
- **🧹 Organization**: Clean separation of active vs legacy code
- **🔧 Maintenance**: Automated checks for documentation quality
- **📈 Analytics**: Insights into function usage and health