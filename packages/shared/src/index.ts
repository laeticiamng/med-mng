// @med-mng/shared - Types, schemas et utilitaires partagés

// Re-export everything for convenience
export * from './types/index.js';
export * from './schemas/index.js';
export * from './utils/index.js';
export * from './parsers/index.js';
export * from './services/index.js';
export * from './scripts/index.js';
export * from './openai/index.js';
export * from './music/index.js';

// Re-export Supabase client for shared usage
export { supabase } from './lib/supabase.js';
