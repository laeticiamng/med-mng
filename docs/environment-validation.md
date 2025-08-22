# 🔍 Environment Validation System

## Overview

The Med Music Platform uses a centralized environment validation system to ensure all required configuration is present and valid before the application starts. This prevents silent failures and security misconfigurations.

## ✅ Problem Solved

**Before**: The Express server consumed environment variables without validation, leading to:
- Silent failures in production
- Security misconfigurations
- Runtime errors due to missing variables
- Inconsistent behavior across environments

**After**: Centralized validation with:
- ✅ Comprehensive variable validation using Zod schemas
- ✅ Environment-specific requirements (dev/staging/prod)
- ✅ Clear error messages with solutions
- ✅ Type-safe access to configuration
- ✅ Automatic environment detection and feature flags

## 🏗️ Architecture

```typescript
┌─────────────────────┐
│   Application       │
│   Startup           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ validateEnvironment │ ← Validates ALL variables with Zod
│ @med-music/config   │
└──────────┬──────────┘
           │
     ✅ Success │ ❌ Failure
           │          │
           ▼          ▼
    ┌──────────┐ ┌─────────────┐
    │   App    │ │   Helpful   │
    │  Starts  │ │ Error + Exit│
    └──────────┘ └─────────────┘
```

## 🔧 Usage

### 1. Basic Usage

```typescript
import { validateEnvironment, getEnvironment } from '@med-music/config';

// At application startup (before any other code)
const env = validateEnvironment();

// Later in the code (after validation)
const config = getEnvironment();
console.log(`Running on port ${config.PORT}`);
```

### 2. Express Server Example

```typescript
import express from 'express';
import { validateEnvironment, getSecurityConfig, createEnvValidationMiddleware } from '@med-music/config';

async function startServer() {
  // Validate environment FIRST
  const env = validateEnvironment();
  
  const app = express();
  
  // Use validated configuration
  const securityConfig = getSecurityConfig();
  app.use(helmet(securityConfig.helmet));
  
  // Add environment validation middleware
  app.use(createEnvValidationMiddleware());
  
  app.listen(env.PORT, () => {
    console.log(`✅ Server running on port ${env.PORT}`);
  });
}
```

### 3. React Application

```typescript
// main.tsx
import { validateEnvironment } from '@med-music/config';

async function initializeApp() {
  try {
    // Validate environment before React starts
    const env = validateEnvironment();
    
    // Start React app
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(<App />);
    
  } catch (error) {
    // Show user-friendly error page
    document.body.innerHTML = `<div>Configuration error: ${error.message}</div>`;
  }
}
```

## 📋 Validation Rules

### Required Variables (All Environments)

```typescript
VITE_SUPABASE_URL      // Must be valid Supabase URL
VITE_SUPABASE_ANON_KEY // Must be JWT format (starts with 'eyJ')
NODE_ENV               // Must be: development, staging, or production
```

### Production-Only Requirements

```typescript
SUPABASE_SERVICE_ROLE_KEY  // Required for admin operations
JWT_SECRET                 // Must be at least 32 characters
CORS_ORIGIN               // Should not be '*' in production
```

### Optional Variables

```typescript
OPENAI_API_KEY            // For AI features
SUNO_API_KEY              // For music generation
SENTRY_DSN                // For error monitoring
RATE_LIMIT_WINDOW_MS      // Rate limiting config
RATE_LIMIT_MAX_REQUESTS   // Rate limiting config
```

## 🛠️ Validation Script

Use the provided script to validate your environment:

```bash
# Check current environment
npm run env:check

# Check specific environment
npm run env:check production

# Check and generate .env.example
npm run env:check development --generate
```

The script will:
- ✅ Validate all required variables
- ⚠️ Show warnings for optional variables
- ❌ List missing or invalid variables
- 💡 Provide helpful suggestions
- 📝 Generate .env.example if missing

## 🔍 Environment-Specific Behavior

### Development
- Most variables are optional
- JWT_SECRET can use default value
- CORS_ORIGIN can be '*'
- External API keys optional (mocks available)
- Debug endpoints enabled

### Staging
- All production requirements apply
- Should mirror production setup
- Use staging-specific API keys
- Additional logging enabled

### Production
- ALL security variables required
- Strong JWT_SECRET mandatory
- CORS_ORIGIN must be specific domains
- Error monitoring required (SENTRY_DSN)
- Performance optimizations enabled

## 🚨 Error Messages

The validation system provides clear, actionable error messages:

