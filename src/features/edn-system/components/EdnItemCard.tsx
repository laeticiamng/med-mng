/**
 * Composant carte pour un item EDN
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EdnItemCardProps {
  item: {
    id: string;
    title: string;
    category?: string;
    difficulty?: string;
  };
  onSelect?: (item: any) => void;
}

export const EdnItemCard: React.FC<EdnItemCardProps> = ({ item, onSelect }) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{item.title}</h3>
        {item.category && (
          <Badge variant="secondary">{item.category}</Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        ID: {item.id}
      </p>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect?.(item)}
        >
          Ouvrir
        </Button>
      </div>
    </Card>
  );
};