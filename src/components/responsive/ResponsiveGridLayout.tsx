import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'library' | 'dashboard' | 'gallery' | 'list';
  gap?: 'sm' | 'md' | 'lg';
  minItemWidth?: string;
}

export const ResponsiveGridLayout: React.FC<ResponsiveGridLayoutProps> = ({
  children,
  className,
  variant = 'library',
  gap = 'md',
  minItemWidth = '280px'
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid w-full';
    
    const gapClasses = {
      sm: 'gap-3 sm:gap-4',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8'
    };

    const variantClasses = {
      library: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      dashboard: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      gallery: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      list: 'grid-cols-1'
    };

    return cn(
      baseClasses,
      gapClasses[gap],
      variantClasses[variant],
      className
    );
  };

  return (
    <div 
      className={getGridClasses()}
      style={variant === 'library' ? {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`
      } : undefined}
    >
      {children}
    </div>
  );
};