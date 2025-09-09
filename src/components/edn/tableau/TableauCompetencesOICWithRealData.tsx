
import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { logger } from '@/utils/structuredLogger';

interface TableauCompetencesOICWithRealDataProps {
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOICWithRealData: React.FC<TableauCompetencesOICWithRealDataProps> = ({ 
  itemCode, 
  rang 
}) => {
  // Récupération directe depuis backup_oic_competences
  const { competences, loading, error } = useOicCompetences(itemCode, rang);

  logger.debug('TableauCompetencesOICWithRealData rendu', {
    component: 'TableauCompetencesOICWithRealData',
    metadata: {
      itemCode,
      rang,
      competencesCount: competences?.length || 0,
      loading,
      hasError: !!error
    }
  });

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
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <p className="text-destructive">
            Erreur lors du chargement des compétences: {error}
          </p>
        </div>
      </div>
    );
  }

  // Si aucune compétence OIC n'est trouvée
  if (!competences || competences.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${rang === 'A' ? 'text-blue-600' : 'text-purple-600'}`}>📚</span>
          </div>
          <h3 className="text-foreground font-semibold mb-2">
            Compétences OIC {itemCode} Rang {rang}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Aucune compétence OIC disponible pour {itemCode} rang {rang} dans la base de données.
          </p>
        </div>
      </div>
    );
  }

  // Les compétences sont déjà triées depuis useOicCompetences
  // Mais on applique un tri de sécurité supplémentaire
  const sortedCompetences = [...competences].sort((a, b) => {
    // Priorité 1: tri par ordre si disponible
    if (a.ordre !== null && b.ordre !== null && a.ordre !== undefined && b.ordre !== undefined) {
      return a.ordre - b.ordre;
    }
    
    // Priorité 2: extraire le numéro de séquence de l'objectif_id (OIC-XXX-YY-[A|B])
    const extractSequenceNumber = (objectifId: string) => {
      const match = objectifId.match(/OIC-\d+-(\d+)-[AB]/);
      return match ? parseInt(match[1], 10) : 999999; // valeur élevée si pas de match
    };
    
    const seqA = extractSequenceNumber(a.objectif_id || '');
    const seqB = extractSequenceNumber(b.objectif_id || '');
    
    return seqA - seqB;
  });
  
  const competencesFormatted = {
    title: `${itemCode} Rang ${rang} - Compétences OIC (${sortedCompetences.length})`,
    competences: sortedCompetences.map((comp, index) => ({
      intitule: comp.intitule || 'Titre non disponible',
      description: comp.description || 'Description non disponible',
      objectif_id: comp.objectif_id || '',
      rubrique: comp.rubrique || '',
      keywords: [],
      ordre_affichage: comp.ordre || index + 1,
      url_source: comp.url_source
    })),
    count: sortedCompetences.length,
    theme: `Compétences OIC ${rang === 'A' ? 'fondamentales' : 'avancées'} - Base backup_oic_competences`
  };

  logger.info('Affichage compétences OIC avec données réelles', {
    component: 'TableauCompetencesOICWithRealData',
    metadata: {
      itemCode,
      rang,
      count: sortedCompetences.length
    }
  });

  return (
    <div>
      <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-success">✅</span>
          <span className="text-success font-semibold">
            DONNÉES BACKUP_OIC_COMPETENCES: {sortedCompetences.length} compétences pour {itemCode} Rang {rang}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          Données extraites directement de la table backup_oic_competences avec statut completed/updated/verified_unchanged
        </p>
      </div>
      <TableauCompetencesOICOptimized 
        data={competencesFormatted} 
        itemCode={itemCode} 
        rang={rang} 
      />
    </div>
  );
};
