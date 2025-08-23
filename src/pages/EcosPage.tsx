import React from 'react';
import { EcosExplorer } from '@/components/ecos/EcosExplorer';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';

export const EcosPage: React.FC = () => {
  const spacing = useResponsiveSpacing();
  
  return (
    <div className={`container mx-auto ${spacing.container}`}>
      <div className={`${spacing.header}`}>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">ECOS - Examens Cliniques Objectifs Structurés</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Explorez et consultez les situations d'ECOS disponibles dans la base de données UNESS
        </p>
      </div>
      
      <EcosExplorer />
    </div>
  );
};