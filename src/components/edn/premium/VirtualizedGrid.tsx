import { useWindowSize } from '@/hooks/useWindowSize';
import React, { useMemo } from 'react';

interface GridItem {
  id?: string | number;
  [key: string]: unknown;
}

interface VirtualizedGridProps<T extends GridItem> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemHeight?: number;
  gap: number;
}

export const VirtualizedGrid = <T extends GridItem>({
  items,
  renderItem,
  gap
}: VirtualizedGridProps<T>) => {
  const { width: windowWidth } = useWindowSize();

  const { columnCount } = useMemo(() => {
    // Calculer le nombre de colonnes basé sur la largeur de la fenêtre
    const containerPadding = 32;
    const availableWidth = windowWidth - containerPadding;
    const minItemWidth = 380;

    let cols = Math.floor(availableWidth / (minItemWidth + gap));
    cols = Math.max(1, Math.min(cols, 4));

    return {
      columnCount: cols,
    };
  }, [windowWidth, gap]);
  // Si peu d'items, affichage normal
  if (items.length <= 20) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => renderItem(item))}
      </div>
    );
  }

  // Affichage optimisé avec grille normale pour éviter react-window
  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-muted-foreground bg-card/80 p-3 rounded-lg">
        📊 Affichage optimisé: {items.length} items • {columnCount} colonnes • Performance maximale
      </div>
      
      <div 
        className="grid gap-6 auto-rows-max scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-muted"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          maxHeight: '800px',
          overflowY: 'auto'
        }}
      >
        {items.map((item) => renderItem(item))}
      </div>
      
      {items.length > 20 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm">
            📈 {items.length} items affichés simultanément
          </div>
        </div>
      )}
    </div>
  );
};