import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauCompetencesOICWithRealData } from './tableau/TableauCompetencesOICWithRealData';

interface TableauRangAProps {
  data: {
    theme?: string;
    title?: string;
    subtitle?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
  };
  itemCode?: string;
}

export const TableauRangA = ({ data, itemCode = "IC-X" }: TableauRangAProps) => {
  // TOUJOURS utiliser les vraies compétences de la base de données
  // Les fichiers *Integration.ts avec données hardcodées sont obsolètes
  return <TableauCompetencesOICWithRealData itemCode={itemCode} rang="A" />;
};
