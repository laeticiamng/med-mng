/**
 * Shared error utility for Edge Functions
 * Safely extracts error messages from unknown catch values
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
