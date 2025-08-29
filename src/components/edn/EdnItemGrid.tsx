import React, { memo, useMemo } from 'react';
import { EdnItemCard } from './EdnItemCard';
import { EdnItemLight } from '@/hooks/useEdnItemsPaginated';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface EdnItemGridProps {
  items: EdnItemLight[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemClick: (item: EdnItemLight) => void;
  searchTerm?: string;
  selectedCategory?: string;
}

export const EdnItemGrid = memo<EdnItemGridProps>(({ 
  items, 
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onItemClick,
  searchTerm = '',
  selectedCategory = 'all'
}) => {
  // Filtrage optimisé côté client pour la recherche instantanée
  const filteredItems = useMemo(() => {
    if (!searchTerm && selectedCategory === 'all') return items;
    
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (selectedCategory) {
        case 'complete':
          return (item.completeness_score || 0) >= 100;
        case 'withMusic':
          return item.has_music;
        case 'validated':
          return item.is_validated;
        default:
          return true;
      }
    });
  }, [items, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des items EDN...</p>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="text-4xl">📚</div>
          <h3 className="text-lg font-semibold">Aucun item trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun item ne correspond aux filtres sélectionnés'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid des items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredItems.map(item => (
          <EdnItemCard 
            key={item.id}
            item={item}
            onClick={onItemClick}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <div className="flex items-center gap-1">
            {/* Pages numérotées avec ellipses */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-muted-foreground px-2">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-10 h-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Info pagination */}
      <div className="text-center text-sm text-muted-foreground">
        Page {currentPage} sur {totalPages} • {filteredItems.length} items affichés
      </div>
    </div>
  );
});

EdnItemGrid.displayName = 'EdnItemGrid';