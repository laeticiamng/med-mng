// @med-mng/shared - Types, schemas et utilitaires partagés

// Re-export types first (priority for type definitions)
export * from './types/index.js';

// Re-export schemas
export * from './schemas/index.js';

// Re-export utils
export * from './utils/index.js';

// Re-export parsers
export * from './parsers/index.js';

// Re-export services (with explicit exports to avoid conflicts)
export * from './services/index.js';

// Re-export scripts
export * from './scripts/index.js';

// Re-export openai
export * from './openai/index.js';

// Re-export music
export * from './music/index.js';

// Re-export Supabase client for shared usage
export { supabase } from './lib/supabase.js';
