
import React from 'react';
import { Music } from 'lucide-react';

interface PreviewPlaceholderProps {
  selectedTitle: string;
}

export const PreviewPlaceholder: React.FC<PreviewPlaceholderProps> = ({ selectedTitle }) => {
  return (
    <div className="text-center py-16">
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
        <Music className="h-16 w-16 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        {selectedTitle ? 
          `Prêt à générer : ${selectedTitle}` : 
          'Sélectionnez vos paramètres pour commencer'
        }
      </p>
    </div>
  );
};
