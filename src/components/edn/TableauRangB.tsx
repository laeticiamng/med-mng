import React from 'react';
import { TableauCompetencesOICWithRealData } from './tableau/TableauCompetencesOICWithRealData';

interface TableauRangData {
  sections?: Array<{
    title?: string;
    content?: string;
    keywords?: string[];
    concepts?: unknown[];
    competences?: unknown[];
  }>;
  competences_cles?: unknown[];
}

interface TableauRangBProps {
  _data?: TableauRangData;
  itemCode?: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ itemCode }) => {
  // TOUJOURS utiliser les vraies compétences de la base de données
  const code = itemCode || "IC-1";
  return <TableauCompetencesOICWithRealData itemCode={code} rang="B" />;
};
