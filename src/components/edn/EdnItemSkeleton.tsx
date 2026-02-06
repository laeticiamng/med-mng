import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const EdnItemSkeleton = () => {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardContent className="p-4 space-y-3">
        {/* Header with item code */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        
        {/* Title */}
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        
        {/* Badges */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
        
        {/* Progress bar */}
        <Skeleton className="h-2 w-full rounded-full mt-2" />
      </CardContent>
    </Card>
  );
};

export const EdnItemSkeletonGrid = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <EdnItemSkeleton key={i} />
      ))}
    </div>
  );
};
