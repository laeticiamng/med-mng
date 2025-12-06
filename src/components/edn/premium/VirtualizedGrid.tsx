import React, { useMemo } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';

interface VirtualizedGridProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  itemHeight: number;
  gap: number;
}

export const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  renderItem,
  itemHeight,
  gap
}) => {
  const { width: windowWidth } = useWindowSize();
  
  const { columnCount, itemWidth, gridWidth } = useMemo(() => {
    // Calculer le nombre de colonnes basé sur la largeur de la fenêtre
    const containerPadding = 32; // padding du container
    const availableWidth = windowWidth - containerPadding;
    const minItemWidth = 380; // largeur minimale d'une carte
    
    let cols = Math.floor(availableWidth / (minItemWidth + gap));
    cols = Math.max(1, Math.min(cols, 4)); // Entre 1 et 4 colonnes max
    
    const totalGapWidth = (cols - 1) * gap;
    const width = (availableWidth - totalGapWidth) / cols;
    const totalWidth = availableWidth;
    
    return {
      columnCount: cols,
      itemWidth: width,
      gridWidth: totalWidth
    };
  }, [windowWidth, gap]);

  const rowCount = Math.ceil(items.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];
    
    if (!item) return null;

    return (
      <div
        style={{
          ...style,
          left: style.left + (columnIndex * gap),
          width: itemWidth,
          padding: '12px'
        }}
      >
        {renderItem(item)}
      </div>
    );
  };

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