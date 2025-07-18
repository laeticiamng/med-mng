// Utility to safely convert unknown error to string
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Utility to safely access possibly undefined objects
export const safeAccess = <T>(obj: T | undefined | null, fallback: T): T => {
  return obj ?? fallback;
};

// Convert null to undefined for Supabase compatibility
export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

// Type guard for arrays
export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

// Safe array conversion
export const ensureArray = <T>(value: T[] | null | undefined): T[] => {
  return value ?? [];
};