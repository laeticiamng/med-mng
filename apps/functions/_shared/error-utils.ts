/**
 * 🔧 Error Utilities
 *
 * Helper functions for handling errors in a TypeScript-safe way.
 * In TypeScript, caught errors are of type `unknown`, so we need
 * to properly check their type before accessing properties.
 */

/**
 * Extract error message from an unknown error
 * @param error - The caught error (unknown type)
 * @returns The error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Extract full error details (message and stack) from an unknown error
 * @param error - The caught error (unknown type)
 * @returns An object with message and optional stack
 */
export function getErrorDetails(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }
  return {
    message: typeof error === 'string' ? error : String(error)
  };
}
