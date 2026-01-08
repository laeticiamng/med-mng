import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { Input } from '@/components/ui/input';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EdnItemSelectorProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
  itemsError: string | null;
}

export const EdnItemSelector: React.FC<EdnItemSelectorProps> = ({
  selectedItem,
  setSelectedItem,
  allEdnItems,
  itemsLoading,
  itemsError
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage des items avec recherche
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allEdnItems;
    const query = searchQuery.toLowerCase();
    return allEdnItems.filter(item => 
      item.item_code.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query)
    );
  }, [allEdnItems, searchQuery]);

  // Trouver l'item sélectionné pour l'afficher
  const selectedItemData = useMemo(() => {
    return allEdnItems.find(item => item.item_code === selectedItem);
  }, [allEdnItems, selectedItem]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <TranslatedText text="Item EDN" />
        </label>
        <Badge variant="secondary" className="text-xs">
          {allEdnItems.length} items
        </Badge>
      </div>
      
      {/* Nombre total d'items affichés */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} sur {allEdnItems.length}</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-primary hover:underline"
            >
              Effacer
            </button>
          )}
        </div>
      )}
      
      <Select 
        value={selectedItem} 
        onValueChange={(value) => {
          setSelectedItem(value);
          setSearchQuery('');
        }}
      >
        <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
          <SelectValue placeholder="Sélectionnez un item" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl max-h-80 sm:max-h-96 overflow-hidden">
          <div className="p-2 border-b border-border/30 sticky top-0 bg-card/95 backdrop-blur-xl z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filtrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm bg-background/50"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 sm:max-h-72 overflow-y-auto">
            {itemsLoading ? (
              <div className="px-2 py-3 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : itemsError ? (
              <div className="px-2 py-3 text-center text-destructive text-sm">Erreur: {itemsError}</div>
            ) : filteredItems.length === 0 ? (
              <div className="px-2 py-3 text-center text-muted-foreground text-sm">
                Aucun item trouvé
              </div>
            ) : (
              filteredItems.slice(0, 100).map((item) => (
                <SelectItem key={item.item_code} value={item.item_code} className="text-sm sm:text-base py-2.5 sm:py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {item.item_code}
                    </Badge>
                    <span className="truncate text-sm">
                      {item.title.length > 35 ? item.title.substring(0, 35) + '...' : item.title}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
            {filteredItems.length > 100 && (
              <div className="px-2 py-2 text-center text-xs text-muted-foreground border-t">
                Affinez la recherche ({filteredItems.length - 100}+ masqués)
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
      
      {/* Affichage de l'item sélectionné - compact */}
      {selectedItemData && (
        <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary text-primary-foreground text-xs">{selectedItemData.item_code}</Badge>
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">{selectedItemData.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ✅ Paroles chargées automatiquement
          </p>
        </div>
      )}
    </div>
  );
};