import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EdnItemCard } from '@/components/edn/premium/EdnItemCard';
import { getCompletionPercentage } from '@/utils/completionScore';
import type { EdnItemUnified } from '@/types/edn';

interface EdnItemsGridProps {
  items: EdnItemUnified[];
  onOpenItem: (item: EdnItemUnified, tab?: string) => void;
  onPrefetch?: (itemCode: string) => void;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  showAnimations?: boolean;
}

export const EdnItemsGrid: React.FC<EdnItemsGridProps> = ({
  items,
  onOpenItem,
  onPrefetch,
  hasMore = false,
  loading = false,
  onLoadMore,
  showAnimations = true
}) => {
  return (
    <div data-testid="edn-items-grid" className="space-y-6">
      {showAnimations ? (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.03, 0.5),
                  ease: "easeOut"
                }}
                layout
              >
                <EdnItemCard
                  data-testid={`edn-item-${item.id}`}
                  item={item as any}
                  completionPercentage={item.completeness_score || getCompletionPercentage(item)}
                  onOpen={(tab) => onOpenItem(item, tab)}
                  onPrefetch={onPrefetch}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <EdnItemCard
              key={item.id}
              data-testid={`edn-item-${item.id}`}
              item={item as any}
              completionPercentage={item.completeness_score || getCompletionPercentage(item)}
              onOpen={(tab) => onOpenItem(item, tab)}
              onPrefetch={onPrefetch}
            />
          ))}
        </div>
      )}
      
      {/* Load More Button */}
      {hasMore && !loading && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Charger plus d'items
          </Button>
        </div>
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
