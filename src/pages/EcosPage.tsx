import React from 'react';
import { EcosExplorer } from '@/components/ecos/EcosExplorer';

export const EcosPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ECOS - Examens Cliniques Objectifs Structurés</h1>
        <p className="text-muted-foreground">
          Explorez et consultez les situations d'ECOS disponibles dans la base de données UNESS
        </p>
      </div>
      
      <EcosExplorer />
    </div>
  );
};