import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLibraryGridProps {
  count?: number;
  className?: string;
}

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-card rounded-xl shadow-sm p-4 animate-pulse border">
      {/* Image skeleton */}
      <div className="w-full aspect-square bg-muted rounded-lg mb-4 animate-pulse" />
      
      {/* Title skeleton */}
      <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
      
      {/* Subtitle skeleton */}
      <div className="h-3 bg-muted rounded w-1/2 mb-4 animate-pulse" />
      
      {/* Buttons skeleton */}
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
};

export const SkeletonLibraryGrid: React.FC<SkeletonLibraryGridProps> = ({ 
  count = 12, 
  className = "" 
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};