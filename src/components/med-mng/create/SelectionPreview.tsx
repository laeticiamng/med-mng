
import React from 'react';

interface SelectionPreviewProps {
  title: string;
}

export const SelectionPreview: React.FC<SelectionPreviewProps> = ({ title }) => {
  if (!title) return null;

  return (
    <div className="p-4 bg-primary/10 rounded-lg">
      <h3 className="font-semibold text-foreground mb-2">Aperçu de la sélection :</h3>
      <p className="text-foreground/80">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Les paroles correspondantes seront automatiquement utilisées
      </p>
    </div>
  );
};
