import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EdnItemLight } from '@/hooks/useEdnItemsPaginated';

interface EdnItemGridProps {
  items: EdnItemLight[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemClick: (item: EdnItemLight) => void;
  searchTerm: string;
  selectedCategory: string;
}

export const EdnItemGrid: React.FC<EdnItemGridProps> = ({
  items,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onItemClick,
  searchTerm,
  selectedCategory,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm animate-pulse">
            <CardHeader>
              <div className="h-4 bg-white/20 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-white/20 rounded"></div>
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card 
            key={item.id}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all cursor-pointer group"
            onClick={() => onItemClick(item)}
          >
            <CardHeader>
              <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">
                {item.titre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-300">
                <p><strong>Matière:</strong> {item.matiere}</p>
                <p><strong>Rang:</strong> {item.rang}</p>
                {item.validated && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                    ✓ Validé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        
        <span className="text-white px-4">
          Page {currentPage} sur {totalPages}
        </span>
        
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};