import { TableauCompetencesOICWithRealData } from './tableau/TableauCompetencesOICWithRealData';

interface TableauSection {
  title?: string;
  content?: string;
  keywords?: string[];
  concepts?: unknown[];
  competences?: unknown[];
}

interface TableauRangAProps {
  _data?: {
    theme?: string;
    title?: string;
    subtitle?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: TableauSection[];
  };
  itemCode?: string;
}

export const TableauRangA = ({ itemCode }: TableauRangAProps) => {
  // TOUJOURS utiliser les vraies compétences de la base de données
  // Les fichiers *Integration.ts avec données hardcodées sont obsolètes
  const code = itemCode || "IC-1";
  return <TableauCompetencesOICWithRealData itemCode={code} rang="A" />;
};
