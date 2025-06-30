
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
import { processTableauRangBIC4, isIC4RangBItem } from './TableauRangBUtilsIC4Integration';
import { processTableauRangBIC6 } from './TableauRangBUtilsIC6Integration';
import { processTableauRangBIC7 } from './TableauRangBUtilsIC7Integration';
import { processTableauRangBIC8 } from './TableauRangBUtilsIC8Integration';
import { processTableauRangBIC9 } from './TableauRangBUtilsIC9Integration';
import { processTableauRangBIC10 } from './TableauRangBUtilsIC10Integration';
import { processTableauRangBOIC010 } from './TableauRangBUtilsOIC010Integration';
import { processStandardTableauData } from './TableauRangAUtilsStandard';
import { determinerColonnesUtiles, generateLignesRangAIntelligent } from './TableauRangAUtils';

interface TableauRangBProps {
  data: {
    theme?: string;
    title?: string;
    item_code?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
    tableau_rang_b?: any;
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  console.log('🔍 TableauRangB - Données reçues:', data);

  if (!data) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang B</h2>
        <p className="text-amber-700">Aucune donnée disponible</p>
      </div>
    );
  }

  // Déterminer le type d'item et traiter les données en conséquence
  let lignesEnrichies: string[][];
  let colonnesUtiles: any[];
  let theme: string;
  let footerComponent: JSX.Element;

  if (isIC4RangBItem(data)) {
    console.log('✅ Item IC-4 Rang B détecté');
    const processed = processTableauRangBIC4(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
    />;
  } else if (data?.item_code === 'IC-6') {
    console.log('✅ Item IC-6 Rang B détecté');
    const processed = processTableauRangBIC6(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (data?.item_code === 'IC-7') {
    console.log('✅ Item IC-7 Rang B détecté');
    const processed = processTableauRangBIC7(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (data?.item_code === 'IC-8') {
    console.log('✅ Item IC-8 Rang B détecté');
    const processed = processTableauRangBIC8(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (data?.item_code === 'IC-9') {
    console.log('✅ Item IC-9 Rang B détecté');
    const processed = processTableauRangBIC9(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (data?.item_code === 'IC-10') {
    console.log('✅ Item IC-10 Rang B détecté');
    const processed = processTableauRangBIC10(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (data?.item_code === 'OIC-010-03-B') {
    console.log('✅ Item OIC-010-03-B Rang B détecté');
    const processed = processTableauRangBOIC010(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else {
    // Traitement standard avec les nouvelles données JSON de Supabase
    console.log('📋 Traitement standard Rang B pour:', data?.item_code);
    const processed = processStandardTableauData(data, true);
    if (processed) {
      lignesEnrichies = processed.lignesEnrichies;
      colonnesUtiles = processed.colonnesUtiles;
      theme = processed.theme;
    } else {
      // Fallback vers l'ancienne méthode si pas de données JSON
      lignesEnrichies = generateLignesRangAIntelligent(data);
      colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);
      theme = data.theme || data.title || 'Tableau Rang B';
    }
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  }

  console.log('📊 TableauRangB - Données traitées:', {
    theme,
    colonnesUtiles: colonnesUtiles.length,
    lignesEnrichies: lignesEnrichies.length
  });

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={data?.item_code || 'IC-X'} 
        totalCompetences={lignesEnrichies.length} 
      />
      
      {lignesEnrichies.length > 0 ? (
        <>
          <TableauRangAGrid 
            colonnesUtiles={colonnesUtiles}
            lignesEnrichies={lignesEnrichies}
          />
          {footerComponent}
        </>
      ) : (
        <Card className="p-8 text-center bg-white/50 backdrop-blur-sm border-blue-200">
          <p className="text-blue-700 text-lg">
            Les concepts de ce tableau sont en cours de traitement...
          </p>
          <Badge variant="outline" className="mt-4 text-blue-600 border-blue-300">
            Contenu en développement
          </Badge>
        </Card>
      )}
    </div>
  );
};
