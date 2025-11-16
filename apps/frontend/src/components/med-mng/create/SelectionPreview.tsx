
import React from 'react';

interface SelectionPreviewProps {
  title: string;
}

export const SelectionPreview: React.FC<SelectionPreviewProps> = ({ title }) => {
  if (!title) return null;

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Aperçu de la sélection :</h3>
      <p className="text-blue-800">{title}</p>
      <p className="text-sm text-blue-600 mt-1">
        Les paroles correspondantes seront automatiquement utilisées
      </p>
    </div>
  );
};
