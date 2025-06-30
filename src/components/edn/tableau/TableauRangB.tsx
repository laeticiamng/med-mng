import React from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { processTableauRangBUtilsIC4Integration } from './TableauRangBUtilsIC4Integration';
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

interface Colonne {
  nom: string;
  description: string;
}

interface ProcessedData {
  lignesEnrichies: string[][];
  colonnesUtiles: Colonne[];
  theme: string;
  isRangB: boolean;
  expertiseLevel: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  console.log(`TableauRangB - itemCode: ${itemCode}`);

  if (!data) {
    console.warn('TableauRangB - Pas de données fournies.');
    return <p>Pas de données disponibles pour le Rang B.</p>;
  }

  let processedData;
  
  try {
    switch (itemCode) {
      case 'IC-4':
        processedData = processTableauRangBUtilsIC4Integration(data);
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
  const colonnes = colonnesUtiles.map(col => col.nom);
  const lignes = lignesEnrichies;

  return (
    <div className="w-full space-y-6">
      <TableauRangAHeader theme={theme} />
      <TableauRangAGrid colonnes={colonnes} lignes={lignes} />
    </div>
  );
};
