import React from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { EdnObjectifsExtraction } from '@/components/edn/EdnObjectifsExtraction';
import { Target } from 'lucide-react';

const EdnObjectifsExtractionPage: React.FC = () => {
  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Extraction d'Objectifs EDN"
          subtitle="Analysez et extrayez les objectifs pédagogiques des items EDN"
          icon={Target}
          showBackButton
          backTo="/edn"
        />
        
        <EdnObjectifsExtraction />
      </div>
    </ConsistentBackground>
  );
};

export default EdnObjectifsExtractionPage;