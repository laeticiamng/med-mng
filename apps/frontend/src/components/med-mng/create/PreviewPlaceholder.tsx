
import React from 'react';
import { Music } from 'lucide-react';

interface PreviewPlaceholderProps {
  selectedTitle: string;
}

export const PreviewPlaceholder: React.FC<PreviewPlaceholderProps> = ({ selectedTitle }) => {
  return (
    <div className="text-center py-16">
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <Music className="h-16 w-16 text-gray-400" />
      </div>
      <p className="text-gray-500">
        {selectedTitle ? 
          `Prêt à générer : ${selectedTitle}` : 
          'Sélectionnez vos paramètres pour commencer'
        }
      </p>
    </div>
  );
};
