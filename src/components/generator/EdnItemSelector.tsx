import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';

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
  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900">
        <TranslatedText text="Item EDN" />
      </label>
      <Select value={selectedItem} onValueChange={setSelectedItem}>
        <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
          <SelectValue placeholder="Sélectionnez un item EDN" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl max-h-80 overflow-y-auto">
          {itemsLoading ? (
            <SelectItem value="" disabled>Chargement des items...</SelectItem>
          ) : itemsError ? (
            <SelectItem value="" disabled>Erreur: {itemsError}</SelectItem>
          ) : (
            allEdnItems.map((item) => (
              <SelectItem key={item.item_code} value={item.item_code} className="text-base py-3">
                {item.item_code} - {item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};