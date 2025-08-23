import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'hero' | 'card' | 'text' | 'button';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  className = '' 
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = 'skeleton gpu-accelerated';
    
    switch (variant) {
      case 'hero':
        return `${baseClasses} h-16 md:h-20 w-full max-w-4xl mx-auto rounded-lg mb-8`;
      case 'card':
        return `${baseClasses} card-skeleton h-64 w-full`;
      case 'button':
        return `${baseClasses} h-12 w-32 rounded-full`;
      case 'text':
      default:
        return `${baseClasses} h-4 w-3/4 rounded mb-2`;
    }
  };

  return <div className={`${getSkeletonClasses()} ${className}`} />;
};

export const PageSkeleton: React.FC = () => (
  <div className="critical-layout">
    <div className="critical-container">
      {/* Header Skeleton */}
      <div className="critical-header">
        <div className="flex items-center gap-3">
          <div className="skeleton w-12 h-12 rounded-2xl gpu-accelerated" />
          <div>
            <div className="skeleton h-6 w-24 rounded mb-1 gpu-accelerated" />
            <div className="skeleton h-4 w-16 rounded gpu-accelerated" />
          </div>
        </div>
        <div className="flex gap-3">
          <SkeletonLoader variant="button" />
          <SkeletonLoader variant="button" />
        </div>
      </div>
      
      {/* Hero Skeleton */}
      <div className="critical-hero">
        <SkeletonLoader variant="hero" />
        <div className="skeleton h-6 w-3/4 max-w-3xl mx-auto rounded mb-6 gpu-accelerated" />
        <div className="skeleton h-6 w-1/2 max-w-2xl mx-auto rounded mb-10 gpu-accelerated" />
        
        {/* CTA Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
          <div className="skeleton h-12 w-80 rounded-full gpu-accelerated" />
          <div className="skeleton h-12 w-48 rounded-full gpu-accelerated" />
        </div>
        
        {/* Badges Skeleton */}
        <div className="flex justify-center gap-4 mb-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-8 w-24 rounded-full gpu-accelerated" />
          ))}
        </div>
      </div>
      
      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="skeleton aspect-square rounded-xl mb-4 gpu-accelerated" />
            <div className="skeleton h-4 w-3/4 rounded mb-1 gpu-accelerated" />
            <div className="skeleton h-3 w-1/2 rounded gpu-accelerated" />
          </div>
        ))}
      </div>
      
      {/* Main Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
        {[1, 2].map(i => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
      
      {/* Secondary Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
        {[1, 2].map(i => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    </div>
  </div>
);