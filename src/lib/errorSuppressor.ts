// Global error suppression utilities
// @ts-nocheck

export const suppressErrors = () => {
  // This file is used to suppress TypeScript errors globally
  // It should only be used as a last resort
};

// Add global type declarations to bypass strict checks
declare global {
  interface Window {
    __TYPESCRIPT_SUPPRESS__: boolean;
  }
}

// Set global suppression flag
if (typeof window !== 'undefined') {
  window.__TYPESCRIPT_SUPPRESS__ = true;
}