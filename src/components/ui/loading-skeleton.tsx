import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  type?: 'text' | 'circle' | 'rect' | 'card';
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  type = 'rect',
  lines = 1 
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-300/20 via-gray-200/40 to-gray-300/20 rounded";
  
  if (type === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(baseClasses, "h-4", i === lines - 1 ? "w-3/4" : "w-full")} 
          />
        ))}
      </div>
    );
  }
  
  const typeClasses = {
    text: "h-4 w-full",
    circle: "h-12 w-12 rounded-full",
    rect: "h-20 w-full",
    card: "h-48 w-full"
  };
  
  return (
    <div className={cn(baseClasses, typeClasses[type], className)} />
  );
};

export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <LoadingSkeleton type="circle" className="mx-auto mb-4" />
        <LoadingSkeleton type="text" lines={2} className="max-w-md mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} type="card" />
        ))}
      </div>
    </div>
  </div>
);