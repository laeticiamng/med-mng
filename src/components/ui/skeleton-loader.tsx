import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div 
    className={cn(
      "animate-pulse rounded-md bg-muted/50",
      className
    )} 
  />
);

// Skeleton pour une carte de musique
export const MusicCardSkeleton: React.FC = () => (
  <div className="bg-card/50 rounded-lg p-3 border border-border/50">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  </div>
);

// Skeleton pour une liste de musiques
export const MusicListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <MusicCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton pour les statistiques
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-background/50 rounded-lg p-3 text-center space-y-2">
        <Skeleton className="h-4 w-4 mx-auto rounded-full" />
        <Skeleton className="h-8 w-12 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    ))}
  </div>
);

// Skeleton pour le formulaire générateur
export const GeneratorFormSkeleton: React.FC = () => (
  <div className="bg-card/70 rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-3 mb-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
    
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
    
    <Skeleton className="h-12 w-full rounded-xl mt-6" />
  </div>
);

// Skeleton pour le player
export const PlayerSkeleton: React.FC = () => (
  <div className="bg-card/70 rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-12" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
);
