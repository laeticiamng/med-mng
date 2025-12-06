
import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { useOicCompetences } from '@/hooks/useOicCompetences';

interface TableauCompetencesOICWithRealDataProps {
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOICWithRealData: React.FC<TableauCompetencesOICWithRealDataProps> = ({ 
  itemCode, 
  rang 
}) => {
  const { competences, loading, error } = useOicCompetences(itemCode, rang);

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-muted-foreground mt-4">
          Recherche des compétences OIC authentiques pour {itemCode} rang {rang}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <h3 className="text-destructive font-semibold mb-2">
            Erreur de chargement des compétences OIC
          </h3>
          <p className="text-destructive/80 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Si aucune compétence OIC authentique n'est trouvée
  if (!competences || competences.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${rang === 'A' ? 'text-primary' : 'text-accent'}`}>📚</span>
          </div>
          <h3 className="text-foreground font-semibold mb-2">
            Compétences OIC {itemCode} Rang {rang}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Les compétences officielles OIC pour cet item sont en cours d'extraction depuis le site UNESS. 
            En attendant, vous pouvez consulter les autres formats pédagogiques disponibles.
          </p>
          <div className="bg-warning/10 border border-warning/30 rounded p-3 text-sm text-warning">
            <strong>📋 Conseil d'apprentissage :</strong> Consultez la scène immersive, la bande dessinée ou 
            les paroles musicales pour découvrir le contenu de cet item de manière interactive.
          </div>
        </div>
      </div>
    );
  }

  // Convertir les données OIC authentiques au format attendu
  const competencesData = {
    title: `${itemCode} Rang ${rang} - Compétences OIC officielles UNESS`,
    competences: competences.map(comp => ({
      intitule: comp.intitule,
      description: comp.description,
      objectif_id: comp.objectif_id,
      rubrique: comp.rubrique,
      keywords: []
    })),
    count: competences.length,
    theme: `Compétences OIC ${rang === 'A' ? 'fondamentales' : 'avancées'} - Données authentiques UNESS`
  };

  return (
    <TableauCompetencesOICOptimized 
      data={competencesData} 
      itemCode={itemCode} 
      rang={rang} 
    />
  );
};
