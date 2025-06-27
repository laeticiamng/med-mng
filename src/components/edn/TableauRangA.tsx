
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangAHeader } from './tableau/TableauRangAHeader';
import { TableauRangAGrid } from './tableau/TableauRangAGrid';
import { TableauRangAFooter } from './tableau/TableauRangAFooter';
import { TableauRangAFooterIC1 } from './tableau/TableauRangAFooterIC1';
import { TableauRangAFooterIC4 } from './tableau/TableauRangAFooterIC4';
import { processTableauRangAIC1, isIC1Item } from './tableau/TableauRangAUtilsIC1Integration';
import { processTableauRangAIC4, isIC4Item } from './tableau/TableauRangAUtilsIC4Integration';
import { determinerColonnesUtiles, generateLignesRangAIntelligent } from './tableau/TableauRangAUtils';

interface TableauRangAProps {
  data: {
    theme?: string;
    title?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  console.log('TableauRangA - Received data:', data);

  if (!data) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Aucune donnée disponible</p>
      </div>
    );
  }

  // Déterminer le type d'item et traiter les données en conséquence
  let lignesEnrichies: string[][];
  let colonnesUtiles: any[];
  let theme: string;
  let footerComponent: JSX.Element;

  if (isIC1Item(data)) {
    const processed = processTableauRangAIC1(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC1 />;
  } else if (isIC4Item(data)) {
    const processed = processTableauRangAIC4(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC4 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else {
    // Traitement générique pour les autres items
    lignesEnrichies = generateLignesRangAIntelligent(data);
    colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);
    theme = data.theme || data.title || 'Tableau Rang A';
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  }

  console.log('TableauRangA - Processed data:', {
    theme,
    colonnesUtiles: colonnesUtiles.length,
    lignesEnrichies: lignesEnrichies.length
  });

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-xl">
      <TableauRangAHeader theme={theme} />
      
      {lignesEnrichies.length > 0 ? (
        <>
          <TableauRangAGrid 
            colonnesUtiles={colonnesUtiles}
            lignesEnrichies={lignesEnrichies}
          />
          {footerComponent}
        </>
      ) : (
        <Card className="p-8 text-center bg-white/50 backdrop-blur-sm border-amber-200">
          <p className="text-amber-700 text-lg">
            Les concepts de ce tableau sont en cours de traitement...
          </p>
          <Badge variant="outline" className="mt-4 text-amber-600 border-amber-300">
            Contenu en développement
          </Badge>
        </Card>
      )}
    </div>
  );
};
