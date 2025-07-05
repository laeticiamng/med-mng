import React from 'react';
import { TableauCompetencesOIC } from './TableauCompetencesOIC';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
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
  console.log('🔍 TableauRangB - données reçues:', { data, itemCode });

  // Vérifier si on a des données
  if (!data) {
    console.warn('TableauRangB - Pas de données fournies.');
    return <p>Pas de données disponibles pour le Rang B.</p>;
  }

  // Nouveau format avec compétences OIC
  if (data.competences && Array.isArray(data.competences)) {
    console.log('✅ Format OIC détecté pour Rang B, utilisation du nouveau composant');
    return (
      <TableauCompetencesOIC 
        data={data} 
        itemCode={itemCode} 
        rang="B" 
      />
    );
  }

  // Ancien format avec processeurs spécialisés (fallback)
  console.log('⚠️ Format ancien détecté pour Rang B, utilisation des processeurs spécialisés');
  
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
        console.warn(`TableauRangB - Code item non supporté: ${itemCode}`);
        processedData = {
          lignesEnrichies: [],
          colonnesUtiles: [],
          theme: 'Rang B - Données non traitées',
          isRangB: true,
          expertiseLevel: 'unknown'
        };
        break;
    }
  } catch (error) {
    console.error("Erreur lors du traitement des données Rang B:", error);
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
