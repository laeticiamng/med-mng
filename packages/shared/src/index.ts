// @med-mng/shared - Types, schemas et utilitaires partagés
// Types from ./types take priority over services types

// Re-export types first (priority)
export * from './types/index.js';

// Re-export schemas
export * from './schemas/index.js';

// Re-export utils
export * from './utils/index.js';

// Re-export parsers
export * from './parsers/index.js';

// Re-export scripts
export * from './scripts/index.js';

// Re-export openai
export * from './openai/index.js';

// Re-export music (types already exported from ./types)
export { musicService } from './music/index.js';

// Services are imported separately to avoid conflicts
// Import specific services from '@med-mng/shared/services'

// Re-export Supabase client
export { supabase } from './lib/supabase.js';
