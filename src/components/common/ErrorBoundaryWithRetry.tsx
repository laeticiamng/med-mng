/**
 * Re-export from the consolidated error boundary in utils/errorBoundary.tsx
 * Kept for backward compatibility.
 */
import { ErrorBoundary } from '@/utils/errorBoundary';

export { ErrorBoundary as ErrorBoundaryWithRetry, withErrorBoundary } from '@/utils/errorBoundary';
export default ErrorBoundary;
