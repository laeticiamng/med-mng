import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauCompetencesOICWithRealData } from './tableau/TableauCompetencesOICWithRealData';

interface TableauSection {
  title?: string;
  content?: string;
  keywords?: string[];
  concepts?: unknown[];
  competences?: unknown[];
}

interface TableauRangAProps {
  data: {
    theme?: string;
    title?: string;
    subtitle?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: TableauSection[];
  };
  itemCode?: string;
}

export const TableauRangA = ({ data, itemCode }: TableauRangAProps) => {
  // TOUJOURS utiliser les vraies compétences de la base de données
  // Les fichiers *Integration.ts avec données hardcodées sont obsolètes
  const code = itemCode || "IC-1";
  return <TableauCompetencesOICWithRealData itemCode={code} rang="A" />;
};
