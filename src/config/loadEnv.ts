// Environment loading is handled by Vite and Lovable
// This file is kept for backwards compatibility but does nothing in Lovable environment
export function loadEnv() {
  // No-op in Lovable environment
  // Environment variables should be configured via secrets or hardcoded for Supabase
  console.debug('loadEnv called - no-op in Lovable environment');
}
