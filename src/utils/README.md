# Utilities Directory Structure

This directory contains organized utility functions grouped by functionality.

## Directory Structure

### 📁 `/audio/`
Audio-related utilities for music generation, conversion, and processing.
- **wav.ts** - WAV format conversion utilities
- **vocal-remove.ts** - Vocal isolation and removal tools  
- **video.ts** - Video generation from audio

### 📁 `/lyrics/`
Lyrics generation and management utilities.
- **generateAllLyrics.ts** - Basic lyrics generation
- **generateAllLyricsAdvanced.ts** - Advanced medical-specific lyrics
- **testGenerationAvancee.ts** - Advanced generation testing utilities
- **runBulkLyricsOnce.ts** - ⚠️ DEPRECATED - Use batchTriggers instead

### 📁 `/sync/` 
Data synchronization between EDN and OIC systems.
- **syncAllItems.ts** - Complete EDN-OIC synchronization
- **syncEdnContent.ts** - EDN content synchronization utilities
- **triggerCompletionEDN.ts** - EDN completion triggers
- **launchNowCompletion.ts** - Immediate completion execution
- **executeCompletionNow.ts** - Direct completion invocation

### 📁 `/oic/`
OIC (Objectifs de Connaissance) data management and processing.
- **runOicFixOnce.ts** - ⚠️ DEPRECATED - Use batchTriggers instead  
- **oicFixLauncher.ts** - OIC data quality fixes
- **oicProgressMonitor.ts** - OIC processing progress monitoring

### 📁 `/security/`
Security-related utilities for request validation and sanitization.
- **sanitize.ts** - HTML/text sanitization utilities
- **suspiciousRequest.ts** - Malicious request pattern detection

### 📁 `/data/`
Data processing and management utilities.
- **fixCompletedTracks.ts** - Music track status correction utilities
- **listAllPageIds.js** - OIC page ID pagination utilities

### 📁 `/monitoring/`
Application monitoring and performance tracking.
- **webVitals.ts** - Web performance metrics collection
- **sentry.ts** - Error tracking and reporting
- **errorStandardization.ts** - Standardized error handling

## Usage Guidelines

### Import Patterns
```typescript
// Audio utilities
import { convertToWav } from '@/utils/audio/wav';
import { removeVocals } from '@/utils/audio/vocal-remove';

// Lyrics utilities  
import { generateAllLyrics } from '@/utils/lyrics/generateAllLyrics';
import { generateAllLyricsAdvanced } from '@/utils/lyrics/generateAllLyricsAdvanced';

// Sync utilities
import { syncAllItemsWithOic } from '@/utils/sync/syncAllItems';
import { syncAllEdnContent } from '@/utils/sync/syncEdnContent';

// Security utilities
import { sanitizeHtml } from '@/utils/security/sanitize';
import { analyzeSuspiciousRequest } from '@/utils/security/suspiciousRequest';
```

### Deprecated Functions
⚠️ Some utilities have been deprecated in favor of centralized batch operations:
- `runOicFixOnce.ts` → Use `batch/batchTriggers.ts`
- `runBulkLyricsOnce.ts` → Use `batch/batchTriggers.ts`

### Adding New Utilities

When adding new utility functions:

1. **Choose the appropriate subdirectory** based on functionality
2. **Follow naming conventions**: use camelCase for functions, kebab-case for files
3. **Add proper TypeScript types** and JSDoc documentation
4. **Update this README** if creating new categories
5. **Add unit tests** in the corresponding `tests/utils/[category]/` directory

### Cross-Category Dependencies

Some utilities may depend on others across categories. Keep dependencies minimal and consider:
- Moving shared interfaces to `/types/`
- Creating a `/common/` subdirectory for truly generic helpers
- Using dependency injection for complex cross-category interactions

## Maintenance Notes

- **Performance**: All utilities should be tree-shakeable
- **Security**: Input validation is mandatory for external-facing utilities  
- **Testing**: Each utility should have corresponding unit tests
- **Documentation**: Public functions require JSDoc comments