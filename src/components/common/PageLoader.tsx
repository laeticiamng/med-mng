import React, { Suspense, ComponentType } from 'react';

/**
 * Reusable page-level loading spinner for Suspense fallbacks.
 */
export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

/**
 * HOC that wraps a lazy-loaded component with Suspense + PageLoader.
 */
export function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  Wrapped.displayName = `withSuspense(${LazyComponent.displayName || 'Component'})`;
  return Wrapped;
}
