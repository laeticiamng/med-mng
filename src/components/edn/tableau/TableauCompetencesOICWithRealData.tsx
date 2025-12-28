
import React, { useState, useEffect } from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { supabase } from '@/integrations/supabase/client';

interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rubrique: string;
}

interface TableauCompetencesOICWithRealDataProps {
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOICWithRealData: React.FC<TableauCompetencesOICWithRealDataProps> = ({ 
  itemCode, 
  rang 
}) => {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemCode || !itemCode.startsWith('IC-')) {
      setLoading(false);
      return;
    }

    const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
    console.log(`🔍 TableauOIC: Fetching for ${itemNumber} ${rang}`);

    setLoading(true);
    setError(null);

    supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, rubrique')
      .eq('item_parent', itemNumber)
      .eq('rang', rang)
      .order('objectif_id')
      .then(result => {
        console.log(`📊 TableauOIC Result:`, result);
        
        if (result.error) {
          setError(result.error.message);
          setLoading(false);
          return;
        }

        const data = (result.data || []).filter(c => c.objectif_id && c.intitule) as OicCompetence[];
        console.log(`✅ TableauOIC: ${data.length} compétences loaded`);
        setCompetences(data);
        setLoading(false);
      });
  }, [itemCode, rang]);

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-muted-foreground mt-4">
          Chargement des compétences OIC pour {itemCode} rang {rang}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <h3 className="text-destructive font-semibold mb-2">
            Erreur de chargement
          </h3>
          <p className="text-destructive/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (competences.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${rang === 'A' ? 'text-primary' : 'text-accent'}`}>📚</span>
          </div>
          <h3 className="text-foreground font-semibold mb-2">
            Compétences OIC {itemCode} Rang {rang}
          </h3>
          <p className="text-muted-foreground text-sm">
            Aucune compétence OIC trouvée pour cet item.
          </p>
        </div>
      </div>
    );
  }

  const competencesData = {
    title: `${itemCode} Rang ${rang} - Compétences OIC officielles UNESS`,
    competences: competences.map(comp => ({
      intitule: comp.intitule,
      description: comp.description || comp.intitule,
      objectif_id: comp.objectif_id,
      rubrique: comp.rubrique,
      keywords: []
    })),
    count: competences.length,
    theme: `Compétences OIC ${rang === 'A' ? 'fondamentales' : 'avancées'}`
  };

  return (
    <TableauCompetencesOICOptimized 
      data={competencesData} 
      itemCode={itemCode} 
      rang={rang} 
    />
  );
};
