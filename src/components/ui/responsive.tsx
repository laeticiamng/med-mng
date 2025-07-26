import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: string;
  gap?: string;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  gap = 'gap-4 md:gap-6',
  breakpoints = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6
  }
}) => {
  // Construire les classes CSS dynamiquement
  const gridClasses = [
    'grid',
    'grid-cols-1', // Mobile par défaut
    breakpoints.sm && `sm:grid-cols-${breakpoints.sm}`,
    breakpoints.md && `md:grid-cols-${breakpoints.md}`,
    breakpoints.lg && `lg:grid-cols-${breakpoints.lg}`,
    breakpoints.xl && `xl:grid-cols-${breakpoints.xl}`,
    breakpoints['2xl'] && `2xl:grid-cols-${breakpoints['2xl']}`,
    gap
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cn(gridClasses, className)}
      role="grid"
      aria-label="Grille responsive de contenu"
    >
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  touchTarget?: boolean;
  hover?: boolean;
  style?: React.CSSProperties;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  touchTarget = true,
  hover = true,
  style
}) => {
  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        // Touch targets optimisés (min 48x48px)
        touchTarget && "min-h-[48px] p-4 md:p-6",
        // Effets hover
        hover && "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        // Focus pour accessibilité
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className
      )}
      style={style}
      role="gridcell"
    >
      {children}
    </div>
  );
};

interface LibraryGridProps {
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  children,
  loading = false,
  empty = false,
  emptyMessage = "Aucun élément trouvé",
  skeletonCount = 12
}) => {
  if (loading) {
    return (
      <ResponsiveGrid breakpoints={{ sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <SkeletonLibraryCard key={index} index={index} />
        ))}
      </ResponsiveGrid>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Bibliothèque vide</h3>
        <p className="text-muted-foreground max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ResponsiveGrid 
      breakpoints={{ sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
      className="animate-fade-in"
    >
      {children}
    </ResponsiveGrid>
  );
};

const SkeletonLibraryCard: React.FC<{ index: number }> = ({ index }) => {
  return (
    <ResponsiveCard 
      className="animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-4">
        {/* Image placeholder */}
        <div className="aspect-square bg-muted rounded-lg">
          <div className="w-full h-full bg-gradient-to-br from-muted via-muted-foreground/10 to-muted rounded-lg" />
        </div>
        
        {/* Content placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        
        {/* Actions placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
      </div>
    </ResponsiveCard>
  );
};

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px] p-2',
    md: 'min-h-[48px] min-w-[48px] p-3',
    lg: 'min-h-[56px] min-w-[56px] p-4'
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "active:scale-95",
        sizeClasses[size],
        className
      )}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};