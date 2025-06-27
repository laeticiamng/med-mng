
import { TableauRangAHeader } from './tableau/TableauRangAHeader';
import { TableauRangAGrid } from './tableau/TableauRangAGrid';
import { TableauRangAFooter } from './tableau/TableauRangAFooter';
import { generateLignesRangAIntelligent, determinerColonnesUtiles } from './tableau/TableauRangAUtils';

interface TableauRangAProps {
  data: {
    theme: string;
    colonnes: string[];
    lignes: string[][];
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  console.log('TableauRangA component - Received data:', data);
  
  // Vérifications de sécurité
  if (!data || !data.colonnes || !data.lignes) {
    console.error('TableauRangA: Invalid data structure', data);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Structure de données invalide</p>
      </div>
    );
  }

  // Créer les lignes enrichies avec contenu pédagogique intelligent
  const lignesEnrichies = generateLignesRangAIntelligent(data);

  // Déterminer les colonnes pertinentes selon le contenu
  const colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);

  console.log('TableauRangA: Rendering card-based layout with', colonnesUtiles.length, 'columns and', lignesEnrichies.length, 'concepts');
  
  return (
    <div className="space-y-6 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
      <TableauRangAHeader theme={data.theme} />
      <TableauRangAGrid colonnesUtiles={colonnesUtiles} lignesEnrichies={lignesEnrichies} />
      <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />
    </div>
  );
};
