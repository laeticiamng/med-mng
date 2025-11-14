import React, { Suspense, ReactNode } from 'react';

/**
 * Reusable loading spinner component
 * Replaces 100+ repetitions of manual Suspense fallback UI
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

/**
 * Wrapper component for lazy-loaded pages with built-in Suspense
 * Reduces boilerplate and ensures consistent loading UI
 */
interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <LoadingSpinner />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

/**
 * HOC for wrapping page components with Suspense
 * Usage:
 * const Page = withSuspense(lazy(() => import('./Page')))
 */
export const withSuspense = <P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <SuspenseWrapper fallback={fallback}>
      <Component {...props} />
    </SuspenseWrapper>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName || 'Component'})`;
  return WrappedComponent;
};