```bash
❌ Environment validation failed:
Missing or invalid environment variables:
  - VITE_SUPABASE_URL: Invalid Supabase URL
  - JWT_SECRET: JWT secret must be at least 32 characters

💡 Required environment variables:
  - VITE_SUPABASE_URL: Your Supabase project URL
  - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key

🔒 Production-specific requirements:
  - JWT_SECRET: Strong JWT signing secret
  - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
```

## 🎯 Feature Flags

The system includes built-in feature flags:

```typescript
import { getFeatureFlags, isFeatureEnabled } from '@med-music/config';

// Check all flags
const flags = getFeatureFlags();
if (flags.musicGeneration) {
  // Enable music generation
}

// Check specific feature
if (isFeatureEnabled('realTimeFeatures')) {
  // Enable real-time subscriptions
}
```

## 🔒 Security Features

### Type Safety
```typescript
// All environment variables are properly typed
const env: Environment = getEnvironment();
env.PORT; // number
env.NODE_ENV; // 'development' | 'staging' | 'production'
env.ENABLE_MUSIC_GENERATION; // boolean
```

### Validation Middleware
```typescript
// Ensures environment is validated for every request
app.use(createEnvValidationMiddleware());
```

### Sensitive Data Protection
```typescript
// Never logs sensitive variables
console.log(getEnvironment().OPENAI_API_KEY); // ❌ Don't do this

// Use secure config getters instead
const supabaseConfig = getSupabaseConfig(); // ✅ Safe
```

## 🛡️ Best Practices

### 1. Validate Early
```typescript
// ❌ Bad: Validate after using variables
const app = express();
app.listen(process.env.PORT); // Might be undefined
validateEnvironment();

// ✅ Good: Validate before everything
validateEnvironment();
const env = getEnvironment();
const app = express();
app.listen(env.PORT); // Guaranteed to be valid
```

### 2. Use Type-Safe Getters
```typescript
// ❌ Bad: Direct process.env access
const supabaseUrl = process.env.VITE_SUPABASE_URL; // string | undefined

// ✅ Good: Validated getter
const supabaseConfig = getSupabaseConfig(); // Fully typed and validated
```

### 3. Environment-Specific Logic
```typescript
import { isProduction, isDevelopment } from '@med-music/config';

if (isProduction()) {
  // Production-only setup
  app.use(rateLimiting);
}

if (isDevelopment()) {
  // Development-only features
  app.use('/debug', debugRoutes);
}
```

### 4. Graceful Error Handling
```typescript
try {
  validateEnvironment();
} catch (error) {
  console.error('Configuration error:', error.message);
  // Show helpful suggestions
  // Exit gracefully
  process.exit(1);
}
```

## 📊 Migration from Old System

### Before (Problematic)
```typescript
// ❌ No validation, silent failures possible
const server = express();
server.listen(process.env.PORT || 3000);

// ❌ Runtime errors possible
const supabase = createClient(
  process.env.SUPABASE_URL,      // Might be undefined
  process.env.SUPABASE_ANON_KEY  // Might be undefined
);
```

### After (Secure)
```typescript
// ✅ Validation first, guaranteed success
const env = validateEnvironment();
const server = express();
server.listen(env.PORT);

// ✅ Type-safe, validated configuration
const supabaseConfig = getSupabaseConfig();
const supabase = createClient(
  supabaseConfig.url,     // Guaranteed to be valid
  supabaseConfig.anonKey  // Guaranteed to be valid
);
```

## 🧪 Testing

The validation system includes comprehensive tests:

```bash
# Test environment validation
npm run test:config

# Test with different environments
NODE_ENV=production npm run test:config
NODE_ENV=development npm run test:config

# Test validation errors
VITE_SUPABASE_URL="" npm run test:config
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: `Environment not validated` error
**Solution**: Call `validateEnvironment()` before `getEnvironment()`

**Issue**: Variables not found despite being in .env
**Solution**: Ensure .env is in project root and variables don't have quotes

**Issue**: JWT secret too short error
**Solution**: Generate a secure random string at least 32 characters long

**Issue**: Invalid Supabase URL format
**Solution**: Ensure URL includes 'supabase.co' or 'localhost' for local development

### Debug Commands

```bash
# Check environment validation
npm run env:check

# Show current environment variables (development only)
curl http://localhost:3000/debug/env

# Health check with environment info
curl http://localhost:3000/health
```

This system ensures your application is properly configured from the start, preventing configuration-related issues in production.