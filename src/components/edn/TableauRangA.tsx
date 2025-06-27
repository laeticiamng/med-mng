
import { TableauRangAHeader } from './tableau/TableauRangAHeader';
import { TableauRangAGrid } from './tableau/TableauRangAGrid';
import { TableauRangAFooter } from './tableau/TableauRangAFooter';
import { TableauRangAFooterIC4 } from './tableau/TableauRangAFooterIC4';
import { generateLignesRangAIntelligent, determinerColonnesUtiles } from './tableau/TableauRangAUtils';
import { generateLignesRangAWithIC4, determinerColonnesUtilesWithIC4, isIC4Item } from './tableau/TableauRangAUtilsIC4Integration';

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

  // Détecter si c'est IC-4 et utiliser les données spécifiques
  const isIC4 = isIC4Item(data);
  
  // Créer les lignes enrichies avec contenu pédagogique intelligent
  const lignesEnrichies = isIC4 ? 
    generateLignesRangAWithIC4(data) : 
    generateLignesRangAIntelligent(data);

  // Déterminer les colonnes pertinentes selon le contenu
  const colonnesUtiles = isIC4 ? 
    determinerColonnesUtilesWithIC4(lignesEnrichies, data) :
    determinerColonnesUtiles(lignesEnrichies);

  console.log('TableauRangA: Rendering', isIC4 ? 'IC-4 specialized' : 'standard', 'layout with', colonnesUtiles.length, 'columns and', lignesEnrichies.length, 'concepts');
  
  return (
    <div className="space-y-6 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
      <TableauRangAHeader theme={data.theme} />
      <TableauRangAGrid colonnesUtiles={colonnesUtiles} lignesEnrichies={lignesEnrichies} />
      {isIC4 ? (
        <TableauRangAFooterIC4 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />
      ) : (
        <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />
      )}
    </div>
  );
};
