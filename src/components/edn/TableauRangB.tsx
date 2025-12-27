import React from 'react';
import { TableauCompetencesOICWithRealData } from './tableau/TableauCompetencesOICWithRealData';

interface TableauRangBProps {
  data: any;
  itemCode: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  // TOUJOURS utiliser les vraies compétences de la base de données
  return <TableauCompetencesOICWithRealData itemCode={itemCode} rang="B" />;
};
