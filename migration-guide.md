# 🚀 Migration Guide - Refactoring to New Architecture

This guide will help you migrate from the current mixed structure to the new clean architecture.

## 🎯 Migration Strategy

### Phase 1: Setup New Structure (Week 1)
1. Create new package structure
2. Set up build configurations
3. Implement core packages
4. Set up testing infrastructure

### Phase 2: Move Core Logic (Week 2-3)
1. Extract business logic to `@med-music/core`
2. Create shared types in `@med-music/types`
3. Move reusable components to `@med-music/ui`
4. Migrate utility functions

### Phase 3: Refactor Frontend (Week 4-5)
1. Move React app to `apps/web`
2. Update imports to use new packages
3. Refactor components to use design system
4. Update routing and state management

### Phase 4: Security & Testing (Week 6)
1. Implement comprehensive security tests
2. Add integration tests
3. Set up automated security scanning
4. Performance optimization

### Phase 5: Documentation & Deployment (Week 7)
1. Update all documentation
2. Set up new deployment pipeline
3. Migrate CI/CD configuration
4. Final testing and validation

## 📋 Detailed Migration Steps

### Step 1: Create Package Structure

```bash
# Create new directory structure
mkdir -p apps/web
mkdir -p packages/{core,types,ui,config}/src
mkdir -p tools/scripts
mkdir -p tests/{security,integration,e2e}
mkdir -p docs/{api,architecture,deployment}
mkdir -p configs/{eslint,typescript,tailwind}
```

### Step 2: Move Files

#### From `src/components` to packages:

```bash
# Business logic components → @med-music/core
mv src/hooks/useMusicGeneration* packages/core/src/
mv src/services/ packages/core/src/
mv src/lib/ packages/core/src/

# UI components → @med-music/ui
mv src/components/ui/ packages/ui/src/components/
mv src/components/generator/ packages/ui/src/components/

# Types → @med-music/types
mv src/types/ packages/types/src/
# Create new type definitions based on existing interfaces

# React app → apps/web
mv src/ apps/web/src/
mv public/ apps/web/public/
mv index.html apps/web/index.html
```

### Step 3: Update Import Statements

Use this script to update imports automatically:

```bash
#!/bin/bash

# Update imports in all TypeScript files
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/hooks/useMusicGeneration|@med-music/core/music|g'
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/components/ui|@med-music/ui|g'
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/types|@med-music/types|g'
```

### Step 4: Update Package Dependencies

#### Root `package.json`:
```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=@med-music/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

#### `apps/web/package.json`:
```json
{
  "dependencies": {
    "@med-music/core": "workspace:*",
    "@med-music/types": "workspace:*",
    "@med-music/ui": "workspace:*",
    "@med-music/config": "workspace:*"
  }
}
```

### Step 5: Migrate Components

#### Example: Music Player Component

**Before** (`src/components/MusicPlayer.tsx`):
```typescript
import { useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause } from 'lucide-react';

export const MusicPlayer = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // ... component logic
};
```

**After** (`packages/ui/src/components/MusicPlayer.tsx`):
```typescript
import { useState } from 'react';
import { Button } from '../Button';
import { Play, Pause } from 'lucide-react';
import { Track } from '@med-music/types';

export interface MusicPlayerProps {
  track: Track;
  onPlay?: () => void;
  onPause?: () => void;
}

export const MusicPlayer = ({ track, onPlay, onPause }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // ... component logic
};
```

### Step 6: Extract Business Logic

#### Example: Music Generation Service

**Before** (`src/hooks/useMusicGeneration.ts`):
```typescript
export const useMusicGeneration = () => {
  const generateMusic = async (params) => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return response.json();
  };
  
  return { generateMusic };
};
```

**After** (`packages/core/src/music/generation.ts`):
```typescript
import { MusicGenerationRequest, MusicGenerationResponse } from '@med-music/types';

export class MusicGenerationService {
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    // Implementation with proper error handling and validation
  }
}
```

### Step 7: Update Tests

#### Move and update test files:

```bash
# Move existing tests
mv src/__tests__/ tests/integration/
mv cypress/e2e/ tests/e2e/

# Create new security tests
cp templates/security-tests/* tests/security/
```

#### Update test configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
});
```

### Step 8: Update Build Configuration

#### `apps/web/vite.config.ts`:
```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@med-music/core": path.resolve(__dirname, "../../packages/core/src"),
      "@med-music/types": path.resolve(__dirname, "../../packages/types/src"),
      "@med-music/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@med-music/config": path.resolve(__dirname, "../../packages/config/src"),
    },
  },
});
```

### Step 9: Update Supabase Configuration

No changes needed to existing edge functions, but organize them better:

```bash
# Organize edge functions
mkdir -p supabase/functions/shared
mv supabase/functions/common-utils.ts supabase/functions/shared/
```

### Step 10: Deploy and Validate

```bash
# Test the migration
npm run build
npm run test
npm run test:security

# Deploy to staging
npm run deploy -- --env=staging

# Run validation tests
npm run test:e2e
```

## 🔧 Common Migration Issues

### Issue 1: Import Resolution
**Problem**: Imports not resolving after migration
**Solution**: Update `tsconfig.json` paths and Vite aliases

### Issue 2: Type Conflicts
**Problem**: TypeScript errors after moving types
**Solution**: Use explicit imports and update type definitions

### Issue 3: Build Errors
**Problem**: Build fails due to missing dependencies
**Solution**: Update package.json dependencies and ensure proper workspace setup

### Issue 4: Test Failures
**Problem**: Tests fail after refactoring
**Solution**: Update test imports and mock configurations

## ✅ Migration Checklist

- [ ] New package structure created
- [ ] Core logic moved to `@med-music/core`
- [ ] Types moved to `@med-music/types`
- [ ] UI components moved to `@med-music/ui`
- [ ] React app moved to `apps/web`
- [ ] All imports updated
- [ ] Build configurations updated
- [ ] Tests updated and passing
- [ ] Security tests implemented
- [ ] Documentation updated
- [ ] Deployment pipeline updated
- [ ] Performance validated
- [ ] Security scan passing

## 📊 Before vs After Comparison

### Before:
```
src/
├── components/           # Mixed UI and business logic
├── hooks/               # Mixed hooks
├── utils/               # Mixed utilities
├── types/               # All types
├── services/            # API services
└── lib/                 # External libraries
```

### After:
```
apps/web/src/            # Pure React application
packages/core/           # Business logic
packages/types/          # Type definitions
packages/ui/             # Reusable components
packages/config/         # Configuration
tests/security/          # Security tests
tests/integration/       # Integration tests
docs/                    # Centralized documentation
```

## 🎉 Benefits After Migration

1. **Better Organization**: Clear separation of concerns
2. **Improved Maintainability**: Easier to find and modify code
3. **Enhanced Security**: Comprehensive security testing
4. **Better Performance**: Optimized build and bundle sizes
5. **Easier Collaboration**: Clear package boundaries
6. **Scalability**: Ready for future growth

## 🆘 Getting Help

If you encounter issues during migration:

1. Check the troubleshooting section in each package README
2. Run the migration validation script: `npm run validate:migration`
3. Consult the architecture documentation: `docs/architecture/`
4. Ask for help in the team chat or create an issue

Remember to migrate incrementally and test each step thoroughly!