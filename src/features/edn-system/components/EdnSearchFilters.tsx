/**
 * Filtres de recherche EDN
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface EdnSearchFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

export const EdnSearchFilters: React.FC<EdnSearchFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes catégories</SelectItem>
          <SelectItem value="cardiologie">Cardiologie</SelectItem>
          <SelectItem value="pneumologie">Pneumologie</SelectItem>
          <SelectItem value="neurologie">Neurologie</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Difficulté" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes difficultés</SelectItem>
          <SelectItem value="A">Rang A</SelectItem>
          <SelectItem value="B">Rang B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};