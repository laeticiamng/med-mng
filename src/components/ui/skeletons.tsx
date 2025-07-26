import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SkeletonLibraryGridProps {
  count?: number;
  showSearch?: boolean;
}

export const SkeletonLibraryGrid: React.FC<SkeletonLibraryGridProps> = ({ 
  count = 12, 
  showSearch = true 
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search skeleton */}
      {showSearch && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" /> {/* Titre */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Skeleton className="h-10 flex-1" /> {/* Search input */}
            <Skeleton className="h-10 w-32" /> {/* Filter button */}
          </div>
        </div>
      )}

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center space-x-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

interface SkeletonCardProps {
  index: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ index }) => {
  // Animation avec délai progressif pour effet de vague
  const delay = index * 100;
  
  return (
    <Card 
      className="h-full overflow-hidden animate-pulse"
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: '1.5s'
      }}
    >
      <CardHeader className="p-0">
        {/* Image placeholder avec gradient animé */}
        <div className="relative aspect-square bg-gradient-to-br from-muted via-muted-foreground/10 to-muted rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
          {/* Play button placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {/* Titre */}
        <Skeleton className="h-5 w-full" />
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Métadonnées */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" /> {/* Icône */}
            <Skeleton className="h-4 w-16" /> {/* Durée */}
          </div>
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Like button */}
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

interface SkeletonExtractionDashboardProps {
  count?: number;
}

export const SkeletonExtractionDashboard: React.FC<SkeletonExtractionDashboardProps> = ({ 
  count = 6 
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" /> {/* Titre */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} className="p-6 animate-pulse" style={{ animationDelay: `${index * 150}ms` }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface SkeletonLoadingProps {
  text?: string;
  delay?: number;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({ 
  text = "Chargement en cours...", 
  delay = 4000 
}) => {
  const [showSlowMessage, setShowSlowMessage] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        <span className="text-muted-foreground">{text}</span>
      </div>
      
      {showSlowMessage && (
        <div className="text-center space-y-2 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            ⏱️ Chargement plus long que d'habitude...
          </p>
          <p className="text-xs text-muted-foreground">
            Vérifiez votre connexion ou réessayez dans quelques instants.
          </p>
        </div>
      )}
    </div>
  );
};