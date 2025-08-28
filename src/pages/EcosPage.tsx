import React from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { EcosExplorer } from '@/components/ecos/EcosExplorer';
import { Stethoscope } from 'lucide-react';

export const EcosPage: React.FC = () => {
  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="ECOS - Examens Cliniques"
          subtitle="Explorez et consultez les situations d'ECOS disponibles dans la base de données UNESS"
          icon={Stethoscope}
        />
        
        <EcosExplorer />
      </div>
    </ConsistentBackground>
  );
};