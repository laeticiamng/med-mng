
import React from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
import { TableauRangAFooterIC1 } from './TableauRangAFooterIC1';
import { TableauRangAFooterIC2 } from './TableauRangAFooterIC2';
import { TableauRangAFooterIC3 } from './TableauRangAFooterIC3';
import { TableauRangAFooterIC4 } from './TableauRangAFooterIC4';
import { TableauRangAFooterIC5 } from './TableauRangAFooterIC5';
import { TableauRangAFooterIC6 } from './TableauRangAFooterIC6';
import { TableauRangAFooterIC7 } from './TableauRangAFooterIC7';
import { TableauRangAFooterIC8 } from './TableauRangAFooterIC8';
import { TableauRangAFooterIC9 } from './TableauRangAFooterIC9';
import { TableauRangAFooterIC10 } from './TableauRangAFooterIC10';
import { TableauRangAFooterOIC010 } from './TableauRangAFooterOIC010';

interface TableauRangAProps {
  data: any;
  itemCode: string;
}

interface Colonne {
  nom: string;
  description: string;
}

interface Ligne {
  [key: string]: string;
}

export const TableauRangA: React.FC<TableauRangAProps> = ({ data, itemCode }) => {
  const theme = data?.theme || "Thème non défini";
  const colonnesData = data?.colonnes || [];
  const lignesData = data?.lignes || [];

  const colonnes: Colonne[] = colonnesData.map((col: any) => ({
    nom: col.nom || 'N/A',
    description: col.description || 'N/A',
  }));

  const lignes: Ligne[] = lignesData.map((ligneData: any) => {
    const ligne: Ligne = {};
    colonnesData.forEach((col: any, index: number) => {
      ligne[col.nom] = ligneData[index] || '';
    });
    return ligne;
  });

  // Transformation des données pour le nouveau format
  const colonnesUtiles = colonnes;
  const lignesEnrichies = lignes.map(ligne => Object.values(ligne));

  const renderSpecificFooter = () => {
    const colonnesCount = colonnes.length;
    const lignesCount = lignes.length;

    switch (itemCode) {
      case 'IC-1':
        return <TableauRangAFooterIC1 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-2':
        return <TableauRangAFooterIC2 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-3':
        return <TableauRangAFooterIC3 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-4':
        return <TableauRangAFooterIC4 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-5':
        return <TableauRangAFooterIC5 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-6':
        return <TableauRangAFooterIC6 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-7':
        return <TableauRangAFooterIC7 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-8':
        return <TableauRangAFooterIC8 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-9':
        return <TableauRangAFooterIC9 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-10':
        return <TableauRangAFooterIC10 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'OIC-010-03-B':
        return <TableauRangAFooterOIC010 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      default:
        return <TableauRangAFooter colonnesCount={colonnesCount} lignesCount={lignesCount} />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={itemCode}
        totalCompetences={lignes.length}
      />
      <TableauRangAGrid 
        colonnesUtiles={colonnesUtiles} 
        lignesEnrichies={lignesEnrichies} 
      />
      {renderSpecificFooter()}
    </div>
  );
};
