# Developer Guide

## Project Setup

This guide covers the development setup and conventions for the EDN Medical Learning Platform.

## TypeScript Configuration

### Path Aliases

The project uses TypeScript path aliases to simplify imports and maintain clean code organization.

#### `@` Alias Configuration

**Alias**: `@/*` → `src/*`

This alias allows you to import from the `src` directory using the `@` symbol instead of relative paths.

**Examples**:
```typescript
// ✅ Good - Using alias
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatParoles } from '@/utils/lyrics/generateOptimizedLyrics';

// ❌ Avoid - Relative paths
import { Button } from '../../components/ui/button';
import { supabase } from '../../../integrations/supabase/client';
import { formatParoles } from '../../../utils/lyrics/generateOptimizedLyrics';
```

#### Configuration Files

The `@` alias is configured in all TypeScript configuration files:

1. **`tsconfig.json`** - Root configuration with path mapping
2. **`tsconfig.app.json`** - Application-specific configuration  
3. **`tsconfig.node.json`** - Node.js tools configuration
4. **`vite.config.ts`** - Vite bundler configuration

#### IDE Setup

**VS Code**: Automatically recognizes the alias from `tsconfig.json`

**WebStorm/IntelliJ**: 
1. Go to Settings → Languages & Frameworks → TypeScript
2. Ensure "Use TypeScript Service" is enabled
3. The IDE will automatically read the path mapping from `tsconfig.json`

**Other IDEs**: Most modern TypeScript-aware IDEs will read the path mapping from `tsconfig.json` automatically.

#### Troubleshooting Alias Issues

**Problem**: IDE doesn't recognize `@` imports  
**Solutions**:
1. Restart your IDE/TypeScript language service
2. Check that `tsconfig.json` is in your workspace root
3. Ensure your IDE is using the workspace TypeScript version
4. Try reloading the TypeScript service in your IDE

**Problem**: Build fails with "Cannot resolve module '@/...'\"  
**Solutions**:
1. Verify `vite.config.ts` includes the alias configuration
2. Check that all `tsconfig.*.json` files have the path mapping
3. Ensure `baseUrl: "."` is set in compiler options

## Import Organization

### Import Order Convention

```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal utilities and types
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// 3. Components (UI components first, then feature components)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserProfile } from '@/components/user/UserProfile';

// 4. Local imports (same directory)
import { LocalComponent } from './LocalComponent';
import { helper } from './utils';
```

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── common/         # Common application components
│   ├── edn/           # EDN-specific components
│   └── ...
├── utils/              # Utility functions (organized by category)
│   ├── lyrics/        # Lyrics generation utilities
│   ├── audio/         # Audio processing utilities
│   ├── security/      # Security utilities
│   └── ...
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── lib/              # Third-party library configurations
├── types/            # TypeScript type definitions
└── integrations/     # External service integrations
    └── supabase/     # Supabase configuration and types
```

## Development Workflow

### Code Quality

1. **TypeScript**: Strict type checking enabled
2. **ESLint**: Code linting and formatting
3. **Path Aliases**: Always use `@/` for src imports
4. **Component Organization**: Follow the established directory structure

### Testing

- **Unit Tests**: `npm run test`
- **Security Tests**: `npm run test:security`  
- **UI Tests**: `npm run test:ui`

### Build Process

- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview**: `npm run preview`

## Utility Function Organization

The project uses a well-organized utility structure. See `src/utils/README.md` for detailed documentation on:

- Audio utilities (`@/utils/audio/`)
- Lyrics generation (`@/utils/lyrics/`)  
- Data synchronization (`@/utils/sync/`)
- Security utilities (`@/utils/security/`)
- Monitoring tools (`@/utils/monitoring/`)

## Environment Configuration

See `.env.example` for all required environment variables and `docs/ENVIRONMENT-VARIABLES.md` for detailed configuration guide.

## Contributing

1. Follow the established import conventions
2. Use TypeScript path aliases consistently
3. Maintain the directory structure
4. Write tests for new utilities
5. Document new functions and components

## Common Patterns

### Component Structure
```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  className?: string;
  // ... other props
}

export const Component: React.FC<ComponentProps> = ({ 
  className,
  ...props 
}) => {
  return (
    <div className={cn("base-styles", className)}>
      {/* component content */}
    </div>
  );
};
```

### Custom Hook Pattern
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCustomHook = () => {
  const [state, setState] = useState(null);
  
  // hook logic
  
  return { state, setState };
};
```

### Utility Function Pattern
```typescript
/**
 * Brief description of the function
 * @param param1 - Description of parameter
 * @returns Description of return value
 */
export function utilityFunction(param1: string): ReturnType {
  // implementation
}
```

## IDE Extensions Recommendations

### VS Code
- TypeScript Importer
- Path Intellisense  
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag

### Settings
Add to your VS Code `settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

This ensures the TypeScript language service properly resolves the `@` alias for auto-imports and IntelliSense.
