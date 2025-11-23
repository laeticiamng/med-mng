// Shared Supabase client for use across packages
// This is a re-export to avoid circular dependencies
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const SUPABASE_URL = env.get('VITE_SUPABASE_URL', "https://yaincoxihiqdksxgrsrk.supabase.co");
const SUPABASE_PUBLISHABLE_KEY = env.get('VITE_SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU");

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: isBrowser ? {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  } : undefined
});
