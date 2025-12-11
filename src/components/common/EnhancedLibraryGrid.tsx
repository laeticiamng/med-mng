import React, { useEffect } from 'react';
import { ResponsiveGridLayout } from '@/components/responsive/ResponsiveGridLayout';
import { SkeletonLibraryGrid } from '@/components/common/SkeletonLibraryGrid';
import { cn } from '@/lib/utils';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface EnhancedLibraryGridProps {
  children: React.ReactNode;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export const EnhancedLibraryGrid: React.FC<EnhancedLibraryGridProps> = ({
  children,
  isLoading = false,
  skeletonCount = 12,
  className,
  emptyMessage = "Aucun élément trouvé",
  emptyIcon
}) => {
  const { logActivity } = useActivityTracking();

  // Track grid view
  useEffect(() => {
    if (!isLoading) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { type: 'library_grid_view' }
      });
    }
  }, [isLoading, logActivity]);
  if (isLoading) {
    return (
      <div data-testid="library-loading">
        <SkeletonLibraryGrid count={skeletonCount} className={className} />
      </div>
    );
  }

  // Count children to detect empty state
  const childrenArray = React.Children.toArray(children);
  const isEmpty = childrenArray.length === 0;

  if (isEmpty) {
    return (
      <div 
        data-testid="library-empty"
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
      >
        {emptyIcon && (
          <div className="mb-4 text-muted-foreground opacity-50">
            {emptyIcon}
          </div>
        )}
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Aucun contenu disponible
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="library-grid" className="animate-fade-in">
      <ResponsiveGridLayout 
        variant="library"
        className={className}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};