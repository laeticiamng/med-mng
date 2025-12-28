import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauCompetencesOICWithRealData } from './TableauCompetencesOICWithRealData';
import { processTableauRangBIC4 } from './TableauRangBUtilsIC4Integration';
import { processTableauRangBIC6 } from './TableauRangBUtilsIC6Integration';
import { processTableauRangBIC7 } from './TableauRangBUtilsIC7Integration';
import { processTableauRangBIC8 } from './TableauRangBUtilsIC8Integration';
import { processTableauRangBIC9 } from './TableauRangBUtilsIC9Integration';
import { processTableauRangBIC10 } from './TableauRangBUtilsIC10Integration';
import { processTableauRangBOIC010 } from './TableauRangBUtilsOIC010Integration';

interface TableauRangBProps {
  data: any;
  itemCode: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  // Utiliser les vraies données OIC si itemCode est fourni
  if (itemCode && (itemCode.startsWith('IC-') || itemCode.startsWith('OIC-'))) {
    
    return (
      <TableauCompetencesOICWithRealData 
        itemCode={itemCode} 
        rang="B" 
      />
    );
  }

  // Nouveau format avec sections OIC (après migration)
  if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
    
    // Convertir le format sections vers le format competences attendu avec toutes les informations
    const competencesData = {
      title: data.title || `${itemCode} Rang B - Compétences OIC avancées`,
      competences: data.sections.map((section: any) => {
        return {
          intitule: section.title || 'Compétence non définie',
          description: section.content || 'Description non disponible',
          objectif_id: section.objectif_id || 'Non défini',
          rubrique: section.rubrique || 'Non spécifiée',
          keywords: section.keywords || [],
          // Données enrichies niveau LiSA
          titre_complet: null,
          sommaire: null,
          mecanismes: null,
          indications: null,
          effets_indesirables: null,
          interactions: null,
          modalites_surveillance: null,
          causes_echec: null,
          contributeurs: null,
          ordre_affichage: null
        };
      }),
      count: data.competences_count || data.sections.length,
      theme: data.subtitle || 'Compétences OIC avancées'
    };
    
    return (
      <TableauCompetencesOICOptimized 
        data={competencesData} 
        itemCode={itemCode} 
        rang="B" 
      />
    );
  }

  // Format direct avec compétences (ancien format)
  if (data.competences && Array.isArray(data.competences)) {
    return (
      <TableauCompetencesOICOptimized 
        data={data} 
        itemCode={itemCode} 
        rang="B" 
      />
    );
  }

  // Ancien format avec processeurs spécialisés (fallback)
  
  let processedData;
  
  try {
    switch (itemCode) {
      case 'IC-4':
        processedData = processTableauRangBIC4(data);
        break;
      case 'IC-6':
        processedData = processTableauRangBIC6(data);
        break;
      case 'IC-7':
        processedData = processTableauRangBIC7(data);
        break;
      case 'IC-8':
        processedData = processTableauRangBIC8(data);
        break;
      case 'IC-9':
        processedData = processTableauRangBIC9(data);
        break;
      case 'IC-10':
        processedData = processTableauRangBIC10(data);
        break;
      case 'OIC-010-03-B':
        processedData = processTableauRangBOIC010(data);
        break;
      default:
        processedData = {
          lignesEnrichies: [],
          colonnesUtiles: [],
          theme: 'Rang B - Données non traitées',
          isRangB: true,
          expertiseLevel: 'unknown'
        };
        break;
    }
  } catch {
    return <p>Erreur lors du traitement des données.</p>;
  }

  const { lignesEnrichies, colonnesUtiles, theme } = processedData;

  return (
    <div className="w-full space-y-6">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={itemCode}
        totalCompetences={lignesEnrichies.length}
        isRangB={true}
      />
      <TableauRangAGrid 
        colonnesUtiles={colonnesUtiles} 
        lignesEnrichies={lignesEnrichies} 
      />
    </div>
  );
};
